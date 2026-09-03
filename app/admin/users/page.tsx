"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

type UserRow = {
  id: string; name: string; email: string; role: "ADMIN" | "USER"; createdAt: string;
  _count: { progresses: number; kanaProgress: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);

  async function loadUsers() {
    const res = await fetch("/api/users");
    setUsers(await res.json());
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function changeRole(id: string, role: string) {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    loadUsers();
  }

  async function deleteUser(id: string) {
    if (!confirm("Yakin hapus user ini? Semua progress belajarnya ikut terhapus.")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    loadUsers();
  }

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <PageHeader title="Manajemen User" />

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-medium">{u.name} <span className="text-xs text-slate-400">({u.email})</span></div>
              <div className="text-xs text-slate-500">
                {u._count.progresses} kartu kotoba dipelajari · {u._count.kanaProgress} karakter kana dilatih · bergabung {new Date(u.createdAt).toLocaleDateString("id-ID")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={u.role}
                onChange={(e) => changeRole(u.id, e.target.value)}
                className="rounded-lg border p-1 text-sm"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button onClick={() => deleteUser(u.id)} className="text-sm text-red-600">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
