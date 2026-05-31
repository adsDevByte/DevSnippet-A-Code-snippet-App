import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../../../src/constants/theme';
import { getSnippetById, updateSnippet } from '../../../src/database/snippets';
import { Snippet } from '../../../src/types';
import LanguagePicker from '../../../src/components/LanguagePicker';
import TagInput from '../../../src/components/TagInput';

export default function EditSnippetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSnippetById(Number(id)).then((s) => {
      if (s) {
        setSnippet(s);
        setTitle(s.title);
        setCode(s.code);
        setLanguage(s.language);
        setTags((() => { try { return JSON.parse(s.tags); } catch { return []; } })());
        setIsFavorite(s.is_favorite === 1);
      }
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Required', 'Please enter a title'); return; }
    if (!code.trim()) { Alert.alert('Required', 'Please enter some code'); return; }
    setSaving(true);
    try {
      await updateSnippet(Number(id), {
        title: title.trim(), code: code.trim(), language, tags, is_favorite: isFavorite
      });
      router.replace(`/snippet/${id}`);
    } catch (e) {
      Alert.alert('Error', String(e));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  if (!snippet) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.textSecondary }}>Snippet not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Snippet</Text>
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
          <View style={styles.field}>
            <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Snippet title"
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Language</Text>
            <LanguagePicker value={language} onChange={setLanguage} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tags</Text>
            <TagInput tags={tags} onChange={setTags} />
          </View>

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
                placeholder="Enter code..."
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
  loadingContainer: { flex: 1, backgroundColor: COLORS.bg0, alignItems: 'center', justifyContent: 'center' },
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
