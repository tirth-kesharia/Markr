// api/load.js — fetch a report by ID
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { id } = req.query;
  if (!id) { res.status(400).json({ error: 'Missing id' }); return; }

  const key = process.env.JSONBIN_KEY;
  if (!key) { res.status(500).json({ error: 'JSONBIN_KEY not set' }); return; }

  try {
    const r = await fetch(`https://api.jsonbin.io/v3/b/${id}/latest`, {
      headers: { 'X-Master-Key': key },
    });
    const data = await r.json();
    res.status(200).json(data?.record || data);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}
