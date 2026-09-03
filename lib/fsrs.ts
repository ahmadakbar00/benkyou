import { fsrs, generatorParameters, createEmptyCard, Rating, State, Card } from "ts-fsrs";

const params = generatorParameters({ enable_fuzz: true });
export const scheduler = fsrs(params);

export type ProgressLike = {
  due: Date;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: number;
  lastReview: Date | null;
};

// Ubah row progress dari DB jadi Card yang dikenali ts-fsrs
export function toCard(p: ProgressLike | null): Card {
  if (!p) return createEmptyCard();
  return {
    due: p.due,
    stability: p.stability,
    difficulty: p.difficulty,
    elapsed_days: p.elapsedDays,
    scheduled_days: p.scheduledDays,
    reps: p.reps,
    lapses: p.lapses,
    state: p.state as State,
    last_review: p.lastReview ?? undefined,
  } as Card;
}

// Logika penilaian OTOMATIS (bukan user pilih sendiri seperti Anki biasa):
// - Salah total         -> Again
// - Benar tapi lama       (>= 8 detik) -> Hard
// - Benar, waktu normal   (< 8 detik)  -> Good
// - Benar & cepat         (< 3 detik)  -> Easy
export function autoRating(benar: boolean, responseMs: number): Rating {
  if (!benar) return Rating.Again;
  if (responseMs < 3000) return Rating.Easy;
  if (responseMs < 8000) return Rating.Good;
  return Rating.Hard;
}

// Jadwalkan kartu berikutnya berdasarkan Card lama + rating otomatis
export function scheduleNext(prev: ProgressLike | null, benar: boolean, responseMs: number) {
  const card = toCard(prev);
  const rating = autoRating(benar, responseMs);
  const now = new Date();
  
  // Menggunakan tipe casting RecordRecord yang valid untuk ts-fsrs
  const repetitions = scheduler.repeat(card, now);
  const result = repetitions[rating as Rating.Again | Rating.Hard | Rating.Good | Rating.Easy];
  const next = result.card;

  return {
    due: next.due,
    stability: next.stability,
    difficulty: next.difficulty,
    elapsedDays: next.elapsed_days,
    scheduledDays: next.scheduled_days,
    reps: next.reps,
    lapses: next.lapses,
    state: next.state as number,
    lastReview: now,
    ratingUsed: rating,
  };
}

// Versi klasik ala Anki: rating dipilih SENDIRI oleh user (1=Again 2=Hard 3=Good 4=Easy)
export function scheduleWithRating(prev: ProgressLike | null, rating: Rating) {
  const card = toCard(prev);
  const now = new Date();
  
  const repetitions = scheduler.repeat(card, now);
  const result = repetitions[rating as Rating.Again | Rating.Hard | Rating.Good | Rating.Easy];
  const next = result.card;

  return {
    due: next.due,
    stability: next.stability,
    difficulty: next.difficulty,
    elapsedDays: next.elapsed_days,
    scheduledDays: next.scheduled_days,
    reps: next.reps,
    lapses: next.lapses,
    state: next.state as number,
    lastReview: now,
    ratingUsed: rating,
  };
}