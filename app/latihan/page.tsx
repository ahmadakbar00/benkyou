"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";

type MateriType = "KOTOBA" | "KANJI" | "GRAMMAR";
type Level = "N5" | "N4" | "N3" | "N2" | "N1";
type JawabMode = "teks" | "pilihan_ganda";
type WaktuMode = "bebas" | "per_soal" | "total_sesi";
type Stage = "settings" | "session" | "summary";

type Item = {
  materiType: MateriType;
  refId: string;
  level: Level;
  bab: number | null;
  tanya: string;
  jawaban: string;
  hint: string;
};

type Hasil = Item & { benar: boolean; responseMs: number };

const TIPE_LABEL: Record<MateriType, string> = { KOTOBA: "Kotoba", KANJI: "Kanji", GRAMMAR: "Grammar" };

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export default function LatihanPage() {
  const [stage, setStage] = useState<Stage>("settings");

  const [tipe, setTipe] = useState<MateriType[]>(["KOTOBA"]);
  const [level, setLevel] = useState<Level>("N5");
  const [meta, setMeta] = useState<Record<string, Record<string, number[]>>>({});
  const [selectedBab, setSelectedBab] = useState<number[]>([]);
  const [jumlahSoal, setJumlahSoal] = useState<number | "semua">(10);
  const [jawabMode, setJawabMode] = useState<JawabMode>("teks");
  const [waktuMode, setWaktuMode] = useState<WaktuMode>("bebas");
  const [batasDetikPerSoal, setBatasDetikPerSoal] = useState(15);
  const [batasMenitSesi, setBatasMenitSesi] = useState(5);

  const [pool, setPool] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [choices, setChoices] = useState<Item[]>([]);
  const [feedback, setFeedback] = useState<{ benar: boolean; text: string } | null>(null);
  const [hasilSesi, setHasilSesi] = useState<Hasil[]>([]);
  const [mulaiWaktuSoal, setMulaiWaktuSoal] = useState(0);
  const [sisaWaktuSesi, setSisaWaktuSesi] = useState(0);
  const [sisaWaktuSoal, setSisaWaktuSoal] = useState(0);

  useEffect(() => {
    fetch("/api/latihan/meta").then((r) => r.json()).then(setMeta);
  }, []);

  const babTersedia = useMemo(() => {
    const gabung = new Set<number>();
    for (const t of tipe) {
      const arr = meta[t]?.[level] || [];
      arr.forEach((b) => gabung.add(b));
    }
    return Array.from(gabung).sort((a, b) => a - b);
  }, [meta, tipe, level]);

  function toggleTipe(t: MateriType) {
    setTipe((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }
  function toggleBab(b: number) {
    setSelectedBab((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  }

  async function mulaiSesi() {
    const params = new URLSearchParams({
      tipe: tipe.join(","),
      level,
      jumlah: String(jumlahSoal),
    });
    if (selectedBab.length > 0) params.set("bab", selectedBab.join(","));

    const res = await fetch(`/api/latihan?${params.toString()}`);
    const data: Item[] = await res.json();

    setPool(data);
    setIndex(0);
    setHasilSesi([]);
    setInputValue("");
    setFeedback(null);
    setMulaiWaktuSoal(performance.now());
    if (waktuMode === "total_sesi") setSisaWaktuSesi(batasMenitSesi * 60);
    if (waktuMode === "per_soal") setSisaWaktuSoal(batasDetikPerSoal);
    if (jawabMode === "pilihan_ganda") setChoices(buatPilihan(data, 0));
    setStage("session");
  }

  function buatPilihan(p: Item[], idx: number): Item[] {
    if (p.length === 0) return [];
    const benar = p[idx];
    const kandidat = p.filter((_, i) => i !== idx);
    const salah = [...kandidat].sort(() => Math.random() - 0.5).slice(0, 3);
    return [benar, ...salah].sort(() => Math.random() - 0.5);
  }

  // countdown untuk mode batas waktu total sesi
  useEffect(() => {
    if (stage !== "session" || waktuMode !== "total_sesi") return;
    if (sisaWaktuSesi <= 0) {
      selesaikanSesi();
      return;
    }
    const t = setTimeout(() => setSisaWaktuSesi((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, waktuMode, sisaWaktuSesi]);

  // countdown per soal -> kalau habis, otomatis dihitung salah lalu lanjut
  useEffect(() => {
    if (stage !== "session" || waktuMode !== "per_soal" || feedback) return;
    if (sisaWaktuSoal <= 0) {
      const soal = pool[index];
      setFeedback({ benar: false, text: `Waktu habis. Jawaban: ${soal.jawaban}` });
      catatJawaban(soal, false).then(() => setTimeout(soalBerikutnya, 900));
      return;
    }
    const t = setTimeout(() => setSisaWaktuSoal((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, waktuMode, sisaWaktuSoal, feedback]);

  async function catatJawaban(soal: Item, benar: boolean) {
    const responseMs = Math.round(performance.now() - mulaiWaktuSoal);
    setHasilSesi((h) => [...h, { ...soal, benar, responseMs }]);
    await fetch("/api/latihan/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        materiType: soal.materiType, refId: soal.refId, level: soal.level, bab: soal.bab, benar, responseMs,
      }),
    }).catch(() => {});
  }

  function soalBerikutnya() {
    const next = index + 1;
    setInputValue("");
    setFeedback(null);
    if (next >= pool.length) {
      selesaikanSesi();
      return;
    }
    setIndex(next);
    setMulaiWaktuSoal(performance.now());
    if (waktuMode === "per_soal") setSisaWaktuSoal(batasDetikPerSoal);
    if (jawabMode === "pilihan_ganda") setChoices(buatPilihan(pool, next));
  }

  function selesaikanSesi() {
    setStage("summary");
  }

  async function jawabTeks(e: React.FormEvent) {
    e.preventDefault();
    const soal = pool[index];
    const benar = normalize(inputValue) === normalize(soal.jawaban);
    setFeedback({ benar, text: benar ? "Benar!" : `Kurang tepat. Jawaban: ${soal.jawaban}` });
    await catatJawaban(soal, benar);
    setTimeout(soalBerikutnya, 1100);
  }

  async function jawabPilihan(pilihan: Item) {
    const soal = pool[index];
    const benar = pilihan.refId === soal.refId;
    setFeedback({ benar, text: benar ? "Benar!" : `Kurang tepat. Jawaban: ${soal.jawaban}` });
    await catatJawaban(soal, benar);
    setTimeout(soalBerikutnya, 900);
  }

  // ---- Gap analysis: kelompokkan hasil per bab, hitung % salah ----
  const gapAnalysis = useMemo(() => {
    const grup: Record<string, { tipe: MateriType; bab: number | null; total: number; salah: number }> = {};
    for (const h of hasilSesi) {
      const key = `${h.materiType}-${h.bab ?? "tanpa-bab"}`;
      if (!grup[key]) grup[key] = { tipe: h.materiType, bab: h.bab, total: 0, salah: 0 };
      grup[key].total += 1;
      if (!h.benar) grup[key].salah += 1;
    }
    return Object.values(grup)
      .map((g) => ({ ...g, persenSalah: Math.round((g.salah / g.total) * 100) }))
      .filter((g) => g.salah > 0)
      .sort((a, b) => b.persenSalah - a.persenSalah);
  }, [hasilSesi]);

  const totalBenar = hasilSesi.filter((h) => h.benar).length;
  const totalSoal = hasilSesi.length;

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-8">
      <PageHeader title="Latihan JLPT" />

      {stage === "settings" && (
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 font-semibold">Tipe Materi</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              {(["KOTOBA", "KANJI", "GRAMMAR"] as MateriType[]).map((t) => (
                <button key={t} onClick={() => toggleTipe(t)}
                  className={`rounded-lg px-3 py-1 ${tipe.includes(t) ? "bg-slate-900 text-white" : "border"}`}>
                  {TIPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Level JLPT</h3>
            <div className="flex gap-2 text-sm">
              {(["N5", "N4", "N3", "N2", "N1"] as Level[]).map((l) => (
                <button key={l} onClick={() => { setLevel(l); setSelectedBab([]); }}
                  className={`rounded-lg px-3 py-1 ${level === l ? "bg-slate-900 text-white" : "border"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">
              Bab Minna no Nihongo <span className="font-normal text-slate-400">(kosongkan = campur semua bab yang jatuh tempo)</span>
            </h3>
            {babTersedia.length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada data bab untuk level/tipe ini.</p>
            ) : (
              <div className="flex flex-wrap gap-2 text-sm">
                {babTersedia.map((b) => (
                  <button key={b} onClick={() => toggleBab(b)}
                    className={`rounded-lg px-3 py-1 ${selectedBab.includes(b) ? "bg-blue-700 text-white" : "border"}`}>
                    Bab {b}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Mode Jawaban</h3>
            <div className="flex gap-2 text-sm">
              <button onClick={() => setJawabMode("teks")}
                className={`rounded-lg px-3 py-1 ${jawabMode === "teks" ? "bg-slate-900 text-white" : "border"}`}>
                Ketik Jawaban
              </button>
              <button onClick={() => setJawabMode("pilihan_ganda")}
                className={`rounded-lg px-3 py-1 ${jawabMode === "pilihan_ganda" ? "bg-slate-900 text-white" : "border"}`}>
                Pilihan Ganda
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Jumlah Soal</h3>
            <div className="flex gap-2 text-sm">
              {[10, 20, 50, "semua"].map((n) => (
                <button key={n} onClick={() => setJumlahSoal(n as number | "semua")}
                  className={`rounded-lg px-3 py-1 ${jumlahSoal === n ? "bg-slate-900 text-white" : "border"}`}>
                  {n === "semua" ? "Semua" : n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Batas Waktu</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button onClick={() => setWaktuMode("bebas")}
                className={`rounded-lg px-3 py-1 ${waktuMode === "bebas" ? "bg-slate-900 text-white" : "border"}`}>
                Tanpa Batas
              </button>
              <button onClick={() => setWaktuMode("per_soal")}
                className={`rounded-lg px-3 py-1 ${waktuMode === "per_soal" ? "bg-slate-900 text-white" : "border"}`}>
                Per Soal
              </button>
              {waktuMode === "per_soal" && (
                <input type="number" min={5} value={batasDetikPerSoal}
                  onChange={(e) => setBatasDetikPerSoal(Number(e.target.value))}
                  className="w-16 rounded-lg border p-1" />
              )}
              {waktuMode === "per_soal" && <span className="text-slate-400">detik</span>}

              <button onClick={() => setWaktuMode("total_sesi")}
                className={`rounded-lg px-3 py-1 ${waktuMode === "total_sesi" ? "bg-slate-900 text-white" : "border"}`}>
                Total Sesi
              </button>
              {waktuMode === "total_sesi" && (
                <input type="number" min={1} value={batasMenitSesi}
                  onChange={(e) => setBatasMenitSesi(Number(e.target.value))}
                  className="w-16 rounded-lg border p-1" />
              )}
              {waktuMode === "total_sesi" && <span className="text-slate-400">menit</span>}
            </div>
          </div>

          <button
            onClick={mulaiSesi}
            disabled={tipe.length === 0}
            className="w-full rounded-lg bg-green-600 py-2 font-semibold text-white disabled:opacity-40"
          >
            Mulai Sesi
          </button>
        </div>
      )}

      {stage === "session" && pool.length > 0 && (
        <div className="flex flex-col items-center gap-5">
          <div className="flex w-full max-w-sm items-center justify-between text-sm text-slate-400">
            <span>Soal {index + 1} dari {pool.length}</span>
            <span>{TIPE_LABEL[pool[index].materiType]}{pool[index].bab ? ` · Bab ${pool[index].bab}` : ""}</span>
            {waktuMode === "total_sesi" && <span>⏱ {sisaWaktuSesi}s</span>}
            {waktuMode === "per_soal" && <span>⏱ {sisaWaktuSoal}s</span>}
          </div>

          <div className="text-5xl font-bold">{pool[index].tanya}</div>

          {jawabMode === "teks" && (
            <form onSubmit={jawabTeks} className="flex w-full max-w-xs flex-col items-center gap-3">
              <input
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="ketik jawaban (arti)..."
                className="w-full rounded-lg border p-2 text-center text-lg"
              />
              <button className="w-full rounded-lg bg-slate-900 py-2 text-white">Jawab</button>
            </form>
          )}

          {jawabMode === "pilihan_ganda" && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {choices.map((c) => (
                <button key={c.refId} onClick={() => jawabPilihan(c)}
                  className="rounded-lg border px-4 py-2 text-left hover:bg-slate-100">
                  {c.jawaban}
                </button>
              ))}
            </div>
          )}

          {feedback && (
            <p className={`font-medium ${feedback.benar ? "text-green-600" : "text-red-600"}`}>{feedback.text}</p>
          )}
        </div>
      )}

      {stage === "summary" && (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <h2 className="text-2xl font-bold">Sesi Selesai!</h2>
            <p className="text-lg">
              Benar <span className="font-bold text-green-600">{totalBenar}</span> / Salah{" "}
              <span className="font-bold text-red-600">{totalSoal - totalBenar}</span>
            </p>
            <p className="text-4xl font-bold">
              {totalSoal > 0 ? Math.round((totalBenar / totalSoal) * 100) : 0}%
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Gap Analysis — Materi yang Perlu Diulang</h3>
            {gapAnalysis.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada bab dengan kesalahan signifikan. Kerja bagus!</p>
            ) : (
              <div className="space-y-2">
                {gapAnalysis.map((g, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {TIPE_LABEL[g.tipe]}{g.bab ? ` — Bab ${g.bab}` : " — tanpa bab"}
                      </span>
                      <span className="text-sm text-red-600">{g.persenSalah}% salah</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Salah {g.salah} dari {g.total} soal. Disarankan pelajari kembali Minna no Nihongo
                      {g.bab ? ` Bab ${g.bab}` : ""} untuk materi {TIPE_LABEL[g.tipe].toLowerCase()}.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setStage("settings")} className="w-full rounded-lg bg-slate-900 py-2 text-white">
            Mulai Sesi Baru
          </button>
        </div>
      )}
    </main>
  );
}
