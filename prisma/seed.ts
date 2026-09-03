import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  HIRAGANA_BASIC, HIRAGANA_DAKUTEN, HIRAGANA_HANDAKUTEN,
} from "../app/belajar/kana/hiragana-data";
import {
  KATAKANA_BASIC, KATAKANA_DAKUTEN, KATAKANA_HANDAKUTEN,
} from "../app/belajar/kana/katakana-data";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin12345", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nihongo-srs.local" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@nihongo-srs.local",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin siap:", admin.email, "| password: admin12345 (SEGERA GANTI!)");

  const sets: [readonly (readonly [string, string])[], "HIRAGANA" | "KATAKANA", "BASIC" | "DAKUTEN" | "HANDAKUTEN"][] = [
    [HIRAGANA_BASIC, "HIRAGANA", "BASIC"],
    [HIRAGANA_DAKUTEN, "HIRAGANA", "DAKUTEN"],
    [HIRAGANA_HANDAKUTEN, "HIRAGANA", "HANDAKUTEN"],
    [KATAKANA_BASIC, "KATAKANA", "BASIC"],
    [KATAKANA_DAKUTEN, "KATAKANA", "DAKUTEN"],
    [KATAKANA_HANDAKUTEN, "KATAKANA", "HANDAKUTEN"],
  ];

  let count = 0;
  for (const [data, jenis, kategori] of sets) {
    for (const [karakter, romaji] of data) {
      await prisma.kanaChar.upsert({
        where: { karakter_jenis: { karakter, jenis } },
        update: {},
        create: { karakter, romaji, jenis, kategori },
      });
      count++;
    }
  }
  console.log(`Seed kana selesai: ${count} karakter (hiragana+katakana).`);

  // Contoh data awal Kotoba/Kanji/Grammar N5 (admin bisa tambah lebih banyak lewat panel)
  const contohKotoba = [
    { kanjiKana: "食べる", furigana: "たべる", romaji: "taberu", arti: "makan", bab: 1 },
    { kanjiKana: "飲む", furigana: "のむ", romaji: "nomu", arti: "minum", bab: 1 },
    { kanjiKana: "行く", furigana: "いく", romaji: "iku", arti: "pergi", bab: 2 },
    { kanjiKana: "学校", furigana: "がっこう", romaji: "gakkou", arti: "sekolah", bab: 2 },
  ];
  for (const k of contohKotoba) {
    await prisma.kotoba.upsert({
      where: { id: `seed-${k.romaji}` },
      update: {},
      create: { id: `seed-${k.romaji}`, ...k, level: "N5", createdBy: admin.id },
    });
  }

  const contohKanji = [
    { karakter: "食", onyomi: "ショク", kunyomi: "た.べる", arti: "makan", bab: 1 },
    { karakter: "行", onyomi: "コウ", kunyomi: "い.く", arti: "pergi", bab: 2 },
  ];
  for (const k of contohKanji) {
    await prisma.kanji.upsert({
      where: { id: `seed-kanji-${k.karakter}` },
      update: {},
      create: { id: `seed-kanji-${k.karakter}`, ...k, level: "N5", createdBy: admin.id },
    });
  }

  const contohGrammar = [
    { pola: "〜ます", penjelasan: "Bentuk sopan kata kerja", arti: "bentuk sopan", bab: 1 },
    { pola: "〜ませんか", penjelasan: "Ajakan sopan", arti: "mengajak melakukan sesuatu", bab: 2 },
  ];
  for (const g of contohGrammar) {
    await prisma.grammar.upsert({
      where: { id: `seed-grammar-${g.pola}` },
      update: {},
      create: { id: `seed-grammar-${g.pola}`, ...g, level: "N5", createdBy: admin.id },
    });
  }
  console.log("Seed contoh Kotoba/Kanji/Grammar N5 selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
