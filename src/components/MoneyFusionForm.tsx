import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createMoneyFusionPayment } from "@/lib/moneyfusion.functions";

const presets = [
  { label: "Inscription Sciences", value: 3000 },
  { label: "Inscription Arabe", value: 1500 },
  { label: "Début Arabe", value: 3000 },
  { label: "Arabe — complet", value: 4000 },
];

const niveaux = [
  { niveau: "Débutant", description: "Alphabetisation, bases de la lecture", value: 3000 },
  { niveau: "Intermédiaire", description: "Lecture courante, mémorisation, fiqh", value: 4000 },
  { niveau: "Avancé", description: "Tafsir, hadiths approfondis, perfectionnement", value: 5000 },
];

function normalizeNigerMsisdn(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00227")) d = d.slice(5);
  else if (d.startsWith("227") && d.length === 11) d = d.slice(3);
  return d;
}

export function MoneyFusionForm({
  presetAmount,
  presetProgramme,
}: { presetAmount?: number; presetProgramme?: string } = {}) {
  const pay = useServerFn(createMoneyFusionPayment);

  const [name, setName] = useState("");
  const [msisdn, setMsisdn] = useState("");
  const [msisdnError, setMsisdnError] = useState<string | null>(null);
  const [amount, setAmount] = useState(presetAmount ?? 3000);
  const [programme, setProgramme] = useState(presetProgramme ?? presets[0].label);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (presetAmount) setAmount(presetAmount);
    if (presetProgramme) setProgramme(presetProgramme);
  }, [presetAmount, presetProgramme]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const local = normalizeNigerMsisdn(msisdn);
    if (local.length < 8) {
      setMsisdnError("Numéro invalide : 8 chiffres attendus (ex. 88376133), avec ou sans 227.");
      return;
    }
    setMsisdnError(null);
    setError(null);
    setLoading(true);
    try {
      const res = await pay({
        data: {
          customer_name: name.trim(),
          msisdn: local,
          amount: Number(amount),
          programme,
          origin: window.location.origin,
        },
      });
      if (!res.ok) setError(res.message);
      else window.location.href = res.url;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-emerald-200 rounded-3xl p-8 mb-12 shadow-xl text-emerald-950">
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 border border-emerald-300">
          Recommandé
        </span>
        <h2 className="text-3xl font-bold text-emerald-900">Payer en ligne</h2>
      </div>
      <p className="text-emerald-900/70 mb-6">
        Mobile Money sécurisé : Wave, Orange Money, MTN, Moov et cartes. Vous êtes redirigé vers la
        page de paiement, puis ramené automatiquement sur votre reçu.
      </p>

      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-emerald-700 mb-2">Nom complet</label>
          <input
            type="text"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-emerald-200 focus:border-emerald-500 outline-none text-emerald-950"
            placeholder="Votre nom"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-emerald-700 mb-2">Numéro Mobile Money</label>
          <input
            type="tel"
            required
            inputMode="numeric"
            maxLength={15}
            value={msisdn}
            onChange={(e) => {
              setMsisdn(e.target.value);
              if (msisdnError) setMsisdnError(null);
            }}
            onBlur={(e) => {
              const local = normalizeNigerMsisdn(e.target.value);
              if (local) setMsisdn(local);
            }}
            className={`w-full px-4 py-3 rounded-xl bg-white text-emerald-950 border outline-none ${
              msisdnError ? "border-red-500" : "border-emerald-200 focus:border-emerald-500"
            }`}
            placeholder="88376133 (ou 22788376133)"
            aria-invalid={msisdnError ? true : undefined}
          />
          <p className={`mt-1 text-xs ${msisdnError ? "text-red-500" : "text-emerald-900/60"}`}>
            {msisdnError ?? "8 chiffres locaux. L'indicatif 227 est retiré automatiquement."}
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs uppercase tracking-[0.2em] text-emerald-700 mb-2">Programme</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {presets.map((p) => (
              <button
                type="button"
                key={p.label}
                onClick={() => {
                  setAmount(p.value);
                  setProgramme(p.label);
                }}
                className={`px-3 py-2 text-sm rounded-full border transition ${
                  amount === p.value && programme === p.label
                    ? "bg-emerald-500 border-emerald-500 text-white font-semibold"
                    : "border-emerald-200 text-emerald-800 hover:border-emerald-400"
                }`}
              >
                {p.label} · {p.value.toLocaleString("fr-FR")} F
              </button>
            ))}
          </div>

          <p className="block text-xs uppercase tracking-[0.2em] text-emerald-700 mb-2">
            Mensualité par niveau
          </p>
          <div className="overflow-hidden rounded-xl border border-emerald-200 mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-50 text-emerald-800 text-left">
                  <th className="px-4 py-2 font-semibold">Niveau</th>
                  <th className="px-4 py-2 font-semibold hidden sm:table-cell">Contenu</th>
                  <th className="px-4 py-2 font-semibold">Montant / mois</th>
                  <th className="px-4 py-2" aria-label="Choisir" />
                </tr>
              </thead>
              <tbody>
                {niveaux.map((n) => {
                  const label = `Mensualité ${n.niveau}`;
                  const selected = programme === label;
                  return (
                    <tr key={n.niveau} className={`border-t border-emerald-100 ${selected ? "bg-emerald-50/70" : ""}`}>
                      <td className="px-4 py-2 font-medium text-emerald-950">{n.niveau}</td>
                      <td className="px-4 py-2 text-emerald-900/70 hidden sm:table-cell">{n.description}</td>
                      <td className="px-4 py-2 font-semibold text-emerald-800">
                        {n.value.toLocaleString("fr-FR")} F
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setAmount(n.value);
                            setProgramme(label);
                          }}
                          className={`px-3 py-1.5 text-xs rounded-full border transition ${
                            selected
                              ? "bg-emerald-500 border-emerald-500 text-white font-semibold"
                              : "border-emerald-300 text-emerald-800 hover:border-emerald-500"
                          }`}
                        >
                          {selected ? "Sélectionné" : "Choisir"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <input
            type="number"
            min={100}
            step={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl bg-white text-emerald-950 border border-emerald-200 focus:border-emerald-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-700 text-white font-semibold disabled:opacity-60 hover:opacity-90 transition"
        >
          {loading ? "Redirection en cours…" : `Payer ${amount.toLocaleString("fr-FR")} FCFA`}
        </button>
      </form>

      {error && (
        <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
    </div>
  );
}
