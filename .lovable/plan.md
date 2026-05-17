## Objectif

Automatiser le suivi des paiements iPay : webhook, historique en base, reçus PDF, et une page admin protégée.

## 1. Base de données (Lovable Cloud)

**Table `payments`** — historique de toutes les transactions
- `id` (uuid, PK), `transaction_id` (unique), `reference` (iPay)
- `customer_name`, `msisdn`, `amount` (int, FCFA), `programme` (text)
- `status` (text: `pending` / `success` / `failed` / `cancelled`)
- `created_at`, `updated_at`, `paid_at`, `raw` (jsonb du dernier callback iPay)
- RLS : insert public via serverFn admin, select uniquement admins

**Table `user_roles`** + enum `app_role` (`admin`, `user`) + fonction `has_role()` (security definer) — pattern standard pour éviter l'escalade.

## 2. Authentification

Email/mot de passe uniquement (simple pour un admin). Page `/login` + `/admin` protégé par `has_role(uid, 'admin')`. Le premier utilisateur créé pourra être promu admin via SQL.

## 3. Flow paiement modifié

- `createIPayMobilePayment` → insère une ligne `pending` dans `payments` **avant** d'appeler iPay
- Webhook `POST /api/public/ipay-webhook` (route TanStack) → reçoit le callback iPay, vérifie un secret partagé `IPAY_WEBHOOK_SECRET`, met à jour `status` + `paid_at`
- Côté client : **Realtime** Supabase sur la ligne `payments` → le statut se met à jour tout seul, plus besoin du bouton "Actualiser"

## 4. Reçu de paiement

Route `/recu/$reference` — page imprimable (bouton "Imprimer / PDF" via `window.print()`) qui affiche : numéro de référence, nom, programme, montant, date, statut, logo NOUROUL FOUA'AD. Lien automatique affiché après un paiement réussi.

## 5. Page admin `/admin/paiements`

- Liste paginée des transactions (filtres : statut, date)
- Statut de la config iPay : `IPAY_PRIVATE_KEY` / `IPAY_WEBHOOK_SECRET` / `IPAY_ENVIRONMENT` présents ou non
- Total encaissé du jour / mois
- Lien vers le reçu de chaque transaction

## Secrets à demander à la fin

- `IPAY_WEBHOOK_SECRET` (nouveau, à fournir à iPay quand le compte sera créé)
- (déjà demandés précédemment : `IPAY_PRIVATE_KEY`, `IPAY_ENVIRONMENT`)

## Hors scope

- Génération PDF côté serveur (le bouton "Imprimer" du navigateur suffit et évite une dépendance lourde incompatible avec le runtime Worker)
- Notifications WhatsApp automatiques après paiement (peut être ajouté ensuite)
