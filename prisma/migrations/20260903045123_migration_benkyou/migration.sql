-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "KanaType" AS ENUM ('HIRAGANA', 'KATAKANA');

-- CreateEnum
CREATE TYPE "KanaKategori" AS ENUM ('BASIC', 'DAKUTEN', 'HANDAKUTEN');

-- CreateEnum
CREATE TYPE "JlptLevel" AS ENUM ('N5', 'N4', 'N3', 'N2', 'N1');

-- CreateEnum
CREATE TYPE "MateriType" AS ENUM ('KOTOBA', 'KANJI', 'GRAMMAR');

-- CreateTable
CREATE TABLE "KanaChar" (
    "id" TEXT NOT NULL,
    "karakter" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "jenis" "KanaType" NOT NULL,
    "kategori" "KanaKategori" NOT NULL DEFAULT 'BASIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KanaChar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kotoba" (
    "id" TEXT NOT NULL,
    "kanjiKana" TEXT NOT NULL,
    "furigana" TEXT,
    "romaji" TEXT,
    "arti" TEXT NOT NULL,
    "contohKalimat" TEXT,
    "level" "JlptLevel" NOT NULL DEFAULT 'N5',
    "bab" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Kotoba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kanji" (
    "id" TEXT NOT NULL,
    "karakter" TEXT NOT NULL,
    "onyomi" TEXT,
    "kunyomi" TEXT,
    "arti" TEXT NOT NULL,
    "level" "JlptLevel" NOT NULL DEFAULT 'N5',
    "bab" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Kanji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grammar" (
    "id" TEXT NOT NULL,
    "pola" TEXT NOT NULL,
    "penjelasan" TEXT NOT NULL,
    "contohKalimat" TEXT,
    "arti" TEXT,
    "level" "JlptLevel" NOT NULL DEFAULT 'N5',
    "bab" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Grammar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserKotobaProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kotobaId" TEXT NOT NULL,
    "due" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "elapsedDays" INTEGER NOT NULL DEFAULT 0,
    "scheduledDays" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "state" INTEGER NOT NULL DEFAULT 0,
    "lastReview" TIMESTAMP(3),

    CONSTRAINT "UserKotobaProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserKanjiProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kanjiId" TEXT NOT NULL,
    "due" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "elapsedDays" INTEGER NOT NULL DEFAULT 0,
    "scheduledDays" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "state" INTEGER NOT NULL DEFAULT 0,
    "lastReview" TIMESTAMP(3),

    CONSTRAINT "UserKanjiProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGrammarProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grammarId" TEXT NOT NULL,
    "due" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "elapsedDays" INTEGER NOT NULL DEFAULT 0,
    "scheduledDays" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "state" INTEGER NOT NULL DEFAULT 0,
    "lastReview" TIMESTAMP(3),

    CONSTRAINT "UserGrammarProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserKanaProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "karakter" TEXT NOT NULL,
    "jenis" "KanaType" NOT NULL,
    "benar" INTEGER NOT NULL DEFAULT 0,
    "salah" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserKanaProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "materiType" "MateriType" NOT NULL,
    "refId" TEXT NOT NULL,
    "bab" INTEGER,
    "level" "JlptLevel" NOT NULL,
    "benar" BOOLEAN NOT NULL,
    "responseMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KanaChar_karakter_jenis_key" ON "KanaChar"("karakter", "jenis");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserKotobaProgress_userId_kotobaId_key" ON "UserKotobaProgress"("userId", "kotobaId");

-- CreateIndex
CREATE UNIQUE INDEX "UserKanjiProgress_userId_kanjiId_key" ON "UserKanjiProgress"("userId", "kanjiId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGrammarProgress_userId_grammarId_key" ON "UserGrammarProgress"("userId", "grammarId");

-- CreateIndex
CREATE UNIQUE INDEX "UserKanaProgress_userId_karakter_jenis_key" ON "UserKanaProgress"("userId", "karakter", "jenis");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_materiType_bab_idx" ON "QuizAttempt"("userId", "materiType", "bab");

-- AddForeignKey
ALTER TABLE "UserKotobaProgress" ADD CONSTRAINT "UserKotobaProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKotobaProgress" ADD CONSTRAINT "UserKotobaProgress_kotobaId_fkey" FOREIGN KEY ("kotobaId") REFERENCES "Kotoba"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKanjiProgress" ADD CONSTRAINT "UserKanjiProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKanjiProgress" ADD CONSTRAINT "UserKanjiProgress_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "Kanji"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGrammarProgress" ADD CONSTRAINT "UserGrammarProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGrammarProgress" ADD CONSTRAINT "UserGrammarProgress_grammarId_fkey" FOREIGN KEY ("grammarId") REFERENCES "Grammar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKanaProgress" ADD CONSTRAINT "UserKanaProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
