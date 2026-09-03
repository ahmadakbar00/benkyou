"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

type Overview = { totalUsers: number; totalAdmin: number; totalKotoba: number; totalKanji: number; totalGrammar: number; totalKana: number; totalReviewed: number };

export default function AdminHomePage() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch("/api/admin-overview").then((r) => r.json()).then(setData);
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <PageHeader title="Panel Admin" />

      {data && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border p-3 text-center">
            <div className="text-xl font-bold">{data.totalUsers}</div>
            <div className="text-xs text-slate-500">Total User</div>
          </div>
          <div className="rounded-xl border p-3 text-center">
            <div className="text-xl font-bold">{data.totalAdmin}</div>
            <div className="text-xs text-slate-500">Admin</div>
          </div>
          <div className="rounded-xl border p-3 text-center">
            <div className="text-xl font-bold">{data.totalKotoba}</div>
            <div className="text-xs text-slate-500">Kartu Kotoba</div>
          </div>
          <div className="rounded-xl border p-3 text-center">
            <div className="text-xl font-bold">{data.totalKanji}</div>
            <div className="text-xs text-slate-500">Kanji</div>
          </div>
          <div className="rounded-xl border p-3 text-center">
            <div className="text-xl font-bold">{data.totalGrammar}</div>
            <div className="text-xs text-slate-500">Grammar Point</div>
          </div>
          <div className="rounded-xl border p-3 text-center">
            <div className="text-xl font-bold">{data.totalKana}</div>
            <div className="text-xs text-slate-500">Karakter Kana</div>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        <Link href="/admin/kotoba" className="rounded-xl border p-4 hover:bg-slate-50">
          <div className="font-semibold">Manajemen Kotoba</div>
          <div className="text-sm text-slate-500">Tambah, edit, hapus kartu kosakata + tag level/bab</div>
        </Link>
        <Link href="/admin/kanji" className="rounded-xl border p-4 hover:bg-slate-50">
          <div className="font-semibold">Manajemen Kanji</div>
          <div className="text-sm text-slate-500">Kelola karakter kanji, cara baca, tag level/bab</div>
        </Link>
        <Link href="/admin/grammar" className="rounded-xl border p-4 hover:bg-slate-50">
          <div className="font-semibold">Manajemen Grammar</div>
          <div className="text-sm text-slate-500">Kelola pola tata bahasa, contoh kalimat, tag level/bab</div>
        </Link>
        <Link href="/admin/kana" className="rounded-xl border p-4 hover:bg-slate-50">
          <div className="font-semibold">Manajemen Hiragana &amp; Katakana</div>
          <div className="text-sm text-slate-500">Kelola karakter dasar, dakuten, handakuten</div>
        </Link>
        <Link href="/admin/users" className="rounded-xl border p-4 hover:bg-slate-50">
          <div className="font-semibold">Manajemen User</div>
          <div className="text-sm text-slate-500">Lihat daftar user, ubah role, hapus akun</div>
        </Link>
      </div>
    </main>
  );
}
