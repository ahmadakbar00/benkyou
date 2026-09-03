"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import PageHeader from "@/components/PageHeader";

type Profile = { id: string; name: string; email: string; role: string; createdAt: string };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((p) => {
      setProfile(p);
      setName(p.name);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Gagal menyimpan");
      return;
    }
    setMessage("Profil berhasil diperbarui");
    setCurrentPassword("");
    setNewPassword("");
  }

  if (!profile) return <main className="p-8">Memuat...</main>;

  return (
    <main className="mx-auto max-w-md p-4 sm:p-8">
      <PageHeader title="Profil Saya" />

      <div className="mb-6 rounded-xl border p-4 text-sm">
        <p><span className="text-slate-500">Email:</span> {profile.email}</p>
        <p><span className="text-slate-500">Role:</span> {profile.role}</p>
        <p><span className="text-slate-500">Bergabung:</span> {new Date(profile.createdAt).toLocaleDateString("id-ID")}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="text-sm font-medium">Nama</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border p-2" />

        <hr className="my-2" />
        <p className="text-sm text-slate-500">Kosongkan bagian di bawah kalau tidak mau ganti password.</p>
        <label className="text-sm font-medium">Password Lama</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="rounded-lg border p-2" />
        <label className="text-sm font-medium">Password Baru</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-lg border p-2" />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        <button className="mt-2 rounded-lg bg-slate-900 py-2 text-white">Simpan</button>
      </form>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-6 w-full rounded-lg border border-red-500 py-2 text-red-600"
      >
        Keluar
      </button>
    </main>
  );
}
