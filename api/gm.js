function stripLineComments(str) {
  return str.replace(/\/\/[^\n\r]*/g, '');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { roomId, systemPrompt, messageHistory } = req.body;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(messageHistory || []).map(msg => ({ role: msg.role, content: msg.content })),
    ];

    let response;
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://realm-xi.vercel.app',
          'X-Title': 'Realm',
        },
        body: JSON.stringify({ model: 'arcee-ai/trinity-mini:free', messages, max_tokens: 2000 }),
        signal: AbortSignal.timeout(30000),
      });
    } catch (fetchErr) {
      const isTimeout = fetchErr?.name === 'TimeoutError' || fetchErr?.name === 'AbortError';
      if (isTimeout) {
        return res.status(200).json({
          narrative: 'The party stands at the threshold of adventure. Ancient stones surround you, torchlight flickering against weathered walls. The air carries the scent of old magic and forgotten battles. Somewhere ahead, destiny awaits — and the choices you make here will echo through the ages. What will you do?',
          image_prompt: null,
          actions: [],
        });
      }
      throw new Error(`OpenRouter fetch failed: ${fetchErr?.message}`);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`OpenRouter returned non-JSON body (HTTP ${response.status})`);
    }

    if (!response.ok) {
      throw new Error(`OpenRouter API error (HTTP ${response.status}): ${data?.error?.message || JSON.stringify(data)}`);
    }

    const rawText = data?.choices?.[0]?.message?.content;
    if (!rawText) throw new Error(`OpenRouter returned no content. Full response: ${JSON.stringify(data)}`);

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const stripped = stripLineComments(rawText);
      const match = stripped.match(/\{[\s\S]*\}/);
      if (!match) throw new Error(`Could not extract JSON from model output. Raw: ${rawText.slice(0, 400)}`);
      try {
        parsed = JSON.parse(match[0]);
      } catch (e2) {
        throw new Error(`JSON parse failed after comment strip. Error: ${e2.message}. Raw: ${rawText.slice(0, 400)}`);
      }
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('[/api/gm] Error:', error?.message);
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
