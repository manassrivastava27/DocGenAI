// api/generate.js
// Minimal Vercel serverless function to verify env var and proxy requests.
// Put this file at repo-root/api/generate.js (since your Vercel root is ./)

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, msg: 'API reachable - use POST' });
    }
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // parse body (works with Vercel's body parser or raw)
    const body = req.body && Object.keys(req.body).length ? req.body
                : await new Promise(r => {
                    let data = '';
                    req.on('data', c => data += c);
                    req.on('end', () => r(data ? JSON.parse(data) : {}));
                  });

    // server-only key (set this in Vercel as GEMINI_API_KEY or OPENAI_API_KEY)
    const key = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.API_KEY;
    if (!key) {
      console.error('No server API key found in process.env');
      return res.status(500).json({ error: 'Server API key not configured (set GEMINI_API_KEY)' });
    }

    // ---------- PLACEHOLDER: proxied call to LLM provider ----------
    // Replace the below block with the actual provider call (Gemini/OpenAI).
    // For now we return a dummy response confirming the function works.
    return res.status(200).json({
      ok: true,
      message: 'Server function is running — key found',
      received: body,
      server_key_present: !!key
    });
    // --------------------------------------------------------------
  } catch (err) {
    console.error('Function error:', err);
    return res.status(500).json({ error: String(err) });
  }
}
