import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import { useLastPosition } from '@/hooks/useLastPosition';

export default function AccueilScreen() {
  const { position, loading: loadingPosition } = useLastPosition();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bible App</Text>
      <Text style={styles.subtitle}>Lecture biblique enrichie par l'IA</Text>

      <Link href="/lecture" asChild>
        <Pressable style={styles.resumeCard}>
          <Text style={styles.resumeLabel}>Reprendre la lecture</Text>
          <Text style={styles.resumeReference}>
            {loadingPosition ? '...' : position ? `${position.bookId} ${position.chapterNumber}` : 'Genese 1'}
          </Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 16, color: colors.textMuted, marginBottom: spacing.sm },
  resumeCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  resumeLabel: { color: '#fff', fontSize: 13, fontWeight: '600', opacity: 0.85 },
  resumeReference: { color: '#fff', fontSize: 22, fontWeight: '700' },
});
