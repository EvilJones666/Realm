const stylePrefix = {
  portrait: 'Fantasy character portrait, painterly dark fantasy art style, dramatic moody lighting, detailed face, no background text:',
  scene: 'Dark fantasy scene illustration, painterly art style, dramatic cinematic lighting, wide establishing shot, no text:',
  item: 'Fantasy item icon, dark background, glowing magical aura, detailed painterly style, square composition, no text:',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, type } = req.body;
    const fullPrompt = `${stylePrefix[type] || ''} ${prompt}`;

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=512&height=768&nologo=true&model=flux-schnell&seed=${Math.floor(Math.random() * 1000000)}`;

    return res.status(200).json({ url });
  } catch (error) {
    console.error('[/api/generate-image] Error:', error?.message);
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
