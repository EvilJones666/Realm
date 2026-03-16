const stylePrefix = {
  portrait: 'Fantasy character portrait, painterly dark fantasy art style, dramatic moody lighting, detailed face:',
  scene: 'Dark fantasy scene illustration, painterly art style, dramatic cinematic lighting, wide shot:',
  item: 'Fantasy item icon, dark background, glowing magical aura, detailed painterly style, square composition:',
};

const MODELS = ['flux', 'flux-schnell', 'turbo'];

async function tryFetch(url, timeoutMs) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) throw new Error(`Non-image response: ${ct}`);
  return res;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, type } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  const fullPrompt = `${stylePrefix[type] || ''} ${prompt}`.trim();
  const seed = Math.floor(Math.random() * 1000000);
  const lastError = { message: 'Unknown error' };

  for (const model of MODELS) {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=512&height=768&nologo=true&model=${model}&seed=${seed}`;
    try {
      console.log(`[generate-image] Trying model=${model}`);
      const imgRes = await tryFetch(url, 50000);
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return res.status(200).json({ url: `data:${contentType};base64,${base64}` });
    } catch (err) {
      console.error(`[generate-image] model=${model} failed:`, err.message);
      lastError.message = err.message;
    }
  }

  return res.status(500).json({ error: `Image generation failed: ${lastError.message}` });
}
