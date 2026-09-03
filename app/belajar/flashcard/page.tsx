"use client";

import { useEffect, useState } from "react";
import { Rating } from "ts-fsrs";
import PageHeader from "@/components/PageHeader";
import FlashCard from "@/components/FlashCard";

type Kotoba = {
  id: string;
  kanjiKana: string;
  furigana: string | null;
  romaji: string | null;
  arti: string;
  contohKalimat: string | null;
};

const TOMBOL_RATING = [
  { label: "Again", rating: Rating.Again, color: "bg-red-500" },
  { label: "Hard", rating: Rating.Hard, color: "bg-orange-500" },
  { label: "Good", rating: Rating.Good, color: "bg-green-500" },
  { label: "Easy", rating: Rating.Easy, color: "bg-blue-500" },
] as const;

export default function FlashcardAnkiPage() {
  const [queue, setQueue] = useState<Kotoba[]>([]);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/flashcard/queue")
      .then((r) => r.json())
      .then((data) => {
        setQueue(data);
        setLoading(false);
      });
  }, []);

  async function handleRating(rating: Rating) {
    const kotoba = queue[index];
    await fetch("/api/flashcard/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kotobaId: kotoba.id, rating }),
    });
    setShowBack(false);
    setIndex((i) => i + 1);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col p-4 sm:p-8">
      <PageHeader title="Flashcard Anki (Kotoba)" />

      {loading && <p className="text-center text-slate-400">Memuat kartu...</p>}

      {!loading && index >= queue.length && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <h2 className="text-xl font-bold">Selesai!</h2>
          <p className="text-slate-500">Tidak ada kartu lagi untuk direview hari ini. Kembali besok ya.</p>
        </div>
      )}

      {!loading && index < queue.length && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <p className="text-sm text-slate-400">Kartu {index + 1} dari {queue.length}</p>
          <FlashCard kotoba={queue[index]} showBack={showBack} onFlip={() => setShowBack((v) => !v)} />
          {showBack && (
            <div className="grid grid-cols-4 gap-2">
              {TOMBOL_RATING.map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => handleRating(btn.rating)}
                  className={`rounded-lg px-3 py-2 text-sm text-white ${btn.color}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
