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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Gemini API error');

    const imageData = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData;
    if (!imageData) throw new Error('No image generated');

    return res.status(200).json({ base64: imageData.data, mimeType: imageData.mimeType });
  } catch (error) {
    console.error('[/api/generate-image] Error:', error?.message);
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
