import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link, useNavigate } from "@tanstack/react-router";
import { createIPayMobilePayment } from "@/lib/ipay.functions";
import { supabase } from "@/integrations/supabase/client";

const presets = [
  { label: "Inscription Sciences", value: 2500 },
  { label: "Inscription Arabe", value: 1000 },
  { label: "Début Arabe", value: 2500 },
  { label: "Arabe — complet", value: 3000 },
  { label: "Mensualité", value: 4000 },
];

// Normalise un numéro Niger : retire +, espaces, indicatif 227 / 00227.
// Renvoie 8 chiffres locaux (ou la saisie nettoyée si ce n'est pas un format Niger).
function normalizeNigerMsisdn(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00227")) d = d.slice(5);
  else if (d.startsWith("227") && d.length === 11) d = d.slice(3);
  return d;
}

export function IPayForm() {
  const pay = useServerFn(createIPayMobilePayment);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [msisdn, setMsisdn] = useState("");
  const [msisdnError, setMsisdnError] = useState<string | null>(null);
  const [amount, setAmount] = useState(2500);
  const [programme, setProgramme] = useState(presets[0].label);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    | null
    | { kind: "error"; message: string }
    | { kind: "success"; status: string; reference: string; transaction_id: string }
  >(null);

  // Realtime: dès que le webhook iPay met à jour la ligne, on rafraîchit le statut.
  useEffect(() => {
    if (result?.kind !== "success") return;
    const txId = result.transaction_id;
    const ch = supabase
      .channel(`pay-${txId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "payments", filter: `transaction_id=eq.${txId}` },
        (payload) => {
          const row = payload.new as { status?: string; reference?: string | null };
          setResult((prev) =>
            prev?.kind === "success"
              ? { ...prev, status: row.status ?? prev.status, reference: row.reference ?? prev.reference }
              : prev,
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [result]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const localMsisdn = normalizeNigerMsisdn(msisdn);
    if (localMsisdn.length !== 8) {
      setMsisdnError("Numéro invalide : 8 chiffres attendus (ex. 88376133), avec ou sans 227.");
      return;
    }
    setMsisdnError(null);
    setLoading(true);
    setResult(null);
    try {
      const transaction_id = `NF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const res = await pay({
        data: {
          customer_name: name.trim(),
          msisdn: localMsisdn,
          amount: Number(amount),
          transaction_id,
          programme,
        },
      });
      if (!res.ok) setResult({ kind: "error", message: res.message });
      else {
        setResult({
          kind: "success",
          status: res.status,
          reference: res.reference,
          transaction_id: res.transaction_id,
        });
        // Redirection vers la page de statut dédiée (mise à jour automatique).
        navigate({ to: "/statut/$transactionId", params: { transactionId: res.transaction_id } });
      }
    } catch (err) {
      setResult({ kind: "error", message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-emerald-200 rounded-3xl p-8 mb-12 shadow-xl text-emerald-950">
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 border border-emerald-300">
          Nouveau
        </span>
        <h2 className="text-3xl font-bold text-emerald-900">Payer en ligne via iPay Money</h2>
      </div>
      <p className="text-emerald-900/70 mb-6">
        Mobile Money : MyNita, Amana ta, Wave, Orange Money, Moov Money. Vous recevrez une notification
        sur votre téléphone pour confirmer le paiement — le statut se met à jour automatiquement.
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
            value={msisdn}
            inputMode="numeric"
            maxLength={15}
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
          <div className="flex flex-wrap gap-2 mb-3">
            {presets.map((p) => (
              <button
                type="button"
                key={p.label}
                onClick={() => {
                  setAmount(p.value);
                  setProgramme(p.label);
                }}
                className={`px-3 py-2 text-sm rounded-full border transition ${
                  amount === p.value
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
          {loading ? "Envoi en cours…" : `Payer ${amount.toLocaleString("fr-FR")} FCFA`}
        </button>
      </form>

      {result?.kind === "error" && (
        <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {result.message}
        </div>
      )}
      {result?.kind === "success" && (
        <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm space-y-2">
          <div>
            Statut : <span className="font-semibold">{result.status}</span>
            {result.status === "pending" && <span className="ml-2 text-xs opacity-70">(mise à jour automatique…)</span>}
          </div>
          <div className="text-xs opacity-80">Référence : {result.reference || "—"}</div>
          {result.reference && (
            <Link to="/recu/$reference" params={{ reference: result.reference }} className="inline-block mt-2 text-xs underline">
              Voir / imprimer le reçu
            </Link>
          )}
        </div>
      )}
    </div>
  );
}