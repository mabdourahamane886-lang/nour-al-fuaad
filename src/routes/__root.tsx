import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { SiteLayout } from "@/components/SiteLayout";

function NotFoundComponent() {
  return <div className="min-h-screen flex items-center justify-center bg-background px-4"><div className="max-w-md text-center"><p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Nouroul Foua'ad</p><h1 className="text-7xl font-bold text-primary">404</h1><h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2><p className="mt-2 text-sm text-muted-foreground">Cette page n'existe pas ou a été déplacée.</p><div className="mt-6"><Link to="/" className="inline-flex items-center justify-center rounded-full text-primary px-5 py-3 font-medium" style={{ background: "var(--gradient-gold)" }}>Retour à l'accueil</Link></div></div></div>;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return <div className="min-h-screen flex items-center justify-center bg-background px-4"><div className="max-w-md text-center"><p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Nouroul Foua'ad</p><h1 className="text-xl font-semibold tracking-tight text-foreground">Cette page n'a pas pu se charger</h1><p className="mt-2 text-sm text-muted-foreground">Réessayez ou revenez à l'accueil.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">Réessayer</button><a href="/" className="inline-flex items-center justify-center rounded-full border border-input px-5 py-3 text-sm font-medium text-foreground">Accueil</a></div></div></div>;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nouroul Foua'ad | Académie du Coran et des sciences islamiques" },
      { name: "description", content: "Académie Nouroul Foua'ad : Coran, tajwid, hadiths, fiqh, invocations et langue arabe avec accompagnement personnalisé." },
      { name: "author", content: "Nouroul Foua'ad" },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Nouroul Foua'ad" },
      { property: "og:title", content: "Nouroul Foua'ad | Académie en ligne" },
      { property: "og:description", content: "Apprendre le Coran, le tajwid, les hadiths, le fiqh et la langue arabe avec un parcours structuré." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Nouroul Foua'ad | Académie en ligne" },
      { name: "twitter:description", content: "Apprentissage du Coran, tajwid, hadiths, fiqh et langue arabe." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return <QueryClientProvider client={queryClient}><SiteLayout /></QueryClientProvider>;
}
