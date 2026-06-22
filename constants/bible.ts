export const BIBLE_API_BASE_URL = 'https://api.scripture.api.bible/v1';

// Langues utilisees pour peupler la liste des versions (codes ISO 639-3).
export const PREFERRED_LANGUAGE_CODES = ['fra'];

// Versions disponibles pour le moment (filtre applique sur le nom/abbreviation
// renvoye par API.Bible), dans l'ordre d'affichage souhaite. A elargir plus tard
// si besoin d'autres traductions.
export const ALLOWED_VERSION_MATCHES = [
  'segond 1910',
  'segond 21',
  'parole vivante',
  'darby',
  'semeur',
];

// Reference de depart affichee a l'ouverture de l'ecran de lecture.
export const DEFAULT_BOOK_ID = 'GEN';
export const DEFAULT_CHAPTER_NUMBER = '1';

// Nombre maximum de versions affichees simultanement en vue comparative.
export const MAX_PARALLEL_VERSIONS = 5;
