import { BIBLE_API_BASE_URL } from '@/constants/bible';
import { getGetBibleChapter, isGetBibleId } from '@/services/getbibleApi';
import { extractVerses, type ParsedVerse, type UsxNode } from '@/services/usxParser';

const apiKey = process.env.EXPO_PUBLIC_BIBLE_API_KEY;

export const isBibleApiConfigured = Boolean(apiKey);

async function bibleApiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  if (!apiKey) {
    throw new Error(
      'Cle API.Bible manquante. Renseignez EXPO_PUBLIC_BIBLE_API_KEY dans le fichier .env.'
    );
  }

  const url = new URL(`${BIBLE_API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }

  const response = await fetch(url.toString(), { headers: { 'api-key': apiKey } });
  if (!response.ok) {
    throw new Error(`Erreur API.Bible (${response.status}) sur ${path}`);
  }

  return response.json();
}

export type BibleVersion = {
  id: string;
  abbreviation: string;
  name: string;
  language: { id: string; name: string };
};

export async function getBibles(languageCode?: string): Promise<BibleVersion[]> {
  const { data } = await bibleApiFetch<{ data: BibleVersion[] }>(
    '/bibles',
    languageCode ? { language: languageCode } : undefined
  );
  return data;
}

// La navigation livre/chapitre est derivee du canon statique (constants/canon.ts),
// independamment du fournisseur de contenu : ces types restent ici car ils sont
// partages par les hooks de navigation et les fournisseurs de contenu.
export type BookSummary = {
  id: string;
  name: string;
  nameLong: string;
};

export type ChapterSummary = {
  id: string;
  number: string;
  bookId: string;
};

export type ChapterContent = {
  id: string;
  bibleId: string;
  number: string;
  bookId: string;
  reference: string;
  content: string;
  verses: ParsedVerse[];
};

async function getChapterAsText(bibleId: string, chapterId: string): Promise<ChapterContent> {
  const { data } = await bibleApiFetch<{
    data: { id: string; number: string; bookId: string; reference: string; content: string };
  }>(`/bibles/${bibleId}/chapters/${chapterId}`, {
    'content-type': 'text',
    'include-notes': 'false',
    'include-titles': 'true',
    'include-verse-numbers': 'true',
  });
  return { ...data, bibleId, verses: [] };
}

// Recupere un chapitre en JSON pour obtenir un decoupage fiable par verset (necessaire
// pour les annotations). Si le parsing echoue (schema inattendu), on retombe sur le
// contenu texte brut sans decoupage par verset.
export async function getChapter(bibleId: string, chapterId: string): Promise<ChapterContent> {
  if (isGetBibleId(bibleId)) {
    return getGetBibleChapter(bibleId, chapterId);
  }

  const { data } = await bibleApiFetch<{
    data: {
      id: string;
      number: string;
      bookId: string;
      reference: string;
      content: UsxNode[];
    };
  }>(`/bibles/${bibleId}/chapters/${chapterId}`, {
    'content-type': 'json',
    'include-notes': 'false',
    'include-titles': 'false',
    'include-verse-numbers': 'true',
  });

  let verses: ParsedVerse[] = [];
  try {
    verses = extractVerses(Array.isArray(data.content) ? data.content : []);
  } catch {
    verses = [];
  }

  if (verses.length === 0) {
    return getChapterAsText(bibleId, chapterId);
  }

  const content = verses.map((verse) => `${verse.number} ${verse.text}`).join(' ');
  return {
    id: data.id,
    bibleId,
    number: data.number,
    bookId: data.bookId,
    reference: data.reference,
    content,
    verses,
  };
}

export type SearchHit = {
  id: string;
  bookId: string;
  chapterNumber: string;
  verseNumber: string;
  text: string;
};

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

// Recherche plein texte (mot ou expression) dans une version donnee via l'endpoint
// /search d'API.Bible. Limite a des resultats verset-par-verset (pas de passages).
export async function searchVerses(bibleId: string, query: string): Promise<SearchHit[]> {
  const { data } = await bibleApiFetch<{
    data: { verses?: { id: string; bookId: string; chapterId: string; text: string }[] };
  }>(`/bibles/${bibleId}/search`, { query, limit: '30', sort: 'relevance' });

  return (data.verses ?? []).map((verse) => {
    const [, chapterNumber, verseNumber] = verse.id.split('.');
    return {
      id: verse.id,
      bookId: verse.bookId,
      chapterNumber: chapterNumber ?? '1',
      verseNumber: verseNumber ?? '1',
      text: stripTags(verse.text).replace(/\s+/g, ' ').trim(),
    };
  });
}
