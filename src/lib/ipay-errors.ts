export function explainIPayError(status: number, message?: string): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("environment not available"))
    return "Le mode sandbox n'est pas activé sur votre compte marchand iPay. Activez-le dans votre tableau de bord iPay (Développeurs → Environnement de test) ou passez en clés live.";
  if (m.includes("no valid key"))
    return "Clé iPay refusée pour cet environnement : une clé sk_sandbox_… doit être utilisée avec IPAY_ENVIRONMENT=sandbox, une clé sk_live_… avec live.";
  if (m.includes("msisdn"))
    return "Numéro refusé par iPay. En sandbox, utilisez un numéro de test (ex. 40410000000).";
  return message ?? `Erreur iPay (${status})`;
}
