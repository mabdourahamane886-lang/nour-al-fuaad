import { Link, Outlet } from "@tanstack/react-router";

const siteLogo = "/favicon.png";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/cours", label: "Formations" },
  { to: "/arabe", label: "Langue arabe" },
  { to: "/spirituel", label: "Coran & Hadiths" },
  { to: "/paiement", label: "Paiement" },
  { to: "/inscription", label: "Inscription" },
  { to: "/mon-espace", label: "Espace étudiant" },
] as const;

const footerFormationLinks = [
  ["/cours", "Toutes les formations"],
  ["/cours", "Mémorisation du Coran"],
  ["/arabe", "Langue arabe"],
  ["/spirituel", "Versets & Hadiths"],
] as const;

export function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="bg-primary text-primary-foreground text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          <span>✓ Cours en ligne</span><span>✓ Suivi personnalisé</span><span>✓ Assistance WhatsApp</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-5">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img src={siteLogo} alt="Logo NOUROUL FOUA'AD" className="w-11 h-11 rounded-2xl object-cover bg-white shadow-sm" />
            <div className="leading-tight min-w-0"><div className="font-semibold tracking-wide truncate" style={{ fontFamily: "var(--font-display)" }}>NOUROUL FOUA'AD</div><div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Lumière du cœur</div></div>
          </Link>
          <nav className="hidden xl:flex items-center gap-6 text-sm">{nav.map((n) => <Link key={n.to} to={n.to} className="text-muted-foreground hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>{n.label}</Link>)}</nav>
          <div className="flex items-center gap-2"><a href="https://wa.me/22788376133" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex px-4 py-2.5 rounded-full border border-border text-sm font-medium hover:border-primary hover:text-primary transition-colors">WhatsApp</a><Link to="/inscription" className="inline-flex items-center px-4 sm:px-5 py-2.5 rounded-full text-sm font-semibold text-primary transition-transform hover:scale-105" style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-elegant)" }}>S'inscrire</Link></div>
        </div>
        <div className="xl:hidden border-t border-border overflow-x-auto"><div className="flex gap-5 px-4 sm:px-6 py-2.5 text-xs whitespace-nowrap">{nav.map((n) => <Link key={n.to} to={n.to} className="text-muted-foreground" activeProps={{ className: "text-primary font-semibold" }}>{n.label}</Link>)}</div></div>
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="mt-24 border-t border-border text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5"><img src={siteLogo} alt="Logo NOUROUL FOUA'AD" className="w-14 h-14 rounded-2xl object-cover bg-white" /><div><h3 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>NOUROUL FOUA'AD</h3><p className="text-xs opacity-70 uppercase tracking-[0.2em]">Académie en ligne</p></div></div>
            <p className="text-sm leading-relaxed opacity-85 max-w-sm">Une plateforme d'apprentissage dédiée au Coran, aux hadiths, au fiqh, au tajwid et à la langue arabe, avec un accompagnement clair et humain.</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs"><span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10">Paiement local</span><span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10">Suivi d'inscription</span><span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10">Espace étudiant</span></div>
          </div>

          <div><h4 className="text-sm uppercase tracking-[0.2em] mb-4 opacity-70">Formations</h4><ul className="space-y-2 text-sm">{footerFormationLinks.map(([to, label]) => <li key={label}><Link to={to} className="opacity-90 hover:opacity-100">{label}</Link></li>)}</ul></div>

          <div><h4 className="text-sm uppercase tracking-[0.2em] mb-4 opacity-70">Étudiants</h4><ul className="space-y-2 text-sm"><li><Link to="/inscription" className="opacity-90 hover:opacity-100">S'inscrire</Link></li><li><Link to="/paiement" className="opacity-90 hover:opacity-100">Payer / envoyer un reçu</Link></li><li><Link to="/mon-espace" className="opacity-90 hover:opacity-100">Suivre mon inscription</Link></li><li><a href="https://wa.me/22788376133" target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100">Assistance WhatsApp</a></li></ul></div>

          <div><h4 className="text-sm uppercase tracking-[0.2em] mb-4 opacity-70">Contact</h4><p className="text-sm opacity-80 mb-1">WhatsApp / Appel</p><a href="tel:+22788376133" className="text-2xl font-semibold tracking-wide" style={{ fontFamily: "var(--font-display)" }}>+227 88 37 61 33</a><p className="text-xs mt-3 opacity-70 leading-relaxed">Réponse et accompagnement pour l'inscription, le paiement et le suivi.</p></div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs opacity-70 px-4">© {new Date().getFullYear()} NOUROUL FOUA'AD — Tous droits réservés · Plateforme éducative en ligne</div>
      </footer>
    </div>
  );
}
