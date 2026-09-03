import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function BelajarHubPage() {
  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-8">
      <PageHeader title="Belajar" />

      <div className="grid gap-3">
        <Link href="/belajar/kana" className="rounded-xl border p-4 hover:bg-slate-50">
          <div className="font-semibold">ひらがな・カタカナ — Hiragana &amp; Katakana</div>
          <div className="text-sm text-slate-500">Tabel referensi + kuis (pilihan ganda / ketik romaji / ketik kana)</div>
        </Link>
        <Link href="/latihan" className="rounded-xl border p-4 hover:bg-slate-50">
          <div className="font-semibold">Latihan JLPT (Kotoba / Kanji / Grammar)</div>
          <div className="text-sm text-slate-500">Soal isian aktif per level &amp; bab, dinilai otomatis, ada gap analysis</div>
        </Link>
        <Link href="/belajar/flashcard" className="rounded-xl border p-4 hover:bg-slate-50">
          <div className="font-semibold">Flashcard Anki (Kotoba)</div>
          <div className="text-sm text-slate-500">Flip kartu klasik — kamu sendiri yang menilai Again/Hard/Good/Easy</div>
        </Link>
      </div>
    </main>
  );
}
