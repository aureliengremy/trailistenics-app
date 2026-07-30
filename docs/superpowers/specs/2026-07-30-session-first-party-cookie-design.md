# Session persistante en prod — cookie first-party via proxy Vercel

**Date :** 2026-07-30 · **Statut :** validé (option A choisie par l'utilisateur).

## 1. Problème & diagnostic (mesuré)

Sur `trailistenics-app.vercel.app`, il faut se reconnecter à chaque visite. Le cookie de
session Neon Auth, observé sur un vrai login :

```
__Secure-neon-auth.session_token=… ; Max-Age=604800 ; Path=/ ; HttpOnly ; Secure ;
SameSite=None ; Partitioned
```

- Persistant **7 jours** (durée OK) mais posé sur `ep-….neonauth.c-8.us-east-1.aws.neon.tech`
  → **cookie tiers** pour l'app. Safari (ITP) et les navigateurs stricts le bloquent/purgent ;
  seul le `Partitioned` (CHIPS) le sauve sur certains Chrome.
- Le cookie est **host-only** (pas d'attribut `Domain`) → si la réponse transite par notre
  domaine, il se pose sur notre domaine. C'est le levier de la solution.

## 2. Solution retenue — proxy first-party (option A)

Faire transiter l'auth par le domaine de l'app ; le cookie devient first-party, accepté et
persisté par tous les navigateurs. Aucun changement backend (Render vérifie les JWT via
JWKS directement chez Neon).

1. **`frontend/vercel.json`** — rewrite proxy AVANT le catch-all SPA :
   `/neonauth/:path*` → `https://ep-damp-pond-aq32vtdp.neonauth.c-8.us-east-1.aws.neon.tech/neondb/auth/:path*`.
2. **`VITE_NEON_AUTH_URL` = `/neonauth`** (env Vercel production + `.env` local).
3. **Résolution d'URL relative** : `auth-client.ts` exporte la base résolue
   (`window.location.origin + valeur` si elle commence par `/`) ; `api.ts` la réutilise pour
   `GET …/token`. (Le client Better Auth reçoit toujours une URL absolue.)
4. **`frontend/vite.config.ts`** — proxy de dev équivalent : `/neonauth` →
   `https://ep-….neon.tech` avec réécriture `/neonauth` → `/neondb/auth` et `changeOrigin`
   (le local se comporte comme la prod ; règle aussi les logins flaky en preview).

## 3. Compatibilités vérifiées en amont

- CSRF/origines : le endpoint Neon Auth accepte déjà `Origin: https://trailistenics-app.vercel.app`
  et les origines locales (CORS observé) ; le proxy transmet l'Origin du navigateur tel quel.
- Ordre des rewrites Vercel : première correspondance gagne → `/neonauth/:path*` placé avant
  `/(.*) → /index.html`.
- `__Secure-` : exige HTTPS + Secure — OK sur vercel.app (et sur localhost, le proxy Vite
  ne conserve pas ce préfixe côté navigateur ? Non : le Set-Cookie transite tel quel ; les
  navigateurs acceptent `__Secure-` sur `http://localhost` étant traité comme contexte
  sécurisé par Chrome ; à vérifier au parcours local, sans en faire un bloqueur — la cible
  est la prod).

## 4. Vérification (contrat)

- `npx tsc --noEmit` + `npm run build` verts.
- Après déploiement : `POST https://trailistenics-app.vercel.app/neonauth/sign-in/email`
  (compte démo) → 200 + `Set-Cookie` **sans** `Domain` → cookie du domaine Vercel ; puis
  `GET /neonauth/get-session` avec ce cookie → 200 + utilisateur. Preuve mécanique,
  indépendante du navigateur.
- Parcours réel : login sur la prod, fermer/rouvrir l'onglet → toujours connecté (7 j
  glissants, prolongés à chaque usage).

## 5. Hors périmètre

- Domaine personnalisé (option C) — pourra compléter plus tard.
- Durée de session > 7 j (réglage côté Neon Auth géré, si exposé un jour).
