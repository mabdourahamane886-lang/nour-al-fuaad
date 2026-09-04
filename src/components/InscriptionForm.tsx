import { useState } from "react";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { createInscription } from "@/lib/inscriptions.functions";

const schema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(80, "Nom trop long"),
  whatsapp: z
    .string()
    .trim()
    .min(6, "Numéro invalide")
    .max(20, "Numéro trop long")
    .regex(/^[0-9+\s]+$/, "Chiffres uniquement"),
  program: z.string().min(1, "Choisissez un programme"),
});

const programs = [
  "Mémorisation du Coran",
  "Hadiths",
  "Fiqh",
  "Langue arabe — Débutant",
  "Langue arabe — Apprentissage",
];

export function InscriptionForm() {
  const [values, setValues] = useState({ name: "", whatsapp: "", program: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const register = useServerFn(createInscription);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errs[issue.path[0] as string] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    let code: string | null = null;
    try {
      const res = await register({
        data: {
          customer_name: result.data.name,
          whatsapp: result.data.whatsapp,
          programme: result.data.program,
        },
      });
      code = res.tracking_code;
      setTrackingCode(code);
      window.localStorage.setItem("nf_tracking_code", code);
    } catch (err) {
      setErrors({ form: (err as Error).message });
    } finally {
      setSubmitting(false);
    }

    const message =
      `Assalâmu ‘alaykum,\n\nJe souhaite m'inscrire à NOUROUL FOUA'AD.\n\n` +
      `Nom : ${result.data.name}\n` +
      `WhatsApp : ${result.data.whatsapp}\n` +
      `Programme : ${result.data.program}\n` +
      (code ? `Code de suivi : ${code}\n` : "") +
      `\nMerci de m'indiquer la suite pour le paiement.`;
    const url = `https://wa.me/22788376133?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };


  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  return (
    <form onSubmit={onSubmit} className="p-8 md:p-10 rounded-2xl bg-card border border-border space-y-5" style={{ boxShadow: "0 4px 20px -10px oklch(0.28 0.07 160 / 0.2)" }}>
      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Nom complet</label>
        <input
          type="text"
          value={values.name}
          onChange={set("name")}
          maxLength={80}
          className="w-full px-4 py-3 rounded-lg bg-background border border-input focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition"
          placeholder="Votre nom"
        />
        {errors.name && <p className="text-xs text-destructive mt-1.5">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Numéro WhatsApp</label>
        <input
          type="tel"
          value={values.whatsapp}
          onChange={set("whatsapp")}
          maxLength={20}
          className="w-full px-4 py-3 rounded-lg bg-background border border-input focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition"
          placeholder="+227 ..."
        />
        {errors.whatsapp && <p className="text-xs text-destructive mt-1.5">{errors.whatsapp}</p>}
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Programme choisi</label>
        <select
          value={values.program}
          onChange={set("program")}
          className="w-full px-4 py-3 rounded-lg bg-background border border-input focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition"
        >
          <option value="">— Sélectionnez —</option>
          {programs.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {errors.program && <p className="text-xs text-destructive mt-1.5">{errors.program}</p>}
      </div>

      <button
        type="submit"
        className="w-full px-8 py-4 rounded-full text-primary-foreground font-medium hover:scale-[1.02] transition-transform"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}
      >
        Continuer vers le paiement
      </button>
      <p className="text-xs text-muted-foreground text-center">
        Vous serez redirigé vers WhatsApp pour finaliser le paiement avec un de nos enseignants.
      </p>
    </form>
  );
}