import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type HighlightColor, colors, highlightColors, spacing } from '@/constants/theme';

type Props = {
  number: string;
  text: string;
  highlightColor?: HighlightColor;
  bookmarked: boolean;
  hasNote: boolean;
  onPress: () => void;
};

export function VerseText({ number, text, highlightColor, bookmarked, hasNote, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.verse, highlightColor && { backgroundColor: highlightColors[highlightColor] }]}
    >
      <Text style={styles.number}>{number} </Text>
      <Text style={styles.text}>{text}</Text>
      {(bookmarked || hasNote) && (
        <View style={styles.badges}>
          {bookmarked && <Text style={styles.badge}>signet</Text>}
          {hasNote && <Text style={styles.badge}>note</Text>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  verse: { borderRadius: 6, paddingVertical: 2, paddingHorizontal: 4, marginBottom: 2 },
  number: { fontSize: 13, fontWeight: '700', color: colors.primary },
  text: { fontSize: 16, lineHeight: 24, color: colors.text },
  badges: { flexDirection: 'row', gap: spacing.xs, marginTop: 2 },
  badge: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
});
