import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createStripeCheckout } from "@/lib/stripe.functions";

const presets = [
  { label: "Inscription Sciences", value: 3000 },
  { label: "Inscription Arabe", value: 1500 },
  { label: "Mensualité Débutant", value: 3000 },
  { label: "Mensualité Intermédiaire", value: 4000 },
  { label: "Mensualité Avancé", value: 5000 },
  { label: "Arabe — complet", value: 4000 },
];

export function StripeForm({
  presetAmount,
  presetProgramme,
}: { presetAmount?: number; presetProgramme?: string } = {}) {
  const pay = useServerFn(createStripeCheckout);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
    setError(null);
    setLoading(true);
    try {
      const res = await pay({
        data: {
          customer_name: name.trim(),
          email: email.trim() || undefined,
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
          International
        </span>
        <h2 className="text-3xl font-bold text-emerald-900">Payer par carte bancaire</h2>
      </div>
      <p className="text-emerald-900/70 mb-6">
        Visa, Mastercard et cartes internationales via Stripe. Paiement sécurisé, puis retour
        automatique sur votre reçu.
      </p>

      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-emerald-700 mb-2">
            Nom complet
          </label>
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
          <label className="block text-xs uppercase tracking-[0.2em] text-emerald-700 mb-2">
            Email (reçu)
          </label>
          <input
            type="email"
            maxLength={120}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-emerald-200 focus:border-emerald-500 outline-none text-emerald-950"
            placeholder="vous@exemple.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs uppercase tracking-[0.2em] text-emerald-700 mb-2">
            Programme
          </label>
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
          {loading ? "Redirection en cours…" : `Payer ${amount.toLocaleString("fr-FR")} FCFA par carte`}
        </button>
      </form>

      {error && (
        <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
