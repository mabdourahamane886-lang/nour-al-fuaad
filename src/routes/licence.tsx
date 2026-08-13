import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { verifyLicense } from "@/lib/licenses.functions";

export const Route = createFileRoute("/licence")({
  head: () => ({
    meta: [
      { title: "Vérifier une licence d'accès — NOUROUL FOUA'AD" },
      {
        name: "description",
        content:
          "Vérifiez la validité d'un code de licence d'accès aux cours NOUROUL FOUA'AD délivré après paiement.",
      },
      { property: "og:title", content: "Vérifier une licence — NOUROUL FOUA'AD" },
      {
        property: "og:description",
        content: "Contrôle instantané des codes de licence délivrés après paiement iPay Money.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LicencePage,
});

type Result = Awaited<ReturnType<typeof verifyLicense>> | null;

function LicencePage() {
  const check = useServerFn(verifyLicense);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      setResult(await check({ data: { code } }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-emerald-950 p-6">
      <div className="max-w-xl mx-auto pt-12">
        <h1 className="text-4xl font-bold mb-3 text-emerald-900">Vérifier une licence</h1>
        <p className="text-emerald-900/70 mb-8">
          Saisissez le code reçu après validation de votre paiement (format NF-XXXX-XXXX-XXXX).
        </p>

        <form onSubmit={onSubmit} className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-xl space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            placeholder="NF-XXXX-XXXX-XXXX"
            className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 outline-none font-mono tracking-widest"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-700 text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Vérification…" : "Vérifier le code"}
          </button>
        </form>

        {result && (
          <div
            className={`mt-6 p-6 rounded-3xl border ${
              result.valid
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {result.valid ? (
              <>
                <div className="text-2xl font-bold mb-2">Licence valide ✅</div>
                <div className="text-sm space-y-1">
                  <div>Titulaire : {result.license?.customer_name}</div>
                  <div>Programme : {result.license?.programme ?? "—"}</div>
                  <div>
                    Valable jusqu'au{" "}
                    {result.license?.expires_at
                      ? new Date(result.license.expires_at).toLocaleDateString("fr-FR")
                      : "—"}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-lg font-semibold">
                {"expired" in result && result.expired
                  ? "Licence expirée — renouvelez votre paiement."
                  : "Code introuvable ou invalide."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}