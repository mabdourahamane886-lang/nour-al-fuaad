import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/spirituel")({
  head: () => ({
    meta: [
      { title: "Versets & Hadiths — NOUROUL FOUA'AD" },
      { name: "description", content: "Sélection de versets du Coran et de hadiths authentiques pour nourrir le cœur." },
    ],
  }),
  component: SpirituelPage,
});

const verses = [
  {
    ref: "Sourate Al-Baqara, 286",
    ar: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    fr: "« Allah n'impose à aucune âme une charge supérieure à sa capacité. »",
  },
  {
    ref: "Sourate Ash-Sharh, 5-6",
    ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا · إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    fr: "« À côté de la difficulté est, certes, une facilité. »",
  },
  {
    ref: "Sourate Ta-Ha, 114",
    ar: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    fr: "« Et dis : Ô mon Seigneur, accroîs mes connaissances. »",
  },
];

const hadiths = [
  {
    ref: "Rapporté par Muslim",
    ar: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    fr: "« Celui qui emprunte un chemin à la recherche d'une science, Allah lui facilitera par cela un chemin vers le Paradis. »",
  },
  {
    ref: "Rapporté par Al-Bukhari",
    ar: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
    fr: "« Les actions ne valent que par leurs intentions. »",
  },
  {
    ref: "Rapporté par At-Tirmidhi",
    ar: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ",
    fr: "« Crains Allah où que tu sois. »",
  },
];

function Card({ ref: r, ar, fr }: { ref: string; ar: string; fr: string }) {
  return (
    <article className="p-8 md:p-10 rounded-2xl bg-card border border-border" style={{ boxShadow: "0 4px 20px -10px oklch(0.28 0.07 160 / 0.15)" }}>
      <p className="text-xs uppercase tracking-[0.25em] text-accent mb-5">{r}</p>
      <p className="font-arabic text-3xl md:text-4xl text-primary mb-5 leading-loose">{ar}</p>
      <p className="italic text-muted-foreground" style={{ fontFamily: "var(--font-display)" }}>{fr}</p>
    </article>
  );
}

function SpirituelPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <header className="text-center mb-16">
        <p className="font-arabic text-4xl text-accent mb-4">آيَاتٌ وَأَحَادِيث</p>
        <h1 className="text-5xl md:text-6xl text-primary mb-4">Versets & Hadiths</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Une sélection pour nourrir le cœur et raviver la lumière (Nour) de la foi.
        </p>
      </header>

      <section className="mb-20">
        <h2 className="text-3xl text-primary mb-8 text-center">Du Saint Coran</h2>
        <div className="grid gap-6">
          {verses.map((v) => <Card key={v.ref} {...v} />)}
        </div>
      </section>

      <section>
        <h2 className="text-3xl text-primary mb-8 text-center">Du Prophète ﷺ</h2>
        <div className="grid gap-6">
          {hadiths.map((h) => <Card key={h.ref} {...h} />)}
        </div>
      </section>
    </div>
  );
}