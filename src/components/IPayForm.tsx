import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createIPayMobilePayment, getIPayStatus } from "@/lib/ipay.functions";

const presets = [
  { label: "Inscription Sciences", value: 3000 },
  { label: "Inscription Arabe", value: 1500 },
  { label: "Début Arabe", value: 3000 },
  { label: "Arabe — complet", value: 4000 },
  { label: "Mensualité", value: 5000 },
];

export function IPayForm() {
  const pay = useServerFn(createIPayMobilePayment);
  const check = useServerFn(getIPayStatus);

  const [name, setName] = useState("");
  const [msisdn, setMsisdn] = useState("");
  const [amount, setAmount] = useState(3000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    | null
    | { kind: "error"; message: string }
    | { kind: "success"; status: string; reference: string }
  >(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const transaction_id = `NF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const res = await pay({
        data: {
          customer_name: name.trim(),
          msisdn: msisdn.replace(/\D/g, ""),
          amount: Number(amount),
          transaction_id,
        },
      });
      if (!res.ok) setResult({ kind: "error", message: res.message });
      else setResult({ kind: "success", status: res.status, reference: res.reference });
    } catch (err) {
      setResult({ kind: "error", message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (result?.kind !== "success") return;
    const r = await check({ data: { reference: result.reference } });
    if (r.ok && r.status) {
      setResult({ kind: "success", status: r.status, reference: result.reference });
    } else if (!r.ok) {
      setResult({ kind: "error", message: r.message });
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-8 mb-12">
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          Nouveau
        </span>
        <h2 className="text-3xl font-bold">Payer en ligne via iPay Money</h2>
      </div>
      <p className="text-slate-400 mb-6">
        Mobile Money : MyNita, Amana ta, Wave, Orange Money. Vous recevrez une notification
        sur votre téléphone pour confirmer le paiement.
      </p>

      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Nom complet</label>
          <input
            type="text"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 outline-none"
            placeholder="Votre nom"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Numéro Mobile Money</label>
          <input
            type="tel"
            required
            value={msisdn}
            onChange={(e) => setMsisdn(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 outline-none"
            placeholder="227XXXXXXXX"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Programme</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {presets.map((p) => (
              <button
                type="button"
                key={p.label}
                onClick={() => setAmount(p.value)}
                className={`px-3 py-2 text-sm rounded-full border transition ${
                  amount === p.value
                    ? "bg-cyan-500 border-cyan-500 text-slate-950 font-semibold"
                    : "border-slate-700 text-slate-300 hover:border-cyan-500/50"
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
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-60 hover:opacity-90 transition"
        >
          {loading ? "Envoi en cours…" : `Payer ${amount.toLocaleString("fr-FR")} FCFA`}
        </button>
      </form>

      {result?.kind === "error" && (
        <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {result.message}
        </div>
      )}
      {result?.kind === "success" && (
        <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm space-y-2">
          <div>
            Statut : <span className="font-semibold">{result.status}</span>
          </div>
          <div className="text-xs opacity-80">Référence : {result.reference}</div>
          <button
            type="button"
            onClick={refresh}
            className="text-xs underline opacity-90 hover:opacity-100"
          >
            Actualiser le statut
          </button>
        </div>
      )}
    </div>
  );
}