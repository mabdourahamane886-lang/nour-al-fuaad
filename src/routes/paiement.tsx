import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IPayForm } from "@/components/IPayForm";
import { MoneyFusionForm } from "@/components/MoneyFusionForm";
import { StripeForm } from "@/components/StripeForm";
import { DepotDirect } from "@/components/DepotDirect";

export const Route = createFileRoute("/paiement")({
  head: () => ({
    meta: [
      { title: "Paiement — NOUROUL FOUA'AD" },
      { name: "description", content: "Moyens de paiement acceptés : Wave, Amana ta, NITA. Mensualités par niveau et inscriptions via iPay Money." },
    ],
  }),
  component: PaiementPage,
});

const plans = [
  {
    name: "Inscription Sciences",
    amount: 3000,
    programme: "Inscription Sciences",
    features: ["Frais d'inscription unique", "Coran, Hadith, Fiqh", "Support WhatsApp"],
  },
  {
    name: "Mensualité — Débutant",
    amount: 3000,
    programme: "Mensualité Débutant",
    features: ["Par mois", "3 séances / semaine", "Alphabetisation, bases"],
  },
  {
    name: "Mensualité — Intermédiaire",
    amount: 4000,
    programme: "Mensualité Intermédiaire",
    features: ["Par mois", "3 séances / semaine", "Mémorisation, fiqh"],
  },
  {
    name: "Mensualité — Avancé",
    amount: 5000,
    programme: "Mensualité Avancé",
    features: ["Par mois", "3 séances / semaine", "Tafsir, hadiths approfondis"],
  },
  {
    name: "Inscription Arabe",
    amount: 1500,
    programme: "Inscription Arabe",
    features: ["Frais d'inscription unique", "Langue arabe", "Suivi personnalisé"],
  },
  {
    name: "Langue Arabe — complet",
    amount: 4000,
    programme: "Arabe — complet",
    features: ["Cours en direct", "Exercices guidés", "Niveau avancé"],
  },
];

function PaiementPage() {
  const [selected, setSelected] = useState<{ amount: number; programme: string } | null>(null);

  const choose = (amount: number, programme: string) => {
    setSelected({ amount, programme });
    document.getElementById("paiement-en-ligne")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6 text-emerald-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-5xl font-bold text-transparent">
            Système de Paiement
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-emerald-900/70">
            Payez vos inscriptions et mensualités à NOUROUL FOUA'AD via Wave, Visa, Mastercard, Orange Money, Amanata, NITA ou Moov Money.
          </p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-3xl border bg-white p-8 shadow-xl transition-all duration-300 hover:scale-105 ${
                selected?.programme === plan.programme ? "border-emerald-500 ring-2 ring-emerald-300" : "border-emerald-200"
              }`}
            >
              <h2 className="mb-2 text-2xl font-bold text-emerald-900">{plan.name}</h2>
              <div className="mb-6 text-4xl font-bold text-emerald-600">
                {plan.amount.toLocaleString("fr-FR")} <span className="text-xl">FCFA</span>
              </div>
              <div className="mb-8 space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-emerald-900/80">{feature}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => choose(plan.amount, plan.programme)}
                className="block w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 py-3 text-center font-semibold text-white transition hover:opacity-90"
              >
                Payer en ligne
              </button>
            </div>
          ))}
        </div>

        <div id="paiement-en-ligne" className="scroll-mt-8">
          <MoneyFusionForm presetAmount={selected?.amount} presetProgramme={selected?.programme} />
        </div>

        <div id="paiement-carte" className="scroll-mt-8">
          <StripeForm presetAmount={selected?.amount} presetProgramme={selected?.programme} />
        </div>

        <details id="ipay" className="mb-12 scroll-mt-8 rounded-3xl border border-emerald-200 bg-white p-6">
          <summary className="cursor-pointer font-semibold text-emerald-900">Autre option : payer avec iPay Money (secours)</summary>
          <div className="mt-6">
            <IPayForm presetAmount={selected?.amount} presetProgramme={selected?.programme} />
          </div>
        </details>

        <div className="mb-12 rounded-3xl bg-gradient-to-r from-emerald-500 to-green-700 p-8 text-center text-white shadow-2xl">
          <div className="mb-3 inline-flex items-center rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs">Paiement instantané</div>
          <h2 className="mb-3 text-3xl font-bold">Payer directement via iPay Money</h2>
          <p className="mx-auto mb-6 max-w-2xl text-white/90">Accédez à notre guichet iPay officiel pour régler vos frais en quelques secondes (Mobile Money, carte bancaire). Confirmation immédiate.</p>
          <a href="https://i-pay.money/merchant_payment_desks/684229018389" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 font-semibold text-emerald-700 transition-transform hover:scale-105">
            Ouvrir le guichet iPay Money →
          </a>
        </div>

        <DepotDirect />

        <div className="text-center text-emerald-900/60">© {new Date().getFullYear()} NOUROUL FOUA'AD • Niger 🇳🇪</div>
      </div>
    </div>
  );
}
