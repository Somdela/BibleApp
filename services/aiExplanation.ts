import { isSupabaseConfigured, supabase } from '@/services/supabase';

export type VerseExplanation = {
  historicalContext: string;
  theologicalMeaning: string;
  practicalApplication: string;
  isMock: boolean;
};

const MOCK_PREFIX = '[DEMO - cle Claude non configuree ou Edge Function non deployee]';

function buildMockExplanation(reference: string): VerseExplanation {
  return {
    historicalContext: `${MOCK_PREFIX} Contexte historique simule pour ${reference}.`,
    theologicalMeaning: `${MOCK_PREFIX} Sens theologique simule pour ${reference}.`,
    practicalApplication: `${MOCK_PREFIX} Application pratique simulee pour ${reference}.`,
    isMock: true,
  };
}

// Appelle l'Edge Function Supabase "explain-verse" (voir supabase/functions/explain-verse)
// qui relaie la demande a l'API Claude cote serveur. Retombe sur une explication
// simulee si Supabase n'est pas configure ou si la fonction n'est pas (encore) deployee.
export async function getVerseExplanation(
  reference: string,
  verseText: string,
  translation?: string
): Promise<VerseExplanation> {
  if (!isSupabaseConfigured) {
    return buildMockExplanation(reference);
  }

  try {
    const { data, error } = await supabase.functions.invoke('explain-verse', {
      body: { reference, verseText, translation },
    });

    if (error || !data || data.error) {
      return buildMockExplanation(reference);
    }

    return {
      historicalContext: data.historicalContext ?? '',
      theologicalMeaning: data.theologicalMeaning ?? '',
      practicalApplication: data.practicalApplication ?? '',
      isMock: false,
    };
  } catch {
    return buildMockExplanation(reference);
  }
}
