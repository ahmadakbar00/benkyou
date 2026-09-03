"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

type Kanji = {
  id: string; karakter: string; onyomi: string | null; kunyomi: string | null;
  arti: string; level: string; bab: number | null;
};

const emptyForm = { karakter: "", onyomi: "", kunyomi: "", arti: "", level: "N5", bab: "" };

export default function AdminKanjiPage() {
  const [list, setList] = useState<Kanji[]>([]);
  const [form, setForm] = useState(emptyForm);

  async function loadList() {
    const res = await fetch("/api/kanji");
    setList(await res.json());
  }

  useEffect(() => { loadList(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/kanji", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, bab: form.bab ? Number(form.bab) : undefined }),
    });
    setForm(emptyForm);
    loadList();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/kanji/${id}`, { method: "DELETE" });
    loadList();
  }

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <PageHeader title="Manajemen Kanji" />

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-2 gap-3 rounded-xl border p-4">
        <input placeholder="Karakter (mis. 食)" value={form.karakter}
          onChange={(e) => setForm({ ...form, karakter: e.target.value })}
          className="rounded-lg border p-2" required />
        <input placeholder="Arti" value={form.arti}
          onChange={(e) => setForm({ ...form, arti: e.target.value })}
          className="rounded-lg border p-2" required />
        <input placeholder="On'yomi (mis. ショク)" value={form.onyomi}
          onChange={(e) => setForm({ ...form, onyomi: e.target.value })}
          className="rounded-lg border p-2" />
        <input placeholder="Kun'yomi (mis. た.べる)" value={form.kunyomi}
          onChange={(e) => setForm({ ...form, kunyomi: e.target.value })}
          className="rounded-lg border p-2" />
        <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
          className="rounded-lg border p-2">
          {["N5", "N4", "N3", "N2", "N1"].map((lvl) => <option key={lvl}>{lvl}</option>)}
        </select>
        <input placeholder="Bab (Minna no Nihongo)" type="number" value={form.bab}
          onChange={(e) => setForm({ ...form, bab: e.target.value })}
          className="rounded-lg border p-2" />
        <button className="col-span-2 rounded-lg bg-slate-900 py-2 text-white">Tambah Kanji</button>
      </form>

      <div className="space-y-2">
        {list.map((k) => (
          <div key={k.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <span className="text-2xl font-medium">{k.karakter}</span>{" "}
              <span className="text-sm text-slate-400">{[k.onyomi, k.kunyomi].filter(Boolean).join(" / ")}</span>
              {" — "}{k.arti}
              <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs">{k.level}</span>
              {k.bab && <span className="ml-1 rounded bg-blue-50 px-2 py-0.5 text-xs">Bab {k.bab}</span>}
            </div>
            <button onClick={() => handleDelete(k.id)} className="text-sm text-red-600">Hapus</button>
          </div>
        ))}
      </div>
    </main>
  );
}
