import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { prompt, type } = await req.json();
    // type: 'portrait' | 'scene' | 'item'

    const stylePrefix: Record<string, string> = {
      portrait: 'Fantasy character portrait, painterly dark fantasy art style, dramatic moody lighting, detailed face, no background text:',
      scene: 'Dark fantasy scene illustration, painterly art style, dramatic cinematic lighting, wide establishing shot, no text:',
      item: 'Fantasy item icon, dark background, glowing magical aura, detailed painterly style, square composition, no text:'
    };

    const prefix = stylePrefix[type] || '';
    const fullPrompt = `${prefix} ${prompt}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { responseModalities: ['IMAGE'] }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error');
    }

    const imageData = data.candidates?.[0]?.content?.parts?.find((p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData)?.inlineData;

    if (!imageData) throw new Error('No image generated');

    return new Response(JSON.stringify({
      base64: imageData.data,
      mimeType: imageData.mimeType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
