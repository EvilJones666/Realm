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

    const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX-1-schnell:free',
        prompt: fullPrompt,
        n: 1,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'OpenRouter image API error');

    const url = data.data?.[0]?.url;
    if (!url) throw new Error('No image generated');

    return res.status(200).json({ url });
  } catch (error) {
    console.error('[/api/generate-image] Error:', error?.message);
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
