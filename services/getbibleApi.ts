// Fournisseur de contenu alternatif : getbible.net (API gratuite, sans cle) pour les
// traductions du domaine public non disponibles sur le compte API.Bible de l'utilisateur
// (ex. Segond 1910). Les bibleId de ce fournisseur sont prefixes "getbible:" pour les
// distinguer des bibleId API.Bible dans le reste de l'app.
import { CANON } from '@/constants/canon';
import { type BibleVersion, type ChapterContent } from '@/services/bibleApi';

const GETBIBLE_BASE_URL = 'https://api.getbible.net/v2';

export const GETBIBLE_PREFIX = 'getbible:';

// Versions disponibles via ce fournisseur (domaine public uniquement). A elargir si
// d'autres traductions getbible.net deviennent utiles (ex. Darby existe deja sur
// API.Bible donc inutile de le dupliquer ici).
export const GETBIBLE_VERSIONS: BibleVersion[] = [
  {
    id: `${GETBIBLE_PREFIX}ls1910`,
    abbreviation: 'LSG1910',
    name: 'Louis Segond 1910',
    language: { id: 'fra', name: 'French' },
  },
];

export function isGetBibleId(bibleId: string): boolean {
  return bibleId.startsWith(GETBIBLE_PREFIX);
}

function translationIdOf(bibleId: string): string {
  return bibleId.slice(GETBIBLE_PREFIX.length);
}

type GetBibleVerse = { chapter: number; verse: number; name: string; text: string };
type GetBibleChapterResponse = { book_name: string; chapter: number; verses: GetBibleVerse[] };

export async function getGetBibleChapter(bibleId: string, chapterId: string): Promise<ChapterContent> {
  const [bookId, chapterNumber] = chapterId.split('.');
  const bookIndex = CANON.findIndex((book) => book.id === bookId);
  if (bookIndex === -1) {
    throw new Error(`Livre inconnu pour getbible.net : ${bookId}`);
  }

  const bookNr = bookIndex + 1;
  const translationId = translationIdOf(bibleId);
  const url = `${GETBIBLE_BASE_URL}/${translationId}/${bookNr}/${chapterNumber}.json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erreur getbible.net (${response.status}) sur ${url}`);
  }

  const data: GetBibleChapterResponse = await response.json();
  const verses = (data.verses ?? []).map((verse) => ({
    number: String(verse.verse),
    text: verse.text.trim(),
  }));

  return {
    id: chapterId,
    bibleId,
    number: chapterNumber,
    bookId,
    reference: `${data.book_name} ${data.chapter}`,
    content: verses.map((verse) => `${verse.number} ${verse.text}`).join(' '),
    verses,
  };
}
