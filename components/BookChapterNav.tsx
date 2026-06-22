import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { type BookSummary, type ChapterSummary } from '@/services/bibleApi';
import { Chip } from '@/components/Chip';
import { CANON } from '@/constants/canon';
import { colors, spacing } from '@/constants/theme';

type TestamentFilter = 'ALL' | 'AT' | 'NT';

const TESTAMENT_BY_BOOK_ID = new Map(CANON.map((book) => [book.id, book.testament]));

type Props = {
  books: BookSummary[];
  currentBookId: string | null;
  onSelectBook: (bookId: string) => void;
  loadingBooks: boolean;
  booksError: string | null;

  chapters: ChapterSummary[];
  currentChapterNumber: string;
  onSelectChapter: (number: string) => void;
  loadingChapters: boolean;
  chaptersError: string | null;

  onPrevChapter: () => void;
  onNextChapter: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
};

export function BookChapterNav({
  books,
  currentBookId,
  onSelectBook,
  loadingBooks,
  booksError,
  chapters,
  currentChapterNumber,
  onSelectChapter,
  loadingChapters,
  chaptersError,
  onPrevChapter,
  onNextChapter,
  canGoPrev,
  canGoNext,
}: Props) {
  const currentBook = books.find((book) => book.id === currentBookId);
  const [testamentFilter, setTestamentFilter] = useState<TestamentFilter>('ALL');

  const visibleBooks = useMemo(() => {
    if (testamentFilter === 'ALL') return books;
    return books.filter((book) => TESTAMENT_BY_BOOK_ID.get(book.id) === testamentFilter);
  }, [books, testamentFilter]);

  return (
    <View style={styles.container}>
      {loadingBooks ? (
        <ActivityIndicator />
      ) : booksError ? (
        <Text style={styles.error}>{booksError}</Text>
      ) : (
        <>
          <View style={styles.testamentRow}>
            <Chip label="Tout" selected={testamentFilter === 'ALL'} onPress={() => setTestamentFilter('ALL')} />
            <Chip label="Ancien Testament" selected={testamentFilter === 'AT'} onPress={() => setTestamentFilter('AT')} />
            <Chip label="Nouveau Testament" selected={testamentFilter === 'NT'} onPress={() => setTestamentFilter('NT')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
            {visibleBooks.map((book) => (
              <Chip
                key={book.id}
                label={book.name}
                selected={book.id === currentBookId}
                onPress={() => onSelectBook(book.id)}
              />
            ))}
          </ScrollView>
        </>
      )}

      <View style={styles.chapterHeader}>
        <Pressable onPress={onPrevChapter} disabled={!canGoPrev} style={styles.arrow}>
          <Text style={[styles.arrowText, !canGoPrev && styles.arrowDisabled]}>‹</Text>
        </Pressable>
        <Text style={styles.reference}>
          {currentBook ? `${currentBook.name} ${currentChapterNumber}` : '...'}
        </Text>
        <Pressable onPress={onNextChapter} disabled={!canGoNext} style={styles.arrow}>
          <Text style={[styles.arrowText, !canGoNext && styles.arrowDisabled]}>›</Text>
        </Pressable>
      </View>

      {loadingChapters ? (
        <ActivityIndicator />
      ) : chaptersError ? (
        <Text style={styles.error}>{chaptersError}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {chapters.map((chapter) => (
            <Chip
              key={chapter.id}
              label={chapter.number}
              selected={chapter.number === currentChapterNumber}
              onPress={() => onSelectChapter(chapter.number)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  testamentRow: { flexDirection: 'row', gap: spacing.sm },
  row: { flexGrow: 0 },
  error: { color: colors.danger },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  arrow: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  arrowText: { fontSize: 24, color: colors.primary, fontWeight: '700' },
  arrowDisabled: { color: colors.border },
  reference: { fontSize: 20, fontWeight: '700', color: colors.text, minWidth: 160, textAlign: 'center' },
});
