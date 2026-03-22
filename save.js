// api/save.js — Markr report storage
// Deploy on Vercel. Add JSONBIN_KEY env var in Vercel dashboard.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  const key = process.env.JSONBIN_KEY;
  if (!key) { res.status(500).json({ error: 'JSONBIN_KEY not set in Vercel environment variables' }); return; }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const r = await fetch('https://api.jsonbin.io/v3/b', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': key,
        'X-Bin-Private': 'false',
        'X-Bin-Name': 'markr-report',
      },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { throw new Error('Bad response: ' + text.slice(0,100)); }
    if (!r.ok) throw new Error('JSONBin error: ' + (data?.message || r.status));
    const id = data?.metadata?.id;
    if (!id) throw new Error('No ID returned');
    res.status(200).json({ ok: true, id });
  } catch(err) {
    console.error('[Markr save]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
}
