"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

type Grammar = {
  id: string; pola: string; penjelasan: string; contohKalimat: string | null;
  arti: string | null; level: string; bab: number | null;
};

const emptyForm = { pola: "", penjelasan: "", contohKalimat: "", arti: "", level: "N5", bab: "" };

export default function AdminGrammarPage() {
  const [list, setList] = useState<Grammar[]>([]);
  const [form, setForm] = useState(emptyForm);

  async function loadList() {
    const res = await fetch("/api/grammar");
    setList(await res.json());
  }

  useEffect(() => { loadList(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/grammar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, bab: form.bab ? Number(form.bab) : undefined }),
    });
    setForm(emptyForm);
    loadList();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/grammar/${id}`, { method: "DELETE" });
    loadList();
  }

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <PageHeader title="Manajemen Grammar" />

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-2 gap-3 rounded-xl border p-4">
        <input placeholder="Pola (mis. 〜てください)" value={form.pola}
          onChange={(e) => setForm({ ...form, pola: e.target.value })}
          className="col-span-2 rounded-lg border p-2" required />
        <input placeholder="Penjelasan singkat" value={form.penjelasan}
          onChange={(e) => setForm({ ...form, penjelasan: e.target.value })}
          className="col-span-2 rounded-lg border p-2" required />
        <input placeholder="Contoh kalimat" value={form.contohKalimat}
          onChange={(e) => setForm({ ...form, contohKalimat: e.target.value })}
          className="col-span-2 rounded-lg border p-2" />
        <input placeholder="Arti singkat (dipakai sebagai jawaban kuis)" value={form.arti}
          onChange={(e) => setForm({ ...form, arti: e.target.value })}
          className="col-span-2 rounded-lg border p-2" />
        <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
          className="rounded-lg border p-2">
          {["N5", "N4", "N3", "N2", "N1"].map((lvl) => <option key={lvl}>{lvl}</option>)}
        </select>
        <input placeholder="Bab (Minna no Nihongo)" type="number" value={form.bab}
          onChange={(e) => setForm({ ...form, bab: e.target.value })}
          className="rounded-lg border p-2" />
        <button className="col-span-2 rounded-lg bg-slate-900 py-2 text-white">Tambah Grammar</button>
      </form>

      <div className="space-y-2">
        {list.map((g) => (
          <div key={g.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <span className="font-medium">{g.pola}</span> — {g.arti || g.penjelasan}
              <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs">{g.level}</span>
              {g.bab && <span className="ml-1 rounded bg-blue-50 px-2 py-0.5 text-xs">Bab {g.bab}</span>}
            </div>
            <button onClick={() => handleDelete(g.id)} className="text-sm text-red-600">Hapus</button>
          </div>
        ))}
      </div>
    </main>
  );
}
