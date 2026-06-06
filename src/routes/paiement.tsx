import { createFileRoute } from "@tanstack/react-router";
import { IPayForm } from "@/components/IPayForm";

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
  { name: "Wave", icon: "🌊", color: "from-blue-500 to-cyan-500" },
  { name: "Visa", icon: "💳", color: "from-indigo-500 to-blue-600" },
  { name: "Mastercard", icon: "🏦", color: "from-orange-500 to-red-500" },
  { name: "Orange Money", icon: "🟧", color: "from-orange-400 to-orange-600" },
  { name: "Amanata", icon: "🛡️", color: "from-green-500 to-emerald-600" },
  { name: "NITA", icon: "🇳🇪", color: "from-yellow-500 to-amber-600" },
];

const plans = [
  { name: "Inscription", price: "1 000 – 2 500 FCFA", features: ["Accès à un programme", "Suivi personnalisé", "Support WhatsApp"] },
  { name: "Mensualité Sciences", price: "4 000 FCFA", features: ["Coran, Hadith, Fiqh", "3 séances / semaine", "Accompagnement"] },
  { name: "Langue Arabe", price: "2 500 – 3 000 FCFA", features: ["Débutant ou avancé", "Cours en direct", "Exercices guidés"] },
];

function PaiementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Système de Paiement
          </h1>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            Payez vos inscriptions et mensualités à NOUROUL FOUA'AD via Wave, Visa, Mastercard, Orange Money, Amanata ou NITA.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <div key={index} className="bg-slate-900/60 border border-slate-700 rounded-3xl p-8 shadow-2xl hover:scale-105 transition-all duration-300">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <div className="text-4xl font-bold text-cyan-400 mb-6">{plan.price}</div>
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://wa.me/22788376133"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:opacity-90 transition"
              >
                Choisir ce plan
              </a>
            </div>
          ))}
        </div>

        <IPayForm />

        <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Méthodes de paiement</h2>
              <p className="text-slate-400">Compatible avec les paiements mobiles et cartes bancaires.</p>
            </div>
            <div className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 w-fit">
              Système sécurisé
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {methods.map((method, index) => (
              <div key={index} className={`rounded-3xl p-5 bg-gradient-to-br ${method.color} shadow-xl text-center hover:scale-105 transition-all duration-300`}>
                <div className="text-4xl mb-3">{method.icon}</div>
                <div className="font-bold">{method.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-3xl p-10 text-center shadow-2xl mb-12">
          <h2 className="text-4xl font-bold mb-4">Numéro de dépôt</h2>
          <p className="text-lg text-slate-100 mb-6 max-w-2xl mx-auto">
            Effectuez votre dépôt sur My Nita, Amana ta ou Wave, puis envoyez le justificatif via WhatsApp.
          </p>
          <a href="tel:+22788376133" className="inline-block text-5xl font-bold tracking-wide mb-6">+227 88 37 61 33</a>
          <div>
            <a
              href="https://wa.me/22788376133"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-cyan-700 font-semibold hover:scale-105 transition-transform"
            >
              Envoyer le justificatif via WhatsApp
            </a>
          </div>
        </div>

        <div className="text-center text-slate-500">
          © {new Date().getFullYear()} NOUROUL FOUA'AD • Niger 🇳🇪
        </div>
      </div>
    </div>
  );
}