// Proxy first-party vers Neon Auth (prod Vercel).
// Une rewrite « pure » vers le endpoint Neon transmet notre Host → INVALID_HOSTNAME,
// et le routage des fonctions à segments dynamiques ne couvre pas les chemins profonds.
// D'où cette fonction unique : vercel.json réécrit /neonauth/:path* → /api/neonauth?path=…,
// on refait la requête avec le bon Host (déduit de l'URL cible par fetch) et on relaie le
// Set-Cookie tel quel — cookie host-only, donc posé sur NOTRE domaine (first-party).
const UPSTREAM = "https://ep-damp-pond-aq32vtdp.neonauth.c-8.us-east-1.aws.neon.tech/neondb/auth"

// En-têtes de requête relayés (le reste — dont host — est volontairement omis).
const FORWARD_REQ = ["content-type", "cookie", "origin", "accept", "authorization"]

export default async function handler(req, res) {
  const u = new URL(req.url, "https://internal")
  // Chemin cible : via ?path=… (rewrite) ou, à défaut, le pathname d'origine.
  const path = u.searchParams.get("path") ?? u.pathname.replace(/^\/(api\/)?neonauth\/?/, "")
  u.searchParams.delete("path")
  const qs = u.searchParams.toString()

  const headers = {}
  for (const h of FORWARD_REQ) {
    if (req.headers[h]) headers[h] = req.headers[h]
  }
  const chunks = []
  for await (const c of req) chunks.push(c)

  const upstream = await fetch(`${UPSTREAM}/${path}${qs ? `?${qs}` : ""}`, {
    method: req.method,
    headers,
    body: chunks.length > 0 ? Buffer.concat(chunks) : undefined,
    redirect: "manual",
  })

  res.statusCode = upstream.status
  const setCookies = upstream.headers.getSetCookie?.() ?? []
  if (setCookies.length > 0) res.setHeader("set-cookie", setCookies)
  for (const h of ["content-type", "location"]) {
    const v = upstream.headers.get(h)
    if (v) res.setHeader(h, v)
  }
  res.end(Buffer.from(await upstream.arrayBuffer()))
}
