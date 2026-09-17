import { useState } from "react";

const NUMBER = "88376133";
const NUMBER_DISPLAY = "+227 88 37 61 33";

const operators = [
  { name: "Wave", logo: "/payments/wave.svg", hint: "Transfert via Wave", border: "border-sky-200", soft: "bg-sky-50", text: "text-blue-700", button: "bg-sky-500 hover:bg-sky-600" },
  { name: "NITA", logo: "/payments/nita.svg", hint: "Transfert via NITA", border: "border-orange-200", soft: "bg-orange-50", text: "text-orange-700", button: "bg-orange-500 hover:bg-orange-600" },
  { name: "AMANA", logo: "/payments/amana.svg", hint: "Transfert via AMANA", border: "border-emerald-200", soft: "bg-emerald-50", text: "text-emerald-700", button: "bg-emerald-600 hover:bg-emerald-700" },
];

export function DepotDirect() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="relative mb-12 overflow-hidden rounded-[2rem] border border-slate-100 bg-gradient-to-b from-white via-slate-50/40 to-white p-4 shadow-xl sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-40 [background-image:radial-gradient(circle_at_15%_20%,rgba(184,134,11,.10),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(184,134,11,.10),transparent_28%)]" />

      <div className="relative mx-auto mb-8 max-w-5xl text-center">
        <div className="mx-auto mb-4 flex items-center justify-center gap-5 sm:gap-8">
          <span className="hidden h-px w-24 bg-amber-600/70 sm:block md:w-40" />
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-500/60 bg-white text-amber-700 shadow-sm">
            <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" aria-hidden="true">
              <path d="M13 20h22M15 13h18a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V17a4 4 0 0 1 4-4Z" stroke="currentColor" strokeWidth="2.4" />
              <path d="M11 21h26M17 29h5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="hidden h-px w-24 bg-amber-600/70 sm:block md:w-40" />
        </div>

        <h2 className="mb-2 font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          Méthodes de <span className="text-amber-700">paiement</span>
        </h2>
        <p className="mx-auto max-w-4xl text-base leading-relaxed text-slate-600 sm:text-lg md:text-xl">
          Choisissez votre moyen de paiement et effectuez le transfert aux numéros ci-dessous
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-700 shadow-sm sm:text-base">
          🔒 Paiement sécurisé et 100% fiable
        </div>
      </div>

      <div className="relative grid gap-5 lg:grid-cols-3">
        {operators.map((op) => (
          <article
            key={op.name}
            className={`group flex flex-col rounded-[1.7rem] border-2 ${op.border} bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-5 md:p-6`}
          >
            <div className="mb-3 flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl bg-white sm:h-52">
              <img
                src={op.logo}
                alt={`Logo ${op.name}`}
                className="h-full w-full object-contain object-center"
              />
            </div>

            <div className="mb-5 text-center">
              <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">{op.name}</h3>
              <p className="mt-1 text-base text-slate-500 sm:text-lg">{op.hint}</p>
            </div>

            <div className={`mb-4 flex min-h-[82px] items-center justify-between rounded-2xl ${op.soft} p-4`}>
              <div className="min-w-0">
                <div className={`text-sm font-bold ${op.text}`}>Numéro {op.name}</div>
                <div className="mt-1 whitespace-nowrap text-base font-bold tracking-wide text-slate-900 sm:text-xl">
                  {NUMBER_DISPLAY}
                </div>
              </div>
              <button
                type="button"
                onClick={copy}
                aria-label={`Copier le numéro ${op.name}`}
                className="ml-3 shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xl text-slate-900 shadow-sm transition hover:scale-105"
              >
                {copied ? "✓" : "⧉"}
              </button>
            </div>

            <a
              href={`tel:+227${NUMBER}`}
              className={`mt-auto flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-base font-bold text-white shadow-sm transition ${op.button} sm:text-lg`}
            >
              📞&nbsp; Appeler le numéro
            </a>
          </article>
        ))}
      </div>

      <div className="relative mx-auto mt-7 max-w-6xl rounded-3xl border border-sky-100 bg-sky-50/80 px-5 py-5 text-center shadow-sm md:px-6 md:py-6">
        <p className="text-base font-medium leading-relaxed text-blue-900 md:text-lg">
          <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white">i</span>
          Après votre paiement, veuillez envoyer la preuve de paiement sur WhatsApp pour confirmation.
        </p>
        <p className="mt-3 text-slate-500">Merci pour votre confiance !</p>
      </div>
    </section>
  );
}
