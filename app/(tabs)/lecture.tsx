import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BookChapterNav } from '@/components/BookChapterNav';
import { VerseAnnotationModal } from '@/components/VerseAnnotationModal';
import { VerseText } from '@/components/VerseText';
import { VersionSelector } from '@/components/VersionSelector';
import { DEFAULT_BOOK_ID, DEFAULT_CHAPTER_NUMBER, MAX_PARALLEL_VERSIONS } from '@/constants/bible';
import { colors, spacing } from '@/constants/theme';
import { useAnnotations } from '@/hooks/useAnnotations';
import { useBibles } from '@/hooks/useBibles';
import { useBooks } from '@/hooks/useBooks';
import { useChapterList } from '@/hooks/useChapterList';
import { useChapters } from '@/hooks/useChapters';
import { getLastPosition, setLastPosition } from '@/services/appState';

export default function LectureScreen() {
  // Permet aux liens "Reprendre la lecture" / plans de lecture d'ouvrir un livre/chapitre precis.
  const params = useLocalSearchParams<{ book?: string; chapter?: string }>();

  const { bibles, loading: loadingBibles, error: biblesError, isConfigured } = useBibles();
  const [selectedBibleIds, setSelectedBibleIds] = useState<string[]>([]);

  useEffect(() => {
    if (selectedBibleIds.length === 0 && bibles.length > 0) {
      setSelectedBibleIds(bibles.slice(0, 2).map((bible) => bible.id));
    }
  }, [bibles, selectedBibleIds.length]);

  const { books, loading: loadingBooks, error: booksError } = useBooks();

  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [currentChapterNumber, setCurrentChapterNumber] = useState(DEFAULT_CHAPTER_NUMBER);
  const [positionInitialized, setPositionInitialized] = useState(false);

  // Premier chargement sans parametre de navigation : reprend la derniere position
  // sauvegardee (ou Genese 1 par defaut). Le tab Lecture restant monte en arriere-plan
  // (navigation par onglets), cet effet ne doit s'executer qu'une seule fois.
  useEffect(() => {
    if (positionInitialized || books.length === 0 || params.book) return;

    getLastPosition().then((last) => {
      if (last && books.some((book) => book.id === last.bookId)) {
        setCurrentBookId(last.bookId);
        setCurrentChapterNumber(last.chapterNumber);
      } else {
        setCurrentBookId(books.some((book) => book.id === DEFAULT_BOOK_ID) ? DEFAULT_BOOK_ID : books[0].id);
      }
      setPositionInitialized(true);
    });
  }, [books, params.book, positionInitialized]);

  // Navigation explicite (lien "Jour X" des plans, etc.) : doit reagir a chaque fois,
  // meme si l'ecran est deja initialise depuis une visite precedente du tab.
  useEffect(() => {
    if (books.length === 0 || !params.book) return;
    setCurrentBookId(books.some((book) => book.id === params.book) ? params.book : books[0].id);
    if (params.chapter) setCurrentChapterNumber(params.chapter);
    setPositionInitialized(true);
  }, [books, params.book, params.chapter]);

  const activeBookId = currentBookId ?? DEFAULT_BOOK_ID;

  useEffect(() => {
    if (!positionInitialized) return;
    setLastPosition({ bookId: activeBookId, chapterNumber: currentChapterNumber });
  }, [positionInitialized, activeBookId, currentChapterNumber]);

  const { chapters, loading: loadingChapters, error: chaptersError } = useChapterList(activeBookId);

  const chapterIndex = chapters.findIndex((chapter) => chapter.number === currentChapterNumber);

  const selectBook = (bookId: string) => {
    setCurrentBookId(bookId);
    setCurrentChapterNumber(DEFAULT_CHAPTER_NUMBER);
  };

  const goToChapterAt = (index: number) => {
    if (index < 0 || index >= chapters.length) return;
    setCurrentChapterNumber(chapters[index].number);
  };

  const toggleVersion = (id: string) => {
    setSelectedBibleIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((existing) => existing !== id) : prev;
      }
      return prev.length < MAX_PARALLEL_VERSIONS ? [...prev, id] : prev;
    });
  };

  const chapterId = `${activeBookId}.${currentChapterNumber}`;
  const { results } = useChapters(selectedBibleIds, chapterId);
  const { annotations, applyHighlight, clearHighlight, saveNote, toggleVerseBookmark } =
    useAnnotations(chapterId);
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  useEffect(() => {
    setSelectedVerse(null);
  }, [chapterId]);

  const columnWidth = useMemo(() => {
    const screenWidth = Dimensions.get('window').width - spacing.lg * 2;
    if (results.length <= 1) return screenWidth;
    return Math.max(240, screenWidth / Math.min(results.length, 2));
  }, [results.length]);

  const singleResult = results.length === 1 ? results[0] : null;
  const selectedVerseData = singleResult?.chapter?.verses.find((verse) => verse.number === selectedVerse);

  if (!isConfigured) {
    return (
      <View style={styles.center}>
        <Text style={styles.bannerText}>
          API.Bible n'est pas configuree. Renseignez EXPO_PUBLIC_BIBLE_API_KEY dans .env.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.controls}>
        <BookChapterNav
          books={books}
          currentBookId={activeBookId}
          onSelectBook={selectBook}
          loadingBooks={loadingBooks}
          booksError={booksError}
          chapters={chapters}
          currentChapterNumber={currentChapterNumber}
          onSelectChapter={setCurrentChapterNumber}
          loadingChapters={loadingChapters}
          chaptersError={chaptersError}
          onPrevChapter={() => goToChapterAt(chapterIndex - 1)}
          onNextChapter={() => goToChapterAt(chapterIndex + 1)}
          canGoPrev={chapterIndex > 0}
          canGoNext={chapterIndex !== -1 && chapterIndex < chapters.length - 1}
        />

        <VersionSelector
          bibles={bibles}
          selectedIds={selectedBibleIds}
          onToggle={toggleVersion}
          loading={loadingBibles}
          error={biblesError}
          maxSelected={MAX_PARALLEL_VERSIONS}
        />
      </View>

      {singleResult ? (
        <ScrollView contentContainerStyle={[styles.contentContainer, styles.singleColumn]}>
          {singleResult.loading ? (
            <ActivityIndicator />
          ) : singleResult.error ? (
            <Text style={styles.error}>{singleResult.error}</Text>
          ) : singleResult.chapter ? (
            <>
              {singleResult.fromCache && <Text style={styles.offlineBadge}>Mode hors ligne (cache)</Text>}
              <Text style={styles.reference}>{singleResult.chapter.reference}</Text>
              {singleResult.chapter.verses.length > 0 ? (
                singleResult.chapter.verses.map((verse) => (
                  <VerseText
                    key={verse.number}
                    number={verse.number}
                    text={verse.text}
                    highlightColor={annotations.highlights[verse.number]}
                    bookmarked={annotations.bookmarks.has(verse.number)}
                    hasNote={Boolean(annotations.notes[verse.number])}
                    onPress={() => setSelectedVerse(verse.number)}
                  />
                ))
              ) : (
                <Text style={styles.content}>{singleResult.chapter.content}</Text>
              )}
            </>
          ) : null}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={results.length > 2}>
            <View style={styles.columns}>
              {results.map((result) => (
                <View key={result.bibleId} style={[styles.column, { width: columnWidth }]}>
                  {result.loading ? (
                    <ActivityIndicator />
                  ) : result.error ? (
                    <Text style={styles.error}>{result.error}</Text>
                  ) : result.chapter ? (
                    <>
                      <Text style={styles.versionLabel}>
                        {bibles.find((bible) => bible.id === result.bibleId)?.abbreviation ?? ''}
                        {result.fromCache ? ' (hors ligne)' : ''}
                      </Text>
                      <Text style={styles.reference}>{result.chapter.reference}</Text>
                      {result.chapter.verses.length > 0 ? (
                        result.chapter.verses.map((verse) => (
                          <Text key={verse.number} style={styles.content}>
                            <Text style={styles.versionLabel}>{verse.number} </Text>
                            {verse.text}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.content}>{result.chapter.content}</Text>
                      )}
                    </>
                  ) : null}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      )}

      {singleResult?.chapter && (
        <VerseAnnotationModal
          visible={selectedVerse !== null}
          reference={`${singleResult.chapter.reference} : ${selectedVerse ?? ''}`}
          verseText={selectedVerseData?.text ?? ''}
          currentColor={selectedVerse ? annotations.highlights[selectedVerse] : undefined}
          currentNote={(selectedVerse && annotations.notes[selectedVerse]) || ''}
          bookmarked={Boolean(selectedVerse && annotations.bookmarks.has(selectedVerse))}
          onClose={() => setSelectedVerse(null)}
          onSelectColor={(color) => {
            if (!selectedVerse) return;
            if (color) applyHighlight(selectedVerse, color);
            else clearHighlight(selectedVerse);
          }}
          onSaveNote={(text) => selectedVerse && saveNote(selectedVerse, text)}
          onToggleBookmark={() => selectedVerse && toggleVerseBookmark(selectedVerse)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  controls: { padding: spacing.lg, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  contentContainer: { paddingBottom: spacing.xl },
  singleColumn: { paddingHorizontal: spacing.lg, gap: spacing.xs },
  columns: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.md },
  column: { gap: spacing.sm },
  offlineBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
    textTransform: 'uppercase',
  },
  versionLabel: { fontSize: 13, fontWeight: '700', color: colors.primary },
  reference: { fontSize: 18, fontWeight: '700', color: colors.text },
  content: { fontSize: 16, lineHeight: 24, color: colors.text },
  error: { color: colors.danger },
  bannerText: { color: colors.textMuted, textAlign: 'center' },
});
