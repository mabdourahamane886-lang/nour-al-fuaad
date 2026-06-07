import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/statut/$transactionId")({
  head: () => ({
    meta: [
      { title: "Statut du paiement — NOUROUL FOUA'AD" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StatutPage,
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

function StatutPage() {
  const { transactionId } = Route.useParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("payments")
        .select(
          "reference, transaction_id, customer_name, msisdn, amount, programme, status, created_at, paid_at",
        )
        .eq("transaction_id", transactionId)
        .maybeSingle();
      if (mounted) {
        setPayment(data as Payment | null);
        setLoading(false);
      }
    };
    load();
    const ch = supabase
      .channel(`statut-${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "payments",
          filter: `transaction_id=eq.${transactionId}`,
        },
        () => load(),
      )
      .subscribe();
    // Filet de sécurité : re-poll toutes les 5 s tant qu'on est en attente.
    const poll = setInterval(() => {
      if (mounted && (!payment || payment.status === "pending")) load();
    }, 5000);
    return () => {
      mounted = false;
      clearInterval(poll);
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Chargement du statut…
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300 p-6 text-center">
        <div className="text-2xl font-bold mb-2">Transaction introuvable</div>
        <div className="text-slate-500 mb-6">Vérifiez votre lien ou contactez-nous.</div>
        <Link to="/paiement" className="text-cyan-400 underline">Retour au paiement</Link>
      </div>
    );
  }

  const meta = STATUS_META[payment.status] ?? STATUS_META.pending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-3xl p-10 text-center shadow-2xl border ${meta.card}`}>
          <div className="text-6xl mb-4" aria-hidden>{meta.icon}</div>
          <h1 className="text-4xl font-bold mb-2">{meta.title}</h1>
          <p className="text-slate-200/90 mb-6">{meta.description}</p>
          {payment.status === "pending" && (
            <div className="inline-flex items-center gap-2 text-sm text-amber-200 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              Mise à jour automatique en cours…
            </div>
          )}
        </div>

        <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-8 mt-6 space-y-4">
          <Row label="Client" value={payment.customer_name} />
          <Row label="Téléphone" value={payment.msisdn} />
          <Row label="Programme" value={payment.programme ?? "—"} />
          <Row label="Montant" value={`${payment.amount.toLocaleString("fr-FR")} FCFA`} />
          <Row label="Référence iPay" value={payment.reference ?? "En attente…"} mono />
          <Row label="Transaction" value={payment.transaction_id} mono />
          <Row label="Initié le" value={new Date(payment.created_at).toLocaleString("fr-FR")} />
          {payment.paid_at && (
            <Row label="Payé le" value={new Date(payment.paid_at).toLocaleString("fr-FR")} />
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {payment.reference && (
            <Link
              to="/recu/$reference"
              params={{ reference: payment.reference }}
              className="px-5 py-3 rounded-xl bg-white text-slate-900 font-semibold"
            >
              Voir / imprimer le reçu
            </Link>
          )}
          <a
            href={`https://wa.me/22788376133?text=${encodeURIComponent(
              `Bonjour, ma transaction ${payment.transaction_id} est ${statusFr(payment.status)}.`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl border border-slate-600 text-slate-200"
          >
            Contacter via WhatsApp
          </a>
          <Link to="/paiement" className="px-5 py-3 rounded-xl text-slate-400 hover:text-white">
            ← Nouveau paiement
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3 last:border-0 last:pb-0">
      <div className="text-xs uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`text-sm text-right ${mono ? "font-mono" : "font-medium"}`}>{value}</div>
    </div>
  );
}

function statusFr(s: string) {
  return { success: "validée", pending: "en attente", failed: "en échec", cancelled: "annulée" }[s] ?? s;
}

const STATUS_META: Record<
  string,
  { title: string; description: string; icon: string; card: string }
> = {
  pending: {
    title: "Paiement en attente",
    description:
      "Confirmez la transaction sur votre téléphone (Mobile Money). Cette page se met à jour automatiquement.",
    icon: "⏳",
    card: "bg-amber-500/10 border-amber-500/30",
  },
  success: {
    title: "Paiement validé ✅",
    description: "Merci ! Votre paiement a bien été reçu. Vous pouvez télécharger votre reçu ci-dessous.",
    icon: "🎉",
    card: "bg-emerald-500/10 border-emerald-500/30",
  },
  failed: {
    title: "Paiement échoué",
    description:
      "La transaction n'a pas abouti. Vérifiez votre solde puis réessayez, ou contactez-nous via WhatsApp.",
    icon: "❌",
    card: "bg-red-500/10 border-red-500/30",
  },
  cancelled: {
    title: "Paiement annulé",
    description: "Vous avez annulé la transaction. Vous pouvez en relancer une à tout moment.",
    icon: "🚫",
    card: "bg-slate-500/10 border-slate-500/30",
  },
};