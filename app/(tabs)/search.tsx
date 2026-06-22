import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Chip } from '@/components/Chip';
import { colors, spacing } from '@/constants/theme';
import { useBibles } from '@/hooks/useBibles';
import { useBooks } from '@/hooks/useBooks';
import { useSearch } from '@/hooks/useSearch';
import { type SearchHit } from '@/services/bibleApi';
import { isGetBibleId } from '@/services/getbibleApi';

export default function SearchScreen() {
  const router = useRouter();
  const { bibles: allBibles, loading: loadingBibles } = useBibles();
  // getbible.net (Segond 1910) n'expose pas d'endpoint de recherche plein texte.
  const bibles = allBibles.filter((bible) => !isGetBibleId(bible.id));
  const [bibleId, setBibleId] = useState<string | null>(null);

  useEffect(() => {
    if (!bibleId && bibles.length > 0) setBibleId(bibles[0].id);
  }, [bibles, bibleId]);

  const { books } = useBooks();
  const [query, setQuery] = useState('');
  const { results, loading, error, searched, search } = useSearch();

  const bookName = (bookId: string) => books.find((book) => book.id === bookId)?.name ?? bookId;

  const openResult = (hit: SearchHit) => {
    router.push({ pathname: '/lecture', params: { book: hit.bookId, chapter: hit.chapterNumber } });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {loadingBibles ? (
            <ActivityIndicator />
          ) : (
            bibles.map((bible) => (
              <Chip
                key={bible.id}
                label={bible.abbreviation}
                selected={bible.id === bibleId}
                onPress={() => setBibleId(bible.id)}
              />
            ))
          )}
        </ScrollView>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Mot ou expression a rechercher..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => bibleId && search(bibleId, query)}
            returnKeyType="search"
          />
          <Pressable
            style={styles.searchButton}
            onPress={() => bibleId && search(bibleId, query)}
          >
            <Text style={styles.searchButtonText}>Chercher</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.center} />
      ) : error ? (
        <Text style={[styles.error, styles.center]}>{error}</Text>
      ) : searched && results.length === 0 ? (
        <Text style={[styles.empty, styles.center]}>Aucun resultat.</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(hit) => hit.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable style={styles.resultRow} onPress={() => openResult(item)}>
              <Text style={styles.resultReference}>
                {bookName(item.bookId)} {item.chapterNumber}:{item.verseNumber}
              </Text>
              <Text style={styles.resultText} numberOfLines={2}>
                {item.text}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.sm },
  row: { flexGrow: 0 },
  searchRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  searchButtonText: { color: '#fff', fontWeight: '700' },
  center: { marginTop: spacing.xl },
  error: { color: colors.danger, textAlign: 'center' },
  empty: { color: colors.textMuted, textAlign: 'center' },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  resultRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  resultReference: { fontWeight: '700', color: colors.primary },
  resultText: { color: colors.text },
});
