import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createStudentAccount } from "@/lib/student.functions";

export const Route = createFileRoute("/etudiant/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion étudiant — NOUROUL FOUA'AD" },
      { name: "description", content: "Connectez-vous à votre espace étudiant Nouroul Foua'ad." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentLoginPage,
});

function StudentLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          const normalized = error.message.toLowerCase();
          if (normalized.includes("email not confirmed") || normalized.includes("email not verified")) {
            throw new Error("Votre e-mail n'est pas encore confirmé. Vérifiez votre boîte de réception (et vos spams) puis cliquez sur le lien de confirmation, ou réessayez dans quelques minutes.");
          }
          throw error;
        }

        navigate({ to: "/etudiant/dashboard" });
      } else {
        await createStudentAccount({ data: { email, password, full_name: fullName } });

        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        navigate({ to: "/etudiant/dashboard" });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[78vh] flex items-center justify-center px-6 py-14">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">Espace étudiant</p>
        <h1 className="text-4xl text-primary mb-3">Connexion</h1>
        <p className="text-muted-foreground mb-7">
          Retrouvez vos cours, votre progression, vos évaluations et vos informations de formation.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-xl py-2.5 border ${mode === "signin" ? "bg-accent text-white border-accent" : "border-border"}`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-xl py-2.5 border ${mode === "signup" ? "bg-accent text-white border-accent" : "border-border"}`}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Nom complet</span>
              <input
                required
                minLength={2}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3.5"
              />
            </label>
          )}

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3.5"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Mot de passe</span>
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3.5"
            />
          </label>

          <button
            disabled={loading}
            className="w-full rounded-2xl py-3.5 font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--gradient-hero)" }}
          >
            {loading ? "Chargement…" : mode === "signin" ? "Ouvrir mon espace" : "Créer mon compte"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground">
          L’inscription crée directement votre compte. Une fois connecté, utilisez votre code de suivi et les 4 derniers chiffres de votre WhatsApp pour lier votre dossier étudiant.
        </div>
      </div>
    </main>
  );
}
