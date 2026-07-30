// Proxy first-party vers Neon Auth (prod Vercel).
// La rewrite « pure » ne convient pas : elle transmet le Host d'origine et Neon Auth
// répond INVALID_HOSTNAME. Cette fonction refait la requête avec le bon Host (fetch le
// déduit de l'URL cible) et relaie tel quel le Set-Cookie — cookie host-only, donc posé
// sur NOTRE domaine (first-party : il persiste dans tous les navigateurs).
const UPSTREAM = "https://ep-damp-pond-aq32vtdp.neonauth.c-8.us-east-1.aws.neon.tech/neondb/auth"

// En-têtes de requête relayés (le reste — dont host — est volontairement omis).
const FORWARD_REQ = ["content-type", "cookie", "origin", "accept", "authorization"]

export default async function handler(req, res) {
  const path = req.url.replace(/^\/(api\/)?neonauth/, "")
  const headers = {}
  for (const h of FORWARD_REQ) {
    if (req.headers[h]) headers[h] = req.headers[h]
  }
  const chunks = []
  for await (const c of req) chunks.push(c)

  const upstream = await fetch(UPSTREAM + path, {
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
