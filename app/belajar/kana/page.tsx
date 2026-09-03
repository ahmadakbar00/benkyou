"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

type Kana = { id: string; karakter: string; romaji: string; jenis: "HIRAGANA" | "KATAKANA"; kategori: "BASIC" | "DAKUTEN" | "HANDAKUTEN" };
type QuizMode = "pilihan_ganda" | "teks_romaji" | "teks_kana";
type Stage = "tabel" | "settings" | "session" | "summary";

const SUMBER_OPSI = [
  { key: "hiragana_murni", label: "Hiragana Murni (dasar)", jenis: "HIRAGANA", kategori: ["BASIC"] },
  { key: "hiragana_imbuhan", label: "Hiragana + Imbuhan (dakuten/handakuten)", jenis: "HIRAGANA", kategori: ["DAKUTEN", "HANDAKUTEN"] },
  { key: "katakana_murni", label: "Katakana Murni (dasar)", jenis: "KATAKANA", kategori: ["BASIC"] },
  { key: "katakana_imbuhan", label: "Katakana + Imbuhan (dakuten/handakuten)", jenis: "KATAKANA", kategori: ["DAKUTEN", "HANDAKUTEN"] },
] as const;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export default function KanaPage() {
  const [allKana, setAllKana] = useState<Kana[]>([]);
  const [stage, setStage] = useState<Stage>("tabel");

  // pengaturan sesi
  const [selectedSumber, setSelectedSumber] = useState<string[]>(["hiragana_murni"]);
  const [mode, setMode] = useState<QuizMode>("pilihan_ganda");
  const [jumlahSoal, setJumlahSoal] = useState<number | "semua">(10);

  // state sesi berjalan
  const [pool, setPool] = useState<Kana[]>([]);
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<Kana[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<{ benar: boolean; text: string } | null>(null);
  const [skor, setSkor] = useState({ benar: 0, salah: 0 });

  useEffect(() => {
    fetch("/api/kana").then((r) => r.json()).then(setAllKana);
  }, []);

  function toggleSumber(key: string) {
    setSelectedSumber((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }

  function buildPool(): Kana[] {
    const aktif = SUMBER_OPSI.filter((s) => selectedSumber.includes(s.key));
    const result = allKana.filter((k) =>
      aktif.some((s) => s.jenis === k.jenis && (s.kategori as readonly string[]).includes(k.kategori))
    );
    const acak = shuffle(result);
    return jumlahSoal === "semua" ? acak : acak.slice(0, jumlahSoal);
  }

  function mulaiSesi() {
    const p = buildPool();
    setPool(p);
    setIndex(0);
    setSkor({ benar: 0, salah: 0 });
    setInputValue("");
    setFeedback(null);
    if (mode === "pilihan_ganda") setChoices(buatPilihan(p, 0, allKana));
    setStage("session");
  }

  function buatPilihan(p: Kana[], idx: number, sumber: Kana[]): Kana[] {
    if (p.length === 0) return [];
    const benar = p[idx];
    const kandidat = sumber.filter((k) => k.id !== benar.id);
    const salah = shuffle(kandidat).slice(0, 3);
    return shuffle([benar, ...salah]);
  }

  async function submitProgress(k: Kana, benar: boolean) {
    await fetch("/api/kana-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ karakter: k.karakter, jenis: k.jenis, benar }),
    }).catch(() => {});
  }

  function lanjutSoal() {
    const next = index + 1;
    setInputValue("");
    setFeedback(null);
    if (next >= pool.length) {
      setStage("summary");
      return;
    }
    setIndex(next);
    if (mode === "pilihan_ganda") setChoices(buatPilihan(pool, next, allKana));
  }

  async function jawabPilihanGanda(pilihan: Kana) {
    const soal = pool[index];
    const benar = pilihan.id === soal.id;
    setFeedback({ benar, text: benar ? `Benar! ${soal.karakter} = ${soal.romaji}` : `Salah, jawaban: ${soal.romaji}` });
    setSkor((s) => (benar ? { ...s, benar: s.benar + 1 } : { ...s, salah: s.salah + 1 }));
    await submitProgress(soal, benar);
    setTimeout(lanjutSoal, 900);
  }

  async function jawabTeks(e: React.FormEvent) {
    e.preventDefault();
    const soal = pool[index];
    const target = mode === "teks_romaji" ? soal.romaji : soal.karakter;
    const benar = normalize(inputValue) === normalize(target);
    setFeedback({ benar, text: benar ? "Benar!" : `Salah, jawaban: ${target}` });
    setSkor((s) => (benar ? { ...s, benar: s.benar + 1 } : { ...s, salah: s.salah + 1 }));
    await submitProgress(soal, benar);
    setTimeout(lanjutSoal, 1000);
  }

  const totalSoal = pool.length;
  const persentase = totalSoal > 0 ? Math.round((skor.benar / totalSoal) * 100) : 0;

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-8">
      <PageHeader title="Belajar Kana" />

      <div className="mb-6 flex gap-2 text-sm">
        <button onClick={() => setStage("tabel")}
          className={`rounded-lg px-4 py-1 ${stage === "tabel" ? "bg-slate-700 text-white" : "border"}`}>
          Tabel Referensi
        </button>
        <button onClick={() => setStage("settings")}
          className={`rounded-lg px-4 py-1 ${stage === "settings" || stage === "session" || stage === "summary" ? "bg-slate-700 text-white" : "border"}`}>
          Kuis
        </button>
      </div>

      {stage === "tabel" && <TabelReferensi allKana={allKana} />}

      {stage === "settings" && (
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 font-semibold">Pilih materi yang disertakan</h3>
            <div className="space-y-2">
              {SUMBER_OPSI.map((opt) => (
                <label key={opt.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSumber.includes(opt.key)}
                    onChange={() => toggleSumber(opt.key)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Mode Kuis</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              {[
                { key: "pilihan_ganda", label: "Pilihan Ganda" },
                { key: "teks_romaji", label: "Ketik Romaji (lihat kana)" },
                { key: "teks_kana", label: "Ketik Kana (lihat romaji)" },
              ].map((m) => (
                <button key={m.key} onClick={() => setMode(m.key as QuizMode)}
                  className={`rounded-lg px-3 py-1 ${mode === m.key ? "bg-slate-900 text-white" : "border"}`}>
                  {m.label}
                </button>
              ))}
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

          <button
            onClick={mulaiSesi}
            disabled={selectedSumber.length === 0}
            className="w-full rounded-lg bg-green-600 py-2 font-semibold text-white disabled:opacity-40"
          >
            Mulai Sesi
          </button>
        </div>
      )}

      {stage === "session" && pool.length > 0 && (
        <div className="flex flex-col items-center gap-5">
          <p className="text-sm text-slate-400">Soal {index + 1} dari {pool.length}</p>

          {mode === "pilihan_ganda" && (
            <>
              <div className="text-7xl">{pool[index].karakter}</div>
              <div className="grid grid-cols-2 gap-3">
                {choices.map((c) => (
                  <button key={c.id} onClick={() => jawabPilihanGanda(c)}
                    className="rounded-lg border px-6 py-2 text-lg hover:bg-slate-100">
                    {c.romaji}
                  </button>
                ))}
              </div>
            </>
          )}

          {mode !== "pilihan_ganda" && (
            <form onSubmit={jawabTeks} className="flex w-full max-w-xs flex-col items-center gap-3">
              <div className="text-7xl">{mode === "teks_romaji" ? pool[index].karakter : pool[index].romaji}</div>
              <input
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={mode === "teks_romaji" ? "ketik romaji..." : "ketik kana..."}
                className="w-full rounded-lg border p-2 text-center text-xl"
              />
              <button className="w-full rounded-lg bg-slate-900 py-2 text-white">Jawab</button>
            </form>
          )}

          {feedback && (
            <p className={`font-medium ${feedback.benar ? "text-green-600" : "text-red-600"}`}>{feedback.text}</p>
          )}
        </div>
      )}

      {stage === "summary" && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <h2 className="text-2xl font-bold">Sesi Selesai!</h2>
          <p className="text-lg">
            Benar <span className="font-bold text-green-600">{skor.benar}</span> / Salah{" "}
            <span className="font-bold text-red-600">{skor.salah}</span>
          </p>
          <p className="text-4xl font-bold">{persentase}%</p>
          <button onClick={() => setStage("settings")} className="mt-4 rounded-lg bg-slate-900 px-6 py-2 text-white">
            Mulai Sesi Baru
          </button>
        </div>
      )}
    </main>
  );
}

function TabelReferensi({ allKana }: { allKana: Kana[] }) {
  const [jenis, setJenis] = useState<"HIRAGANA" | "KATAKANA">("HIRAGANA");
  const group = (kategori: string) => allKana.filter((k) => k.jenis === jenis && k.kategori === kategori);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["HIRAGANA", "KATAKANA"] as const).map((j) => (
          <button key={j} onClick={() => setJenis(j)}
            className={`rounded-lg px-4 py-1 ${jenis === j ? "bg-slate-900 text-white" : "border"}`}>
            {j === "HIRAGANA" ? "ひらがな" : "カタカナ"}
          </button>
        ))}
      </div>
      {[
        { label: "Dasar (Gojuon)", kategori: "BASIC" },
        { label: "Dakuten — ゛", kategori: "DAKUTEN" },
        { label: "Handakuten — ゜", kategori: "HANDAKUTEN" },
      ].map((g) => (
        <div key={g.kategori} className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-slate-500">{g.label}</h3>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {group(g.kategori).map((k) => (
              <div key={k.id} className="rounded-lg border p-3 text-center">
                <div className="text-3xl">{k.karakter}</div>
                <div className="text-sm text-slate-500">{k.romaji}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
