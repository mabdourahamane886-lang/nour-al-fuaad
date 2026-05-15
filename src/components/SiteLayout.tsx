import { Link, Outlet } from "@tanstack/react-router";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/cours", label: "Cours" },
  { to: "/arabe", label: "Langue Arabe" },
  { to: "/spirituel", label: "Versets & Hadiths" },
  { to: "/inscription", label: "Inscription" },
] as const;

export function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-gold)" }}>
              <span className="font-arabic text-xl text-[oklch(0.22_0.04_160)]">ن</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold tracking-wide" style={{ fontFamily: "var(--font-display)" }}>NOUROUL FOUA'AD</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Lumière du cœur</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-muted-foreground hover:text-primary transition-colors"
                activeProps={{ className: "text-primary font-semibold" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/inscription"
            className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
            style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}
          >
            S'inscrire
          </Link>
        </div>
        <div className="md:hidden border-t border-border overflow-x-auto">
          <div className="flex gap-5 px-6 py-2 text-xs whitespace-nowrap">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="text-muted-foreground" activeProps={{ className: "text-primary font-semibold" }}>
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-24 border-t border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10 text-primary-foreground">
          <div>
            <div className="font-arabic text-3xl mb-3">نور الفؤاد</div>
            <h3 className="text-2xl mb-2" style={{ fontFamily: "var(--font-display)" }}>NOUROUL FOUA'AD</h3>
            <p className="text-sm opacity-80">Apprendre le Coran, la langue arabe et les sciences islamiques avec sérénité et accompagnement.</p>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] mb-4 opacity-70">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {nav.map((n) => (
                <li key={n.to}><Link to={n.to} className="opacity-90 hover:opacity-100">{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] mb-4 opacity-70">Contact</h4>
            <p className="text-sm opacity-90">WhatsApp / Appel</p>
            <a href="tel:+22788376133" className="text-2xl font-semibold tracking-wide" style={{ fontFamily: "var(--font-display)" }}>+227 88 37 61 33</a>
            <p className="text-xs mt-3 opacity-70">Paiement : My Nita · Amana ta · Wave</p>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs opacity-70 text-primary-foreground">
          © {new Date().getFullYear()} NOUROUL FOUA'AD — Tous droits réservés
        </div>
      </footer>
    </div>
  );
}