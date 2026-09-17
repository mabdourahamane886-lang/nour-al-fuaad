import { Link } from "@tanstack/react-router";
import { ArrowRight, Award, BookOpen, CheckCircle2, Clock3, GraduationCap, MessageCircle, ShieldCheck, Sparkles, Users } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Nouroul Foua'ad | Académie du Coran, Hadiths, Fiqh et langue arabe" },
      { name: "description", content: "Nouroul Foua'ad : apprentissage du Coran, tajwid, hadiths, fiqh, invocations et langue arabe avec accompagnement personnalisé." },
      { name: "keywords", content: "Coran, tajwid, hadith, fiqh, langue arabe, académie islamique, Nouroul Foua'ad" },
    ],
  }),
});

const subjects = [
  { icon: "📖", ar: "حِفْظُ الْقُرْآن", fr: "Mémorisation du Coran", desc: "Mémorisation progressive, révisions et tajwid avec une méthode régulière." },
  { icon: "🎙️", ar: "التَّجْوِيد", fr: "Tajwid", desc: "Améliorer la récitation et apprendre les règles de manière structurée." },
  { icon: "📚", ar: "الْحَدِيث", fr: "Hadiths", desc: "Étude, compréhension et mise en pratique des enseignements prophétiques." },
  { icon: "⚖️", ar: "الْفِقْه", fr: "Fiqh", desc: "Comprendre les règles essentielles liées à la pratique et à la vie quotidienne." },
  { icon: "🤲", ar: "الأَذْكَار", fr: "Invocations", desc: "Apprendre les invocations et habitudes spirituelles utiles au quotidien." },
  { icon: "ع", ar: "اللُّغَةُ الْعَرَبِيَّة", fr: "Langue arabe", desc: "Progresser à son rythme en lecture, compréhension et expression." },
];

const values = [
  { icon: GraduationCap, title: "Parcours structuré", text: "Des cours organisés par objectifs, niveaux et étapes d'apprentissage." },
  { icon: Users, title: "Accompagnement humain", text: "Un suivi clair pour aider chaque étudiant à avancer avec régularité." },
  { icon: ShieldCheck, title: "Paiement & suivi", text: "Inscription, paiement et suivi accessibles depuis une plateforme unique." },
  { icon: Award, title: "Parcours valorisé", text: "Possibilité d'afficher les résultats et documents de formation dans l'espace étudiant." },
];

const faqs = [
  ["Comment s'inscrire ?", "Choisissez votre programme, remplissez le formulaire d'inscription et recevez votre code de suivi."],
  ["Comment payer ?", "Le paiement est présenté sur la page Paiement avec Wave, NITA et AMANA, puis vous pouvez envoyer le reçu sur WhatsApp."],
  ["Comment suivre mon inscription ?", "La page Espace étudiant permet de retrouver votre dossier avec le code de suivi ou le numéro WhatsApp."],
  ["Quand ont lieu les cours ?", "Le calendrier affiché dans l'espace inscription présente actuellement trois séances hebdomadaires. Les informations peuvent évoluer selon le programme."],
];

function Index() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <img src={heroImg} alt="Mosquée et arabesques dorées" width={1536} height={1024} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.18 0.06 160 / 0.48), oklch(0.18 0.06 160 / 0.92))" }} />
        <div className="relative max-w-7xl mx-auto px-6 py-28 md:py-36 lg:py-44 text-primary-foreground">
          <div className="max-w-4xl text-center mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm text-sm mb-6">
              <Sparkles className="w-4 h-4" style={{ color: "var(--gold)" }} />
              Académie en ligne · Nouroul Foua'ad
            </div>
            <p className="font-arabic text-3xl md:text-4xl mb-5 opacity-95">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            <p className="text-xs uppercase tracking-[0.35em] mb-4 opacity-80" style={{ color: "var(--gold)" }}>Apprendre · Comprendre · Progresser</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] mb-7" style={{ fontFamily: "var(--font-display)" }}>NOUROUL FOUA'AD</h1>
            <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto opacity-90 leading-relaxed mb-10">
              Une plateforme d'apprentissage du Coran, du tajwid, des hadiths, du fiqh et de la langue arabe avec un accompagnement étape par étape.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/inscription" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-primary hover:scale-[1.03] transition-transform" style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-elegant)" }}>
                Commencer mon inscription <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/cours" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold border border-white/25 bg-white/5 hover:bg-white/10 transition-colors">
                Voir les formations
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-14 max-w-5xl mx-auto">
            {[
              [BookOpen, "Cours structurés", "Programmes clairs"],
              [Users, "Suivi personnalisé", "Un parcours accompagné"],
              [ShieldCheck, "Paiement local", "Wave · NITA · AMANA"],
              [MessageCircle, "Assistance", "WhatsApp disponible"],
            ].map(([Icon, title, desc]) => {
              const I = Icon as typeof BookOpen;
              return <div key={title as string} className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm px-4 py-4 text-left"><I className="w-5 h-5 mb-3" style={{ color: "var(--gold)" }} /><p className="font-semibold">{title as string}</p><p className="text-xs opacity-70 mt-1">{desc as string}</p></div>;
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10 -mt-7 relative z-10">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            ["1", "Choisissez", "Votre formation et votre niveau"],
            ["2", "Inscrivez-vous", "Recevez votre code de suivi"],
            ["3", "Progressez", "Suivez votre parcours et vos séances"],
          ].map(([n, title, text]) => <div key={n} className="rounded-2xl bg-card border border-border shadow-lg p-5 flex gap-4"><div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-primary" style={{ background: "var(--gradient-gold)" }}>{n}</div><div><p className="font-semibold text-primary">{title}</p><p className="text-sm text-muted-foreground mt-1">{text}</p></div></div>)}
        </div>
      </section>

      <section id="apropos" className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">À propos</p>
            <h2 className="text-4xl md:text-5xl text-primary mb-5">Une académie pensée pour apprendre avec sérénité</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">Nouroul Foua'ad propose une expérience simple : découvrir les programmes, s'inscrire, effectuer son paiement, suivre son dossier et avancer dans son apprentissage depuis un même espace.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {["Programmes lisibles", "Suivi d'inscription", "Paiement par moyens locaux", "Assistance WhatsApp", "Espace étudiant", "Informations centralisées"].map((item) => <div key={item} className="flex gap-2 items-center text-sm text-primary"><CheckCircle2 className="w-4 h-4 text-accent" />{item}</div>)}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-7 md:p-9 shadow-xl">
            <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-gold)" }}><GraduationCap className="w-6 h-6 text-primary" /></div><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Notre méthode</p><p className="text-xl text-primary font-semibold">Clarté · Régularité · Suivi</p></div></div>
            <div className="space-y-4">{["Objectif pédagogique clair", "Séances et révisions régulières", "Échange avec l'équipe", "Progression visible dans l'espace étudiant"].map((x, i) => <div key={x} className="flex gap-4"><div className="w-7 h-7 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold">{i + 1}</div><p className="text-sm text-muted-foreground pt-1">{x}</p></div>)}</div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12"><p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Nos formations</p><h2 className="text-4xl md:text-5xl text-primary">Apprendre les fondamentaux et aller plus loin</h2><p className="max-w-2xl mx-auto text-muted-foreground mt-4">Découvrez les parcours proposés par l'académie et choisissez celui qui correspond à votre objectif.</p></div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {subjects.map((s) => <article key={s.fr} className="group p-6 rounded-3xl bg-card border border-border hover:border-accent hover:-translate-y-1 transition-all shadow-sm hover:shadow-lg"><div className="text-3xl mb-4">{s.icon}</div><div className="font-arabic text-2xl text-accent mb-3">{s.ar}</div><h3 className="text-2xl text-primary mb-3">{s.fr}</h3><p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.desc}</p><Link to={s.fr === "Langue arabe" ? "/arabe" : "/cours"} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">En savoir plus <ArrowRight className="w-4 h-4" /></Link></article>)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12"><p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Pourquoi nous choisir</p><h2 className="text-4xl md:text-5xl text-primary">Une expérience simple et professionnelle</h2></div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">{values.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-3xl bg-card border border-border p-6"><Icon className="w-6 h-6 text-accent mb-5" /><h3 className="text-xl text-primary mb-2">{title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{text}</p></article>)}</div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16"><div className="rounded-[2rem] p-10 md:p-14 text-primary-foreground" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}><div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center"><div><p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "var(--gold)" }}>Paiement & assistance</p><h2 className="text-4xl md:text-5xl mb-4">Tout le nécessaire pour aller jusqu'au bout de votre inscription</h2><p className="text-white/75 max-w-2xl leading-relaxed">Choisissez votre moyen de paiement, utilisez le numéro communiqué sur le site et envoyez la preuve sur WhatsApp pour faciliter la confirmation de votre dossier.</p></div><div className="flex flex-wrap gap-3 lg:max-w-sm lg:justify-end"><Link to="/paiement" className="px-6 py-3 rounded-full font-semibold text-primary" style={{ background: "var(--gradient-gold)" }}>Voir le paiement</Link><a href="https://wa.me/22788376133" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors inline-flex items-center gap-2"><MessageCircle className="w-4 h-4" />WhatsApp</a></div></div></div></section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="rounded-3xl border border-border bg-card p-8 md:p-10"><p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Parole inspirante</p><p className="font-arabic text-4xl md:text-5xl text-primary leading-relaxed mb-5">اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</p><p className="text-lg italic text-muted-foreground">« Lis, au nom de ton Seigneur qui a créé. » — Sourate Al-‘Alaq, 1</p></div>
          <div className="rounded-3xl border border-border bg-card p-8 md:p-10"><p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Hadith</p><p className="font-arabic text-3xl text-primary leading-loose mb-5">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</p><p className="text-muted-foreground">« Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne. »</p></div>
        </div>
      </section>

      <section id="faq" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12"><p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">FAQ</p><h2 className="text-4xl md:text-5xl text-primary">Questions fréquentes</h2></div>
        <div className="space-y-3">{faqs.map(([q, a]) => <details key={q} className="group rounded-2xl border border-border bg-card px-6 py-5"><summary className="cursor-pointer list-none font-semibold text-primary flex items-center justify-between gap-4"><span>{q}</span><span className="text-accent text-xl group-open:rotate-45 transition-transform">+</span></summary><p className="mt-4 pt-4 border-t border-border text-sm leading-relaxed text-muted-foreground">{a}</p></details>)}</div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 text-center"><div className="rounded-[2rem] border border-accent/30 bg-accent/5 p-10 md:p-14"><Clock3 className="w-8 h-8 mx-auto text-accent mb-4" /><h2 className="text-4xl md:text-5xl text-primary mb-4">Prêt à commencer ?</h2><p className="max-w-2xl mx-auto text-muted-foreground text-lg mb-8">Inscrivez-vous, recevez votre code de suivi et avancez dans votre parcours avec Nouroul Foua'ad.</p><div className="flex flex-wrap justify-center gap-3"><Link to="/inscription" className="px-8 py-4 rounded-full text-primary font-semibold" style={{ background: "var(--gradient-gold)" }}>S'inscrire maintenant</Link><Link to="/mon-espace" className="px-8 py-4 rounded-full border border-border font-semibold text-primary">Mon espace étudiant</Link></div></div></section>
    </div>
  );
}
