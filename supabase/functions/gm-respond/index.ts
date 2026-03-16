import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function stripLineComments(str: string): string {
  // Remove JS-style // comments that the model sometimes includes in its JSON output
  return str.replace(/\/\/[^\n\r]*/g, '');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { roomId, systemPrompt, messageHistory } = await req.json();

    const apiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY secret is not set in Supabase edge function secrets');
    }

    // Build OpenAI-compatible messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(messageHistory || []).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    let response: Response;
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://realm-xi.vercel.app',
          'X-Title': 'Realm',
        },
        body: JSON.stringify({
          model: 'arcee-ai/trinity-mini:free',
          messages,
          max_tokens: 1000,
        }),
        signal: AbortSignal.timeout(25000),
      });
    } catch (fetchErr: any) {
      const isTimeout = fetchErr?.name === 'TimeoutError' || fetchErr?.name === 'AbortError';
      throw new Error(isTimeout
        ? 'OpenRouter API timed out after 25 seconds'
        : `OpenRouter fetch failed: ${fetchErr?.message}`);
    }

    // Parse OpenRouter response body first so we can include it in error messages
    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error(`OpenRouter returned non-JSON body (HTTP ${response.status})`);
    }

    if (!response.ok) {
      throw new Error(`OpenRouter API error (HTTP ${response.status}): ${data?.error?.message || JSON.stringify(data)}`);
    }

    const rawText: string = data?.choices?.[0]?.message?.content;
    if (!rawText) {
      throw new Error(`OpenRouter returned no content. Full response: ${JSON.stringify(data)}`);
    }

    // Parse the JSON response from the model
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Fallback: strip // comments the model might have included, then extract {...}
      const stripped = stripLineComments(rawText);
      const match = stripped.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error(`Could not extract JSON from model output. Raw: ${rawText.slice(0, 400)}`);
      }
      try {
        parsed = JSON.parse(match[0]);
      } catch (e2: any) {
        throw new Error(`JSON parse failed after comment strip. Error: ${e2.message}. Raw: ${rawText.slice(0, 400)}`);
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[gm-respond] Error:', error?.message);
    return new Response(JSON.stringify({ error: error?.message || String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
