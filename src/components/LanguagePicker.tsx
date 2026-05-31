import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { PROGRAMMING_LANGUAGES } from '../types';

interface Props {
  value: string;
  onChange: (lang: string) => void;
}

const LanguagePicker: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = PROGRAMMING_LANGUAGES.filter((l) =>
    l.toLowerCase().includes(query.toLowerCase())
  );

  const langColor = COLORS.langColors[value] ?? COLORS.langColors['Other'];

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <View style={[styles.dot, { backgroundColor: langColor }]} />
        <Text style={[styles.triggerText, { color: langColor }]}>{value}</Text>
        <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Select Language</Text>
            <TextInput
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              placeholder="Search..."
              placeholderTextColor={COLORS.textMuted}
              autoFocus
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const color = COLORS.langColors[item] ?? COLORS.langColors['Other'];
                return (
                  <TouchableOpacity
                    style={[styles.option, item === value && styles.optionSelected]}
                    onPress={() => { onChange(item); setOpen(false); setQuery(''); }}
                  >
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <Text style={[styles.optionText, item === value && styles.optionTextSelected]}>
                      {item}
                    </Text>
                    {item === value && (
                      <Ionicons name="checkmark" size={16} color={COLORS.accent} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.bg2,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.bg1,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.md,
    maxHeight: '70%',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  search: {
    backgroundColor: COLORS.bg2,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 14,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  optionSelected: {
    backgroundColor: COLORS.accentGlow,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  optionTextSelected: {
    color: COLORS.textAccent,
    fontWeight: '600',
  },
});

export default LanguagePicker;
