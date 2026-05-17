import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/recu/$reference")({
  head: () => ({ meta: [{ title: "Reçu de paiement — NOUROUL FOUA'AD" }, { name: "robots", content: "noindex" }] }),
  component: ReceiptPage,
});

type Payment = {
  reference: string | null;
  transaction_id: string;
  customer_name: string;
  msisdn: string;
  amount: number;
  programme: string | null;
  status: string;
  created_at: string;
  paid_at: string | null;
};

function ReceiptPage() {
  const { reference } = Route.useParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("payments")
        .select("reference, transaction_id, customer_name, msisdn, amount, programme, status, created_at, paid_at")
        .eq("reference", reference)
        .maybeSingle();
      if (mounted) {
        setPayment(data as Payment | null);
        setLoading(false);
      }
    };
    load();
    const ch = supabase
      .channel(`recu-${reference}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "payments", filter: `reference=eq.${reference}` }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [reference]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Chargement…</div>;
  if (!payment) return <div className="min-h-screen flex items-center justify-center text-slate-500">Reçu introuvable.</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6 print:bg-white">
      <div className="max-w-2xl mx-auto bg-white text-slate-900 rounded-3xl shadow-xl p-10 print:shadow-none print:rounded-none">
        <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-6">
          <div>
            <div className="text-2xl font-bold tracking-wide">NOUROUL FOUA'AD</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">Reçu de paiement</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Référence</div>
            <div className="font-mono text-sm">{payment.reference}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <Field label="Client" value={payment.customer_name} />
          <Field label="Téléphone" value={payment.msisdn} />
          <Field label="Programme" value={payment.programme ?? "—"} />
          <Field label="Date" value={new Date(payment.created_at).toLocaleString("fr-FR")} />
          <Field label="Statut" value={
            <span className={statusClass(payment.status)}>{statusLabel(payment.status)}</span>
          } />
          <Field label="Date paiement" value={payment.paid_at ? new Date(payment.paid_at).toLocaleString("fr-FR") : "—"} />
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">Montant payé</div>
          <div className="text-3xl font-bold">{payment.amount.toLocaleString("fr-FR")} FCFA</div>
        </div>

        <div className="text-xs text-slate-500 mt-8 border-t pt-4">
          Transaction : {payment.transaction_id} · Paiement effectué via iPay Money.
          <br />Pour toute question : +227 88 37 61 33.
        </div>

        <div className="mt-8 flex gap-3 print:hidden">
          <button onClick={() => window.print()} className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold">
            Imprimer / Enregistrer PDF
          </button>
          <a href={`https://wa.me/22788376133?text=${encodeURIComponent(`Bonjour, voici ma référence de paiement : ${payment.reference}`)}`}
             target="_blank" rel="noopener noreferrer"
             className="px-5 py-2 rounded-xl border border-slate-300 text-sm">
            Envoyer via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function statusLabel(s: string) {
  return { success: "Payé", pending: "En attente", failed: "Échec", cancelled: "Annulé" }[s] ?? s;
}
function statusClass(s: string) {
  return {
    success: "text-emerald-700 font-semibold",
    pending: "text-amber-700 font-semibold",
    failed: "text-red-700 font-semibold",
    cancelled: "text-slate-600 font-semibold",
  }[s] ?? "text-slate-700";
}