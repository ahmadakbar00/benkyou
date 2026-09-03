"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PageHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="flex h-9 w-9 items-center justify-center rounded-full border text-lg active:bg-slate-100"
        >
          ←
        </button>
        <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
      </div>
      <Link
        href="/profile"
        aria-label="Profil"
        className="flex h-9 w-9 items-center justify-center rounded-full border"
      >
        👤
      </Link>
    </div>
  );
}
