import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { type HighlightColor, colors, highlightColors, spacing } from '@/constants/theme';
import { useVerseExplanation } from '@/hooks/useVerseExplanation';

type Props = {
  visible: boolean;
  reference: string;
  verseText: string;
  currentColor?: HighlightColor;
  currentNote: string;
  bookmarked: boolean;
  onClose: () => void;
  onSelectColor: (color: HighlightColor | null) => void;
  onSaveNote: (text: string) => void;
  onToggleBookmark: () => void;
};

export function VerseAnnotationModal({
  visible,
  reference,
  verseText,
  currentColor,
  currentNote,
  bookmarked,
  onClose,
  onSelectColor,
  onSaveNote,
  onToggleBookmark,
}: Props) {
  const [noteDraft, setNoteDraft] = useState(currentNote);
  const { explanation, loading: explanationLoading, fetchExplanation, reset: resetExplanation } =
    useVerseExplanation();

  useEffect(() => {
    setNoteDraft(currentNote);
    resetExplanation();
    // currentNote n'est volontairement pas dans les dependances : ne reinitialiser
    // (et donc effacer une explication IA deja recue) que lors d'un changement de
    // verset, pas a chaque mise a jour de l'annotation du verset courant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent}>
          <Text style={styles.reference}>{reference}</Text>
          <Text style={styles.verseText} numberOfLines={3}>
            {verseText}
          </Text>

          <Text style={styles.label}>Surlignage</Text>
          <View style={styles.colorRow}>
            {(Object.keys(highlightColors) as HighlightColor[]).map((color) => (
              <Pressable
                key={color}
                onPress={() => onSelectColor(color)}
                style={[
                  styles.swatch,
                  { backgroundColor: highlightColors[color] },
                  currentColor === color && styles.swatchSelected,
                ]}
              />
            ))}
            <Pressable onPress={() => onSelectColor(null)} style={styles.clearSwatch}>
              <Text style={styles.clearSwatchText}>X</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Note personnelle</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            placeholder="Ecrire une note..."
            value={noteDraft}
            onChangeText={setNoteDraft}
          />

          <View style={styles.actions}>
            <Pressable style={styles.bookmarkButton} onPress={onToggleBookmark}>
              <Text style={styles.bookmarkButtonText}>{bookmarked ? 'Retirer le signet' : 'Ajouter un signet'}</Text>
            </Pressable>
            <Pressable
              style={styles.saveButton}
              onPress={() => {
                onSaveNote(noteDraft);
                onClose();
              }}
            >
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Explication IA</Text>
          {explanation ? (
            <View style={styles.explanationBox}>
              {explanation.isMock && <Text style={styles.mockBadge}>Mode demonstration (donnees simulees)</Text>}
              <Text style={styles.explanationLabel}>Contexte historique</Text>
              <Text style={styles.explanationText}>{explanation.historicalContext}</Text>
              <Text style={styles.explanationLabel}>Sens theologique</Text>
              <Text style={styles.explanationText}>{explanation.theologicalMeaning}</Text>
              <Text style={styles.explanationLabel}>Application pratique</Text>
              <Text style={styles.explanationText}>{explanation.practicalApplication}</Text>
            </View>
          ) : explanationLoading ? (
            <ActivityIndicator />
          ) : (
            <Pressable
              style={styles.explainButton}
              onPress={() => fetchExplanation(reference, verseText)}
            >
              <Text style={styles.explainButtonText}>Obtenir une explication IA</Text>
            </Pressable>
          )}

          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetContent: { padding: spacing.lg, gap: spacing.sm },
  reference: { fontSize: 18, fontWeight: '700', color: colors.text },
  verseText: { fontSize: 14, color: colors.textMuted },
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  colorRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  swatchSelected: { borderColor: colors.text },
  clearSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSwatchText: { color: colors.textMuted, fontWeight: '700' },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    minHeight: 70,
    textAlignVertical: 'top',
    color: colors.text,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  bookmarkButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  bookmarkButtonText: { color: colors.primary, fontWeight: '600' },
  saveButton: { flex: 1, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: spacing.sm, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '700' },
  closeButton: { marginTop: spacing.sm, alignItems: 'center', paddingVertical: spacing.xs },
  closeButtonText: { color: colors.textMuted },
  explainButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  explainButtonText: { color: colors.primary, fontWeight: '600' },
  explanationBox: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.sm, gap: spacing.xs },
  mockBadge: { fontSize: 11, fontWeight: '700', color: colors.danger, textTransform: 'uppercase' },
  explanationLabel: { fontSize: 12, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  explanationText: { fontSize: 13, color: colors.textMuted },
});
