import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { type BibleVersion } from '@/services/bibleApi';
import { colors, spacing } from '@/constants/theme';
import { Chip } from '@/components/Chip';

type Props = {
  bibles: BibleVersion[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  loading: boolean;
  error: string | null;
  maxSelected: number;
};

export function VersionSelector({ bibles, selectedIds, onToggle, loading, error, maxSelected }: Props) {
  if (loading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {bibles.map((bible) => {
          const selected = selectedIds.includes(bible.id);
          const disabled = !selected && selectedIds.length >= maxSelected;
          return (
            <Chip
              key={bible.id}
              label={bible.abbreviation}
              selected={selected}
              disabled={disabled}
              onPress={() => onToggle(bible.id)}
            />
          );
        })}
      </ScrollView>
      {selectedIds.length >= maxSelected && (
        <Text style={styles.hint}>Maximum de {maxSelected} versions simultanees.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexGrow: 0 },
  error: { color: colors.danger },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
});
