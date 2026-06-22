// Supabase Edge Function (Deno) : genere une explication IA d'un verset via l'API
// Claude (Anthropic). La cle ANTHROPIC_API_KEY ne doit JAMAIS etre exposee cote client :
// c'est pour cela que cet appel passe par une Edge Function plutot que par l'app directement.
//
// Deploiement (depuis la racine du projet BibleApp, necessite la Supabase CLI) :
//   supabase login
//   supabase link --project-ref hhxkusslunzavochgssa
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy explain-verse
//
// NON DEPLOYE PAR CET AGENT : aucun acces CLI/token Supabase disponible depuis cet
// environnement de developpement. Voir compte-rendu pour les etapes restantes.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type RequestBody = {
  reference: string;
  verseText: string;
  translation?: string;
};

type Explanation = {
  historicalContext: string;
  theologicalMeaning: string;
  practicalApplication: string;
};

const SYSTEM_PROMPT = `Tu es un assistant d'etude biblique. Pour le verset fourni, reponds
UNIQUEMENT avec un objet JSON valide de la forme :
{"historicalContext": "...", "theologicalMeaning": "...", "practicalApplication": "..."}
Chaque champ : 2 a 4 phrases en francais, ton pedagogique et neutre (pas de prosélytisme
confessionnel particulier). Pas de texte hors du JSON.`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { reference, verseText, translation }: RequestBody = await req.json();
    if (!reference || !verseText) {
      return new Response(JSON.stringify({ error: 'reference et verseText sont requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY non configuree' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userPrompt = `Reference : ${reference}${translation ? ` (${translation})` : ''}\nTexte du verset : "${verseText}"`;

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!anthropicResponse.ok) {
      const detail = await anthropicResponse.text();
      return new Response(JSON.stringify({ error: `Erreur API Claude (${anthropicResponse.status})`, detail }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await anthropicResponse.json();
    const rawText: string = data.content?.[0]?.text ?? '{}';

    let explanation: Explanation;
    try {
      explanation = JSON.parse(rawText);
    } catch {
      explanation = {
        historicalContext: rawText,
        theologicalMeaning: '',
        practicalApplication: '',
      };
    }

    return new Response(JSON.stringify(explanation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Erreur inconnue' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
