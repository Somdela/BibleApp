import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '@/constants/theme';

type Props = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, disabled, onPress }: Props) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected, disabled && styles.chipDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipDisabled: { opacity: 0.4 },
  text: { color: colors.text, fontWeight: '600' },
  textSelected: { color: '#fff' },
});
