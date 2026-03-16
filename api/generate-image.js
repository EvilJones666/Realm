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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: fullPrompt }],
          parameters: { sampleCount: 1 },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Gemini API error');

    const base64 = data.predictions?.[0]?.bytesBase64Encoded;
    if (!base64) throw new Error('No image generated');

    return res.status(200).json({ base64, mimeType: 'image/png' });
  } catch (error) {
    console.error('[/api/generate-image] Error:', error?.message);
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
