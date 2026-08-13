import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listPayments, getIPayConfigStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/paiements")({
  head: () => ({ meta: [{ title: "Admin — Paiements" }, { name: "robots", content: "noindex" }] }),
  component: AdminPaiementsPage,
});

type Payment = {
  id: string;
  transaction_id: string;
  reference: string | null;
  customer_name: string;
  msisdn: string;
  amount: number;
  programme: string | null;
  status: string;
  environment: string;
  created_at: string;
  paid_at: string | null;
};

function AdminPaiementsPage() {
  const navigate = useNavigate();
  const fetchList = useServerFn(listPayments);
  const fetchCfg = useServerFn(getIPayConfigStatus);

  const [status, setStatus] = useState<"all" | "pending" | "success" | "failed" | "cancelled">("all");
  const [rows, setRows] = useState<Payment[]>([]);
  const [sumToday, setSumToday] = useState(0);
  const [sumMonth, setSumMonth] = useState(0);
  const [cfg, setCfg] = useState<{ privateKey: boolean; webhookSecret: boolean; environment: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (s: typeof status) => {
    setLoading(true);
    setError(null);
    try {
      const [list, config] = await Promise.all([
        fetchList({ data: { status: s, limit: 100 } }),
        fetchCfg().catch(() => null),
      ]);
      setRows(list.rows as Payment[]);
      setSumToday(list.sumToday);
      setSumMonth(list.sumMonth);
      if (config) setCfg(config);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) navigate({ to: "/login", search: { next: "/admin/paiements" } });
      else load(status);
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Realtime — refresh on payment changes
  useEffect(() => {
    const ch = supabase
      .channel("admin-payments")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => load(status))
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Paiements — Admin</h1>
            <p className="text-slate-400 mt-1">Historique iPay Money en temps réel.</p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/login", search: { next: "/admin/paiements" } });
            }}
            className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 text-sm"
          >
            Se déconnecter
          </button>
        </div>

        {/* Config iPay */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Stat title="Encaissé aujourd'hui" value={`${sumToday.toLocaleString("fr-FR")} F`} />
          <Stat title="Encaissé ce mois" value={`${sumMonth.toLocaleString("fr-FR")} F`} />
          <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">Config iPay</div>
            {cfg ? (
              <ul className="text-sm space-y-1">
                <li className="flex justify-between"><span>Clé privée</span><Badge ok={cfg.privateKey} /></li>
                <li className="flex justify-between"><span>Secret webhook</span><Badge ok={cfg.webhookSecret} /></li>
                <li className="flex justify-between"><span>Environnement</span><span className="text-cyan-300 font-semibold">{cfg.environment}</span></li>
              </ul>
            ) : (
              <div className="text-xs text-slate-500">Chargement…</div>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(["all", "pending", "success", "failed", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-sm rounded-full border ${status === s ? "bg-cyan-500 border-cyan-500 text-slate-950 font-semibold" : "border-slate-700"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>}

        {/* Liste */}
        <div className="bg-slate-900/60 border border-slate-700 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Client</th>
                <th className="text-left p-3">Téléphone</th>
                <th className="text-right p-3">Montant</th>
                <th className="text-left p-3">Programme</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-left p-3">Référence</th>
                <th className="text-right p-3">Reçu</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-slate-500">Chargement…</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-slate-500">Aucun paiement.</td></tr>
              )}
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-slate-800">
                  <td className="p-3 whitespace-nowrap text-slate-400">{new Date(p.created_at).toLocaleString("fr-FR")}</td>
                  <td className="p-3">{p.customer_name}</td>
                  <td className="p-3 text-slate-400">{p.msisdn}</td>
                  <td className="p-3 text-right font-semibold">{p.amount.toLocaleString("fr-FR")} F</td>
                  <td className="p-3 text-slate-400">{p.programme ?? "—"}</td>
                  <td className="p-3"><StatusPill status={p.status} /></td>
                  <td className="p-3 text-xs text-slate-500">{p.reference ?? "—"}</td>
                  <td className="p-3 text-right">
                    {p.reference ? (
                      <Link to="/recu/$reference" params={{ reference: p.reference }} className="text-cyan-400 hover:underline">Voir</Link>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">{title}</div>
      <div className="text-3xl font-bold text-cyan-300">{value}</div>
    </div>
  );
}

function Badge({ ok }: { ok: boolean }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${ok ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
      {ok ? "OK" : "manquant"}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    failed: "bg-red-500/20 text-red-300 border-red-500/30",
    cancelled: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${map[status] ?? map.pending}`}>{status}</span>;
}