"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

type Stats = {
  totalCards: number;
  matured: number;
  learning: number;
  byLevel: Record<string, number>;
  dailyProgress: { date: string; direview: number }[];
  hiragana: { totalBenar: number; totalSalah: number };
  katakana: { totalBenar: number; totalSalah: number };
};

const COLORS = ["#0f172a", "#64748b"];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats);
    fetch("/api/profile").then((r) => r.json()).then((p) => setRole(p.role));
  }, []);

  if (!stats) return <main className="p-8">Memuat statistik...</main>;

  const levelData = Object.entries(stats.byLevel).map(([level, jumlah]) => ({ level, jumlah }));
  const hiraganaPie = [
    { name: "Benar", value: stats.hiragana.totalBenar },
    { name: "Salah", value: stats.hiragana.totalSalah },
  ];
  const katakanaPie = [
    { name: "Benar", value: stats.katakana.totalBenar },
    { name: "Salah", value: stats.katakana.totalSalah },
  ];

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-4 sm:p-8">
      <PageHeader title="Dashboard Belajar" />
      <nav className="-mt-4 flex flex-wrap gap-3 text-sm">
        <Link href="/belajar" className="underline">Menu Belajar</Link>
        {role === "ADMIN" && <Link href="/admin" className="font-medium text-blue-700 underline">Panel Admin</Link>}
      </nav>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold">{stats.totalCards}</div>
          <div className="text-sm text-slate-500">Total kartu dipelajari</div>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold">{stats.matured}</div>
          <div className="text-sm text-slate-500">Sudah matang (mature)</div>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold">{stats.learning}</div>
          <div className="text-sm text-slate-500">Masih belajar</div>
        </div>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Review 14 Hari Terakhir</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stats.dailyProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="direview" stroke="#0f172a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold">Distribusi Level Kotoba</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={levelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#0f172a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="mb-2 font-semibold">Akurasi Kuis Hiragana</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={hiraganaPie} dataKey="value" nameKey="name" outerRadius={80} label>
                {hiraganaPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Akurasi Kuis Katakana</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={katakanaPie} dataKey="value" nameKey="name" outerRadius={80} label>
              {katakanaPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
