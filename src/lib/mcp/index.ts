import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPaymentsTool from "./tools/list-payments";
import getPaymentTool from "./tools/get-payment";
import paymentTotalsTool from "./tools/payment-totals";

// L'issuer OAuth doit être l'hôte Supabase direct (le proxy publié serait rejeté).
const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "nouroul-fouaad-academy",
  title: "Nouroul Fouaad Academy",
  version: "0.1.0",
  instructions:
    "Outils d'administration de l'académie NOUROUL FOUA'AD : consulter les transactions iPay, obtenir le détail d'un paiement et calculer les totaux encaissés. L'utilisateur connecté doit être administrateur.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listPaymentsTool, getPaymentTool, paymentTotalsTool],
});