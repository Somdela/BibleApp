// Canon protestant standard (66 livres) avec identifiants USFM/API.Bible, nombre de
// chapitres par livre et nom francais. Donnees statiques (invariantes) utilisees pour
// la navigation livre/chapitre independamment du fournisseur de contenu biblique
// (API.Bible, getbible.net, ...) et pour generer les plans de lecture.

export type CanonBook = {
  id: string;
  name: string;
  chapters: number;
  testament: 'AT' | 'NT';
};

export const CANON: CanonBook[] = [
  // Ancien Testament
  { id: 'GEN', name: 'Genese', chapters: 50, testament: 'AT' },
  { id: 'EXO', name: 'Exode', chapters: 40, testament: 'AT' },
  { id: 'LEV', name: 'Levitique', chapters: 27, testament: 'AT' },
  { id: 'NUM', name: 'Nombres', chapters: 36, testament: 'AT' },
  { id: 'DEU', name: 'Deuteronome', chapters: 34, testament: 'AT' },
  { id: 'JOS', name: 'Josue', chapters: 24, testament: 'AT' },
  { id: 'JDG', name: 'Juges', chapters: 21, testament: 'AT' },
  { id: 'RUT', name: 'Ruth', chapters: 4, testament: 'AT' },
  { id: '1SA', name: '1 Samuel', chapters: 31, testament: 'AT' },
  { id: '2SA', name: '2 Samuel', chapters: 24, testament: 'AT' },
  { id: '1KI', name: '1 Rois', chapters: 22, testament: 'AT' },
  { id: '2KI', name: '2 Rois', chapters: 25, testament: 'AT' },
  { id: '1CH', name: '1 Chroniques', chapters: 29, testament: 'AT' },
  { id: '2CH', name: '2 Chroniques', chapters: 36, testament: 'AT' },
  { id: 'EZR', name: 'Esdras', chapters: 10, testament: 'AT' },
  { id: 'NEH', name: 'Nehemie', chapters: 13, testament: 'AT' },
  { id: 'EST', name: 'Esther', chapters: 10, testament: 'AT' },
  { id: 'JOB', name: 'Job', chapters: 42, testament: 'AT' },
  { id: 'PSA', name: 'Psaumes', chapters: 150, testament: 'AT' },
  { id: 'PRO', name: 'Proverbes', chapters: 31, testament: 'AT' },
  { id: 'ECC', name: 'Ecclesiaste', chapters: 12, testament: 'AT' },
  { id: 'SNG', name: 'Cantique des cantiques', chapters: 8, testament: 'AT' },
  { id: 'ISA', name: 'Esaie', chapters: 66, testament: 'AT' },
  { id: 'JER', name: 'Jeremie', chapters: 52, testament: 'AT' },
  { id: 'LAM', name: 'Lamentations', chapters: 5, testament: 'AT' },
  { id: 'EZK', name: 'Ezechiel', chapters: 48, testament: 'AT' },
  { id: 'DAN', name: 'Daniel', chapters: 12, testament: 'AT' },
  { id: 'HOS', name: 'Osee', chapters: 14, testament: 'AT' },
  { id: 'JOL', name: 'Joel', chapters: 3, testament: 'AT' },
  { id: 'AMO', name: 'Amos', chapters: 9, testament: 'AT' },
  { id: 'OBA', name: 'Abdias', chapters: 1, testament: 'AT' },
  { id: 'JON', name: 'Jonas', chapters: 4, testament: 'AT' },
  { id: 'MIC', name: 'Michee', chapters: 7, testament: 'AT' },
  { id: 'NAM', name: 'Nahum', chapters: 3, testament: 'AT' },
  { id: 'HAB', name: 'Habacuc', chapters: 3, testament: 'AT' },
  { id: 'ZEP', name: 'Sophonie', chapters: 3, testament: 'AT' },
  { id: 'HAG', name: 'Aggee', chapters: 2, testament: 'AT' },
  { id: 'ZEC', name: 'Zacharie', chapters: 14, testament: 'AT' },
  { id: 'MAL', name: 'Malachie', chapters: 4, testament: 'AT' },
  // Nouveau Testament
  { id: 'MAT', name: 'Matthieu', chapters: 28, testament: 'NT' },
  { id: 'MRK', name: 'Marc', chapters: 16, testament: 'NT' },
  { id: 'LUK', name: 'Luc', chapters: 24, testament: 'NT' },
  { id: 'JHN', name: 'Jean', chapters: 21, testament: 'NT' },
  { id: 'ACT', name: 'Actes', chapters: 28, testament: 'NT' },
  { id: 'ROM', name: 'Romains', chapters: 16, testament: 'NT' },
  { id: '1CO', name: '1 Corinthiens', chapters: 16, testament: 'NT' },
  { id: '2CO', name: '2 Corinthiens', chapters: 13, testament: 'NT' },
  { id: 'GAL', name: 'Galates', chapters: 6, testament: 'NT' },
  { id: 'EPH', name: 'Ephesiens', chapters: 6, testament: 'NT' },
  { id: 'PHP', name: 'Philippiens', chapters: 4, testament: 'NT' },
  { id: 'COL', name: 'Colossiens', chapters: 4, testament: 'NT' },
  { id: '1TH', name: '1 Thessaloniciens', chapters: 5, testament: 'NT' },
  { id: '2TH', name: '2 Thessaloniciens', chapters: 3, testament: 'NT' },
  { id: '1TI', name: '1 Timothee', chapters: 6, testament: 'NT' },
  { id: '2TI', name: '2 Timothee', chapters: 4, testament: 'NT' },
  { id: 'TIT', name: 'Tite', chapters: 3, testament: 'NT' },
  { id: 'PHM', name: 'Philemon', chapters: 1, testament: 'NT' },
  { id: 'HEB', name: 'Hebreux', chapters: 13, testament: 'NT' },
  { id: 'JAS', name: 'Jacques', chapters: 5, testament: 'NT' },
  { id: '1PE', name: '1 Pierre', chapters: 5, testament: 'NT' },
  { id: '2PE', name: '2 Pierre', chapters: 3, testament: 'NT' },
  { id: '1JN', name: '1 Jean', chapters: 5, testament: 'NT' },
  { id: '2JN', name: '2 Jean', chapters: 1, testament: 'NT' },
  { id: '3JN', name: '3 Jean', chapters: 1, testament: 'NT' },
  { id: 'JUD', name: 'Jude', chapters: 1, testament: 'NT' },
  { id: 'REV', name: 'Apocalypse', chapters: 22, testament: 'NT' },
];
