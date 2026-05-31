import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import { createSnippet } from '../../src/database/snippets';
import { getLastLanguage, setLastLanguage } from '../../src/services/storage';
import LanguagePicker from '../../src/components/LanguagePicker';
import TagInput from '../../src/components/TagInput';

export default function CreateSnippetScreen() {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLastLanguage().then(setLanguage);
  }, []);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Required', 'Please enter a title'); return; }
    if (!code.trim()) { Alert.alert('Required', 'Please enter some code'); return; }
    setSaving(true);
    try {
      const id = await createSnippet({ title: title.trim(), code: code.trim(), language, tags, is_favorite: isFavorite });
      await setLastLanguage(language);
      router.replace(`/snippet/${id}`);
    } catch (e) {
      Alert.alert('Error', String(e));
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Snippet</Text>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color={COLORS.bg0} />
              : <Text style={styles.saveBtnText}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Debounce Hook"
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="next"
              autoFocus
            />
          </View>

          {/* Language */}
          <View style={styles.field}>
            <Text style={styles.label}>Language</Text>
            <LanguagePicker value={language} onChange={setLanguage} />
          </View>

          {/* Tags */}
          <View style={styles.field}>
            <Text style={styles.label}>Tags</Text>
            <TagInput tags={tags} onChange={setTags} />
            <Text style={styles.hint}>Press return to add a tag</Text>
          </View>

          {/* Favorite */}
          <TouchableOpacity
            style={styles.favoriteRow}
            onPress={() => setIsFavorite(!isFavorite)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFavorite ? 'star' : 'star-outline'}
              size={20}
              color={isFavorite ? COLORS.gold : COLORS.textMuted}
            />
            <Text style={[styles.favoriteText, isFavorite && { color: COLORS.gold }]}>
              Mark as favorite
            </Text>
          </TouchableOpacity>

          {/* Code */}
          <View style={styles.field}>
            <Text style={styles.label}>Code <Text style={styles.required}>*</Text></Text>
            <View style={styles.codeWrap}>
              <View style={styles.lineNumbers}>
                {code.split('\n').map((_, i) => (
                  <Text key={i} style={styles.lineNum}>{i + 1}</Text>
                ))}
                {code === '' && <Text style={styles.lineNum}>1</Text>}
              </View>
              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={setCode}
                placeholder="Paste or type your code here..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                scrollEnabled={false}
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  saveBtn: {
    backgroundColor: COLORS.accent, paddingHorizontal: SPACING.md,
    paddingVertical: 7, borderRadius: RADIUS.md, minWidth: 60, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: COLORS.bg0, fontWeight: '700', fontSize: 14 },
  scroll: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  field: { marginBottom: SPACING.md },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  required: { color: COLORS.error },
  hint: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  input: {
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
    color: COLORS.textPrimary, fontSize: 15, borderWidth: 1, borderColor: COLORS.border,
  },
  favoriteRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: SPACING.sm, marginBottom: SPACING.md,
  },
  favoriteText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },
  codeWrap: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', minHeight: 200,
  },
  lineNumbers: {
    backgroundColor: COLORS.bg2, paddingTop: SPACING.sm,
    paddingHorizontal: 8, alignItems: 'flex-end', minWidth: 36,
    borderRightWidth: 1, borderRightColor: COLORS.border,
  },
  lineNum: { fontSize: 12, color: COLORS.textMuted, lineHeight: 22, fontFamily: 'SpaceMono' },
  codeInput: {
    flex: 1, fontFamily: 'SpaceMono', fontSize: 13, color: COLORS.textSecondary,
    padding: SPACING.sm, lineHeight: 22,
  },
});
