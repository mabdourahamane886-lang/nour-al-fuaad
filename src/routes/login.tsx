import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion administrateur — NOUROUL FOUA'AD" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  // N'accepte qu'un chemin relatif same-origin.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (safeNext) window.location.href = safeNext;
        else navigate({ to: "/admin/paiements" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + (safeNext ?? "/admin/paiements") },
        });
        if (error) throw error;
        setInfo("Compte créé. Vérifiez votre email pour confirmer, puis demandez à devenir administrateur.");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-6">
      <form onSubmit={submit} className="w-full max-w-md bg-slate-900/60 border border-slate-700 rounded-3xl p-8 space-y-5">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Espace administrateur</h1>
          <p className="text-slate-400 text-sm mt-1">Accédez à l'historique des paiements iPay</p>
        </div>

        <div className="flex gap-2 text-sm">
          <button type="button" onClick={() => setMode("signin")} className={`flex-1 py-2 rounded-full ${mode === "signin" ? "bg-cyan-500 text-slate-950 font-semibold" : "border border-slate-700"}`}>Se connecter</button>
          <button type="button" onClick={() => setMode("signup")} className={`flex-1 py-2 rounded-full ${mode === "signup" ? "bg-cyan-500 text-slate-950 font-semibold" : "border border-slate-700"}`}>Créer un compte</button>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Mot de passe</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 outline-none" />
        </div>

        <button disabled={loading} type="submit" className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-60">
          {loading ? "..." : mode === "signin" ? "Connexion" : "Inscription"}
        </button>

        {error && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-3">{error}</div>}
        {info && <div className="text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">{info}</div>}
      </form>
    </div>
  );
}