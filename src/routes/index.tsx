import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const subjects = [
  { ar: "حِفْظُ الْقُرْآن", fr: "Mémorisation du Coran", desc: "Apprendre et mémoriser le Saint Coran avec tajwid, sous la guidance d'enseignants qualifiés." },
  { ar: "الْحَدِيث", fr: "Hadiths", desc: "Étude des paroles du Prophète ﷺ : authenticité, sens et application au quotidien." },
  { ar: "الْفِقْه", fr: "Fiqh", desc: "Comprendre la jurisprudence islamique : purification, prière, jeûne, transactions et plus." },
];

function Index() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img src={heroImg} alt="Mosquée et arabesques dorées" width={1536} height={1024} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.22 0.06 160 / 0.55), oklch(0.22 0.06 160 / 0.85))" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-32 md:py-44 text-center text-primary-foreground">
          <p className="font-arabic text-3xl md:text-4xl mb-6 opacity-90">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <p className="text-xs uppercase tracking-[0.4em] mb-5 opacity-80" style={{ color: "var(--gold)" }}>Institut en ligne</p>
          <h1 className="text-5xl md:text-7xl font-semibold leading-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
            NOUROUL FOUA'AD
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 mb-10">
            La lumière du cœur — apprendre le Coran, la langue arabe et les sciences islamiques avec un accompagnement personnalisé vers le succès.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/inscription" className="px-8 py-3.5 rounded-full font-medium text-primary transition-transform hover:scale-105" style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-elegant)" }}>
              Commencer l'inscription
            </Link>
            <Link to="/cours" className="px-8 py-3.5 rounded-full font-medium border border-white/30 hover:bg-white/10 transition-colors">
              Découvrir les cours
            </Link>
          </div>
        </div>
      </section>

      {/* VERSE */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-6">Sourate Al-‘Alaq, 1</p>
        <p className="font-arabic text-4xl md:text-5xl text-primary mb-6 leading-relaxed">
          اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
        </p>
        <p className="text-lg italic text-muted-foreground" style={{ fontFamily: "var(--font-display)" }}>
          « Lis, au nom de ton Seigneur qui a créé. »
        </p>
      </section>

      {/* SUBJECTS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Nos matières</p>
          <h2 className="text-4xl md:text-5xl text-primary">Trois sciences essentielles</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {subjects.map((s) => (
            <article key={s.fr} className="group p-8 rounded-2xl bg-card border border-border hover:border-accent transition-all hover:-translate-y-1" style={{ boxShadow: "0 4px 20px -10px oklch(0.28 0.07 160 / 0.2)" }}>
              <div className="font-arabic text-3xl text-accent mb-4">{s.ar}</div>
              <h3 className="text-2xl text-primary mb-3">{s.fr}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* HADITH */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="rounded-3xl p-10 md:p-16 text-primary-foreground text-center" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
          <p className="text-xs uppercase tracking-[0.3em] mb-6" style={{ color: "var(--gold)" }}>Hadith — rapporté par Al-Bukhari</p>
          <p className="font-arabic text-3xl md:text-4xl mb-6 leading-loose">
            خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
          </p>
          <p className="text-lg md:text-xl italic max-w-2xl mx-auto opacity-90" style={{ fontFamily: "var(--font-display)" }}>
            « Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne. »
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl md:text-5xl text-primary mb-5">Accompagnement avec succès</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Un suivi personnalisé, étape par étape, jusqu'à la réussite de votre parcours d'apprentissage.
        </p>
        <Link to="/inscription" className="inline-block px-10 py-4 rounded-full text-primary-foreground font-medium hover:scale-105 transition-transform" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
          Rejoindre l'institut
        </Link>
      </section>
    </>
  );
}
