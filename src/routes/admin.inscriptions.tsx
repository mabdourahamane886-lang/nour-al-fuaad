import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listInscriptions, updateInscriptionStatus } from "@/lib/inscriptions.functions";

export const Route = createFileRoute("/admin/inscriptions")({
  head: () => ({
    meta: [{ title: "Admin — Inscriptions" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminInscriptionsPage,
});

type Row = {
  id: string;
  tracking_code: string;
  customer_name: string;
  whatsapp: string;
  programme: string;
  status: string;
  note: string | null;
  created_at: string;
  validated_at: string | null;
  access_granted_at: string | null;
};

const FILTERS = ["all", "pending", "validated", "access_granted"] as const;
const LABEL: Record<string, string> = {
  all: "Toutes",
  pending: "En attente",
  validated: "Validées",
  access_granted: "Accès ouvert",
};

function AdminInscriptionsPage() {
  const navigate = useNavigate();
  const fetchList = useServerFn(listInscriptions);
  const update = useServerFn(updateInscriptionStatus);

  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (s: (typeof FILTERS)[number]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchList({ data: { status: s } });
      setRows(res.rows as Row[]);
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
      if (!data.session) navigate({ to: "/login", search: { next: "/admin/inscriptions" } });
      else load(filter);
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (id: string, status: "pending" | "validated" | "access_granted") => {
    try {
      await update({ data: { id, status } });
      await load(filter);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">Inscriptions</h1>
          <Link to="/admin/paiements" className="text-sm text-cyan-400 underline">
            Voir les paiements →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                load(f);
              }}
              className={`px-4 py-2 rounded-full text-sm border ${
                filter === f
                  ? "bg-cyan-500 text-slate-950 border-cyan-500 font-semibold"
                  : "border-slate-700 text-slate-300"
              }`}
            >
              {LABEL[f]}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">Chargement…</p>
        ) : rows.length === 0 ? (
          <p className="text-slate-400">Aucune inscription pour ce filtre.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-400 text-left">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Nom</th>
                  <th className="p-3">WhatsApp</th>
                  <th className="p-3">Programme</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Reçue le</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-slate-800">
                    <td className="p-3 font-mono text-xs">{r.tracking_code}</td>
                    <td className="p-3">{r.customer_name}</td>
                    <td className="p-3">{r.whatsapp}</td>
                    <td className="p-3">{r.programme}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-slate-800 border border-slate-700">
                        {LABEL[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-xs">
                      {new Date(r.created_at).toLocaleString("fr-FR")}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {r.status !== "validated" && (
                          <button
                            onClick={() => setStatus(r.id, "validated")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-semibold"
                          >
                            Valider
                          </button>
                        )}
                        {r.status !== "access_granted" && (
                          <button
                            onClick={() => setStatus(r.id, "access_granted")}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-semibold"
                          >
                            Ouvrir l'accès
                          </button>
                        )}
                        {r.status !== "pending" && (
                          <button
                            onClick={() => setStatus(r.id, "pending")}
                            className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300"
                          >
                            Remettre en attente
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
