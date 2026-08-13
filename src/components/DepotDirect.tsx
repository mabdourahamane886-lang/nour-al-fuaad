import { useState } from "react";

const NUMBER = "88376133";
const NUMBER_DISPLAY = "+227 88 37 61 33";

const operators = [
  { name: "My Nita", icon: "🇳🇪", hint: "Dépôt sur compte My Nita" },
  { name: "Amana ta", icon: "🛡️", hint: "Dépôt sur compte Amana ta" },
  { name: "Wave", icon: "🌊", hint: "Envoi Wave instantané" },
];

export function DepotDirect() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="bg-white border border-emerald-200 rounded-3xl p-8 mb-12 shadow-xl">
      <div className="text-center mb-8">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 border border-emerald-300 mb-3">
          Dépôt direct
        </span>
        <h2 className="text-3xl font-bold text-emerald-900 mb-2">
          Un seul numéro pour My Nita, Amana ta et Wave
        </h2>
        <p className="text-emerald-900/70 max-w-2xl mx-auto">
          Ce numéro est connecté aux trois comptes. Faites votre dépôt, puis envoyez la capture du
          reçu sur WhatsApp pour validation de votre inscription.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        <a href={`tel:+227${NUMBER}`} className="text-4xl md:text-5xl font-bold text-emerald-700 tracking-wide">
          {NUMBER_DISPLAY}
        </a>
        <button
          type="button"
          onClick={copy}
          className="px-4 py-2 rounded-full border border-emerald-300 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition"
        >
          {copied ? "Copié ✓" : "Copier le numéro"}
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {operators.map((op) => (
          <div
            key={op.name}
            className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 text-center hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">{op.icon}</div>
            <div className="font-bold text-emerald-900 text-lg">{op.name}</div>
            <div className="text-sm text-emerald-900/70 mt-1">{op.hint}</div>
            <div className="mt-3 font-semibold text-emerald-700">{NUMBER_DISPLAY}</div>
          </div>
        ))}
      </div>

      <ol className="max-w-2xl mx-auto space-y-2 text-emerald-900/80 mb-8">
        <li>1. Choisissez My Nita, Amana ta ou Wave sur votre téléphone.</li>
        <li>2. Envoyez le montant de votre programme au {NUMBER_DISPLAY}.</li>
        <li>3. Envoyez la capture du reçu sur WhatsApp avec votre nom et le programme.</li>
      </ol>

      <div className="text-center">
        <a
          href={`https://wa.me/227${NUMBER}?text=${encodeURIComponent(
            "Assalamou aleykoum, j'ai effectué un dépôt (My Nita / Amana ta / Wave). Nom : ... , Programme : ... , Montant : ... FCFA. Voici le reçu.",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-700 text-white font-semibold hover:scale-105 transition-transform"
        >
          Envoyer le reçu via WhatsApp
        </a>
      </div>
    </div>
  );
}