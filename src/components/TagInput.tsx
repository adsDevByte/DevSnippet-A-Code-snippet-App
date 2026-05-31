import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

const TagInput: React.FC<Props> = ({ tags, onChange }) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim().toLowerCase().replace(/\s+/g, '-');
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <View style={styles.container}>
      <View style={styles.tags}>
        {tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(tag)} hitSlop={4}>
              <Ionicons name="close" size={12} color={COLORS.textAccent} />
            </TouchableOpacity>
          </View>
        ))}
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addTag}
          placeholder={tags.length === 0 ? 'Add tags...' : 'Add more...'}
          placeholderTextColor={COLORS.textMuted}
          returnKeyType="done"
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    minHeight: 44,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accentGlow,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textAccent,
    fontWeight: '500',
  },
  input: {
    fontSize: 13,
    color: COLORS.textPrimary,
    minWidth: 80,
    padding: 0,
    paddingVertical: 2,
  },
});

export default TagInput;
