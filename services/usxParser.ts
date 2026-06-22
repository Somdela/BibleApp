// Parseur du format JSON (derive d'USX) renvoye par API.Bible pour le contenu des
// chapitres. Le schema n'est pas documente de facon exhaustive : ce parseur est
// defensif (DFS, attribution par "verset courant") et retombe sur un tableau vide en
// cas de structure imprevue plutot que de lever une exception.
//
// A VERIFIER avec une vraie reponse API.Bible une fois la cle disponible.

export type UsxNode =
  | { type: 'text'; text: string }
  | { type: 'tag'; name: string; attrs?: Record<string, string>; items?: UsxNode[] };

export type ParsedVerse = { number: string; text: string };

export function extractVerses(content: UsxNode[]): ParsedVerse[] {
  const verses: ParsedVerse[] = [];
  let currentNumber: string | null = null;
  let buffer = '';

  function flush() {
    if (currentNumber !== null) {
      const text = buffer.replace(/\s+/g, ' ').trim();
      if (text) verses.push({ number: currentNumber, text });
    }
    buffer = '';
  }

  function walk(nodes: UsxNode[]) {
    for (const node of nodes) {
      if (node.type === 'text') {
        if (currentNumber !== null) buffer += node.text;
        continue;
      }

      if (node.name === 'note') continue; // notes de bas de page ignorees

      if (node.name === 'verse' && node.attrs?.number) {
        flush();
        currentNumber = node.attrs.number;
        if (node.items) walk(node.items);
        continue;
      }

      if (node.items) walk(node.items);
    }
  }

  walk(content);
  flush();
  return verses;
}
