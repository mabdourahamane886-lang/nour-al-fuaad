import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IPayForm } from "@/components/IPayForm";
import { DepotDirect } from "@/components/DepotDirect";
import nitaLogo from "@/assets/nita.jpeg.asset.json";
import amanaLogo from "@/assets/amana.jpeg.asset.json";
import waveLogo from "@/assets/wave.jpeg.asset.json";

export const Route = createFileRoute("/paiement")({
  head: () => ({
    meta: [
      { title: "Paiement — NOUROUL FOUA'AD" },
      { name: "description", content: "Moyens de paiement acceptés : Wave, Visa, Mastercard, Orange Money, Amanata, NITA." },
    ],
  }),
  component: PaiementPage,
});

const methods = [
  { name: "Wave", logo: waveLogo.url, color: "from-blue-500 to-cyan-500" },
  { name: "Amanata", logo: amanaLogo.url, color: "from-green-500 to-emerald-600" },
  { name: "NITA", logo: nitaLogo.url, color: "from-yellow-500 to-amber-600" },
];

const plans = [
  {
    name: "Inscription Sciences",
    amount: 2500,
    programme: "Inscription Sciences",
    features: ["Frais d'inscription unique", "Coran, Hadith, Fiqh", "Support WhatsApp"],
  },
  {
    name: "Mensualité Sciences",
    amount: 4000,
    programme: "Mensualité",
    features: ["Paiement mensuel", "3 séances / semaine", "Accompagnement"],
  },
  {
    name: "Inscription Arabe",
    amount: 1000,
    programme: "Inscription Arabe",
    features: ["Frais d'inscription unique", "Langue arabe", "Suivi personnalisé"],
  },
  {
    name: "Langue Arabe — complet",
    amount: 3000,
    programme: "Arabe — complet",
    features: ["Cours en direct", "Exercices guidés", "Niveau avancé"],
  },
];

function PaiementPage() {
  const [selected, setSelected] = useState<{ amount: number; programme: string } | null>(null);

  const choose = (amount: number, programme: string) => {
    setSelected({ amount, programme });
    document.getElementById("ipay")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-emerald-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
            Système de Paiement
          </h1>
          <p className="text-emerald-900/70 text-lg max-w-3xl mx-auto">
            Payez vos inscriptions et mensualités à NOUROUL FOUA'AD via Wave, Visa, Mastercard, Orange Money, Amanata, NITA ou Moov Money.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-3xl p-8 shadow-xl hover:scale-105 transition-all duration-300 border ${
                selected?.programme === plan.programme ? "border-emerald-500 ring-2 ring-emerald-300" : "border-emerald-200"
              }`}
            >
              <h2 className="text-2xl font-bold mb-2 text-emerald-900">{plan.name}</h2>
              <div className="text-4xl font-bold text-emerald-600 mb-6">
                {plan.amount.toLocaleString("fr-FR")} <span className="text-xl">FCFA</span>
              </div>
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-emerald-900/80">{feature}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => choose(plan.amount, plan.programme)}
                className="block text-center w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold hover:opacity-90 transition"
              >
                Payer avec iPay Money
              </button>
            </div>
          ))}
        </div>

        <div id="ipay" className="scroll-mt-8">
          <IPayForm presetAmount={selected?.amount} presetProgramme={selected?.programme} />
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-green-700 rounded-3xl p-8 mb-12 text-center shadow-2xl text-white">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/20 border border-white/30 mb-3">
            Paiement instantané
          </div>
          <h2 className="text-3xl font-bold mb-3">Payer directement via iPay Money</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Accédez à notre guichet iPay officiel pour régler vos frais en quelques secondes
            (Mobile Money, carte bancaire). Confirmation immédiate.
          </p>
          <a
            href="https://i-pay.money/merchant_payment_desks/684229018389"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-emerald-700 font-semibold hover:scale-105 transition-transform"
          >
            Ouvrir le guichet iPay Money →
          </a>
        </div>

        <div className="bg-white border border-emerald-200 rounded-3xl p-8 mb-12 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-emerald-900">Méthodes de paiement</h2>
              <p className="text-emerald-900/70">Compatible avec les paiements mobiles.</p>
            </div>
            <div className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 w-fit">
              Système sécurisé
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {methods.map((method, index) => (
              <div key={index} className={`rounded-3xl p-5 bg-gradient-to-br ${method.color} shadow-xl text-center text-white hover:scale-105 transition-all duration-300`}>
                <img
                  src={method.logo}
                  alt={`Logo ${method.name}`}
                  loading="lazy"
                  className="mx-auto mb-3 h-12 w-12 rounded-xl object-contain bg-white p-1"
                />
                <div className="font-bold">{method.name}</div>
              </div>
            ))}
          </div>
        </div>

        <DepotDirect />

        <div className="text-center text-emerald-900/60">
          © {new Date().getFullYear()} NOUROUL FOUA'AD • Niger 🇳🇪
        </div>
      </div>
    </div>
  );
}