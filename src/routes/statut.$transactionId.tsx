import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPublicPayment } from "@/lib/payment-status.functions";
import { getLicense } from "@/lib/licenses.functions";
import { jsPDF } from "jspdf";

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
  const fetchPayment = useServerFn(getPublicPayment);
  const fetchLicense = useServerFn(getLicense);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [license, setLicense] = useState<{
    code: string;
    programme: string | null;
    expires_at: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (payment?.status !== "success" || license) return;
    fetchLicense({ data: { transaction_id: transactionId } })
      .then((r) => setLicense(r.license))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment?.status]);

  useEffect(() => {
    let mounted = true;
    let current: Payment | null = null;
    const load = async () => {
      const res = await fetchPayment({ data: { transaction_id: transactionId } }).catch(() => ({
        payment: null,
      }));
      if (mounted) {
        current = res.payment as Payment | null;
        setPayment(current);
        setLoading(false);
      }
    };
    load();
    // Rafraîchissement toutes les 5 s tant que le paiement est en attente.
    const poll = setInterval(() => {
      if (mounted && (!current || current.status === "pending")) load();
    }, 5000);
    return () => {
      mounted = false;
      clearInterval(poll);
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
          <div className="mt-6 inline-flex flex-col items-center gap-2 px-5 py-4 rounded-2xl bg-black/30 border border-white/10">
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-300">
              Référence de transaction
            </div>
            <div className="font-mono text-lg text-white break-all">
              {payment.reference ?? payment.transaction_id}
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(payment.reference ?? payment.transaction_id);
              }}
              className="text-xs underline text-slate-300 hover:text-white"
            >
              Copier la référence
            </button>
          </div>
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

        {license && (
          <div className="mt-6 rounded-3xl p-8 bg-emerald-500/10 border border-emerald-500/30 text-center">
            <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-300 mb-2">
              Licence d'accès instantanée
            </div>
            <div className="font-mono text-2xl font-bold text-emerald-200 break-all">
              {license.code}
            </div>
            <div className="text-xs text-slate-300 mt-2">
              {license.programme ?? "Accès aux cours"} ·{" "}
              {license.expires_at
                ? `valable jusqu'au ${new Date(license.expires_at).toLocaleDateString("fr-FR")}`
                : "sans expiration"}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(license.code)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-semibold"
              >
                Copier le code
              </button>
              <Link to="/licence" className="px-4 py-2 rounded-xl border border-emerald-500/40 text-sm text-emerald-200">
                Vérifier la licence
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {payment.status === "success" && (
            <button
              onClick={() => downloadReceiptPdf(payment)}
              className="px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold"
            >
              Télécharger le reçu PDF
            </button>
          )}
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

function downloadReceiptPdf(p: Payment) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  let y = 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("NOUROUL FOUA'AD", w / 2, y, { align: "center" });
  y += 22;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110);
  doc.text("Reçu de paiement officiel", w / 2, y, { align: "center" });
  doc.setTextColor(0);

  y += 30;
  doc.setDrawColor(220);
  doc.line(50, y, w - 50, y);
  y += 30;

  const rows: Array<[string, string]> = [
    ["Client", p.customer_name],
    ["Téléphone", p.msisdn],
    ["Programme", p.programme ?? "—"],
    ["Référence iPay", p.reference ?? "—"],
    ["Transaction", p.transaction_id],
    ["Statut", "PAYÉ ✓"],
    ["Date d'initiation", new Date(p.created_at).toLocaleString("fr-FR")],
    ["Date de paiement", p.paid_at ? new Date(p.paid_at).toLocaleString("fr-FR") : "—"],
  ];
  doc.setFontSize(11);
  for (const [label, value] of rows) {
    doc.setTextColor(120);
    doc.text(label, 60, y);
    doc.setTextColor(20);
    doc.text(String(value), 220, y);
    y += 22;
  }

  y += 18;
  doc.setDrawColor(220);
  doc.line(50, y, w - 50, y);
  y += 30;
  doc.setFontSize(13);
  doc.setTextColor(110);
  doc.text("Montant payé", 60, y);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(`${p.amount.toLocaleString("fr-FR")} FCFA`, w - 60, y, { align: "right" });

  y += 50;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(140);
  doc.text("Paiement effectué via iPay Money — Contact : +227 88 37 61 33", w / 2, y, { align: "center" });

  doc.save(`recu-${p.reference ?? p.transaction_id}.pdf`);
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