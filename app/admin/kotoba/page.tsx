"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

type Kotoba = {
  id: string;
  kanjiKana: string;
  furigana: string | null;
  romaji: string | null;
  arti: string;
  contohKalimat: string | null;
  level: string;
};

const emptyForm = { kanjiKana: "", furigana: "", romaji: "", arti: "", contohKalimat: "", level: "N5", bab: "" };

export default function AdminKotobaPage() {
  const [list, setList] = useState<Kotoba[]>([]);
  const [form, setForm] = useState(emptyForm);

  async function loadList() {
    const res = await fetch("/api/kotoba");
    setList(await res.json());
  }

  useEffect(() => {
    loadList();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/kotoba", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, bab: form.bab ? Number(form.bab) : undefined }),
    });
    setForm(emptyForm);
    loadList();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/kotoba/${id}`, { method: "DELETE" });
    loadList();
  }

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <PageHeader title="Manajemen Kotoba" />

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-2 gap-3 rounded-xl border p-4">
        <input placeholder="Kanji/Kana" value={form.kanjiKana}
          onChange={(e) => setForm({ ...form, kanjiKana: e.target.value })}
          className="rounded-lg border p-2" required />
        <input placeholder="Furigana" value={form.furigana}
          onChange={(e) => setForm({ ...form, furigana: e.target.value })}
          className="rounded-lg border p-2" />
        <input placeholder="Romaji" value={form.romaji}
          onChange={(e) => setForm({ ...form, romaji: e.target.value })}
          className="rounded-lg border p-2" />
        <input placeholder="Arti" value={form.arti}
          onChange={(e) => setForm({ ...form, arti: e.target.value })}
          className="rounded-lg border p-2" required />
        <input placeholder="Contoh kalimat" value={form.contohKalimat}
          onChange={(e) => setForm({ ...form, contohKalimat: e.target.value })}
          className="col-span-2 rounded-lg border p-2" />
        <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
          className="rounded-lg border p-2">
          {["N5", "N4", "N3", "N2", "N1"].map((lvl) => <option key={lvl}>{lvl}</option>)}
        </select>
        <input placeholder="Bab (Minna no Nihongo)" type="number" value={form.bab}
          onChange={(e) => setForm({ ...form, bab: e.target.value })}
          className="rounded-lg border p-2" />
        <button className="rounded-lg bg-slate-900 py-2 text-white">Tambah Kartu</button>
      </form>

      <div className="space-y-2">
        {list.map((k) => (
          <div key={k.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <span className="text-xl font-medium">{k.kanjiKana}</span>{" "}
              <span className="text-slate-400">({k.furigana})</span> — {k.arti}
              <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs">{k.level}</span>
              {(k as any).bab && <span className="ml-1 rounded bg-blue-50 px-2 py-0.5 text-xs">Bab {(k as any).bab}</span>}
            </div>
            <button onClick={() => handleDelete(k.id)} className="text-sm text-red-600">
              Hapus
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
