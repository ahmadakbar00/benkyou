"use client";

type Kotoba = {
  id: string;
  kanjiKana: string;
  furigana: string | null;
  romaji: string | null;
  arti: string;
  contohKalimat: string | null;
};

export default function FlashCard({
  kotoba,
  showBack,
  onFlip,
}: {
  kotoba: Kotoba;
  showBack: boolean;
  onFlip: () => void;
}) {
  return (
    <div
      onClick={onFlip}
      className="flex min-h-[220px] w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-2xl border bg-white p-8 text-center shadow-sm"
    >
      <div className="text-5xl font-bold">{kotoba.kanjiKana}</div>
      {showBack ? (
        <div className="mt-4 space-y-1">
          {kotoba.furigana && <div className="text-slate-500">{kotoba.furigana}</div>}
          {kotoba.romaji && <div className="text-slate-400">{kotoba.romaji}</div>}
          <div className="text-xl font-medium">{kotoba.arti}</div>
          {kotoba.contohKalimat && (
            <div className="mt-2 text-sm italic text-slate-500">{kotoba.contohKalimat}</div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">(klik kartu untuk lihat arti)</p>
      )}
    </div>
  );
}
