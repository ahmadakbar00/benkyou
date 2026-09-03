"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

type Kana = { id: string; karakter: string; romaji: string; jenis: "HIRAGANA" | "KATAKANA"; kategori: "BASIC" | "DAKUTEN" | "HANDAKUTEN" };

const emptyForm = { karakter: "", romaji: "", jenis: "HIRAGANA" as const, kategori: "BASIC" as const };

export default function AdminKanaPage() {
  const [list, setList] = useState<Kana[]>([]);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [filterJenis, setFilterJenis] = useState<"ALL" | "HIRAGANA" | "KATAKANA">("ALL");

  async function loadList() {
    const res = await fetch("/api/kana");
    setList(await res.json());
  }

  useEffect(() => {
    loadList();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/kana", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    loadList();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/kana/${id}`, { method: "DELETE" });
    loadList();
  }

  const filtered = filterJenis === "ALL" ? list : list.filter((k) => k.jenis === filterJenis);

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <PageHeader title="Manajemen Hiragana & Katakana" />

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-3 rounded-xl border p-4">
        <input placeholder="Karakter (mis. あ)" value={form.karakter}
          onChange={(e) => setForm({ ...form, karakter: e.target.value })}
          className="rounded-lg border p-2" required />
        <input placeholder="Romaji (mis. a)" value={form.romaji}
          onChange={(e) => setForm({ ...form, romaji: e.target.value })}
          className="rounded-lg border p-2" required />
        <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as any })}
          className="rounded-lg border p-2">
          <option value="HIRAGANA">Hiragana</option>
          <option value="KATAKANA">Katakana</option>
        </select>
        <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value as any })}
          className="rounded-lg border p-2">
          <option value="BASIC">Dasar</option>
          <option value="DAKUTEN">Dakuten (゛)</option>
          <option value="HANDAKUTEN">Handakuten (゜)</option>
        </select>
        <button className="col-span-2 rounded-lg bg-slate-900 py-2 text-white">Tambah Karakter</button>
      </form>

      <div className="mb-3 flex gap-2 text-sm">
        {(["ALL", "HIRAGANA", "KATAKANA"] as const).map((j) => (
          <button key={j} onClick={() => setFilterJenis(j)}
            className={`rounded-lg px-3 py-1 ${filterJenis === j ? "bg-slate-700 text-white" : "border"}`}>
            {j === "ALL" ? "Semua" : j === "HIRAGANA" ? "Hiragana" : "Katakana"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {filtered.map((k) => (
          <div key={k.id} className="flex items-center justify-between rounded-lg border p-2">
            <div>
              <span className="text-xl">{k.karakter}</span>{" "}
              <span className="text-sm text-slate-500">{k.romaji}</span>
              <div className="text-xs text-slate-400">{k.kategori}</div>
            </div>
            <button onClick={() => handleDelete(k.id)} className="text-xs text-red-600">Hapus</button>
          </div>
        ))}
      </div>
    </main>
  );
}
