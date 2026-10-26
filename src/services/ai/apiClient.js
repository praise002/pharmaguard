// Calls our own serverless functions in /api — the AI provider keys live
// there as server-only env vars, so nothing secret is in the browser bundle.
export async function postJson(path, body, { signal } = {}) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status} ${data?.error ?? ''}`.trim())
  }
  return data
}
