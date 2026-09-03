import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">日本語 SRS</h1>
      <p className="max-w-md text-slate-600">
        Belajar hiragana dan kosakata (kotoba) bahasa Jepang dengan sistem spaced
        repetition seperti Anki.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="rounded-lg bg-slate-900 px-5 py-2 text-white">
          Masuk
        </Link>
        <Link href="/register" className="rounded-lg border border-slate-900 px-5 py-2">
          Daftar
        </Link>
      </div>
    </main>
  );
}
