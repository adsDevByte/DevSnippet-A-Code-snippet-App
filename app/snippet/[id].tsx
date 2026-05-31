import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Share, Modal
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import { getSnippetById, deleteSnippet, toggleFavorite } from '../../src/database/snippets';
import { generateExplanation } from '../../src/services/ai';
import { exportSnippet, shareFile } from '../../src/services/fileSystem';
import { getSettings } from '../../src/services/storage';
import { Snippet, AIExplanation, ExportFormat } from '../../src/types';

export default function SnippetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const s = await getSnippetById(Number(id));
    setSnippet(s);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = () => {
    Alert.alert('Delete Snippet', `Delete "${snippet?.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteSnippet(Number(id));
          router.back();
        }
      }
    ]);
  };

  const handleToggleFavorite = async () => {
    if (!snippet) return;
    await toggleFavorite(snippet.id, snippet.is_favorite);
    load();
  };

  const handleExplain = async () => {
    if (!snippet) return;
    setAiLoading(true);
    setExplanation(null);
    try {
      const settings = await getSettings();
      const result = await generateExplanation(snippet.code, snippet.language, settings.aiProvider);
      setExplanation(result);
    } catch (e: any) {
      Alert.alert('AI Error', e.message ?? 'Failed to get explanation');
    } finally {
      setAiLoading(false);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (!snippet) return;
    setExportLoading(true);
    setShowExport(false);
    try {
      const uri = await exportSnippet(snippet, format);
      Alert.alert('Exported!', `Saved as .${format}`, [
        { text: 'Share', onPress: () => shareFile(uri).catch(() => {}) },
        { text: 'Done' },
      ]);
    } catch (e) {
      Alert.alert('Export Error', String(e));
    } finally {
      setExportLoading(false);
    }
  };

  const handleShare = async () => {
    if (!snippet) return;
    await Share.share({
      message: `// ${snippet.title}\n// Language: ${snippet.language}\n\n${snippet.code}`,
      title: snippet.title,
    });
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

  const tags: string[] = (() => { try { return JSON.parse(snippet.tags); } catch { return []; } })();
  const langColor = COLORS.langColors[snippet.language] ?? COLORS.langColors['Other'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerBtn} hitSlop={8}>
            <Ionicons
              name={snippet.is_favorite === 1 ? 'star' : 'star-outline'}
              size={20}
              color={snippet.is_favorite === 1 ? COLORS.gold : COLORS.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(`/snippet/edit/${snippet.id}`)} style={styles.headerBtn}>
            <Ionicons name="pencil-outline" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Title & Meta */}
        <Text style={styles.snippetTitle}>{snippet.title}</Text>
        <View style={styles.meta}>
          <View style={[styles.langBadge, { borderColor: langColor + '44' }]}>
            <View style={[styles.langDot, { backgroundColor: langColor }]} />
            <Text style={[styles.langText, { color: langColor }]}>{snippet.language}</Text>
          </View>
          <Text style={styles.dateText}>
            Updated {new Date(snippet.updated_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tags}>
            {tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Code Block */}
        <View style={styles.codeCard}>
          <View style={styles.codeHeader}>
            <View style={styles.codeDots}>
              <View style={[styles.dot, { backgroundColor: '#ff5f57' }]} />
              <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
              <View style={[styles.dot, { backgroundColor: '#28ca41' }]} />
            </View>
            <Text style={styles.codeHeaderLang}>{snippet.language}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={styles.codeText}>{snippet.code}</Text>
          </ScrollView>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.aiBtn]}
            onPress={handleExplain}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <ActivityIndicator size="small" color={COLORS.bg0} />
            ) : (
              <Ionicons name="sparkles" size={16} color={COLORS.bg0} />
            )}
            <Text style={styles.aiBtnText}>{aiLoading ? 'Analyzing...' : 'Explain with AI'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn2} onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn2}
            onPress={() => setShowExport(true)}
            disabled={exportLoading}
          >
            {exportLoading
              ? <ActivityIndicator size="small" color={COLORS.accent} />
              : <Ionicons name="download-outline" size={18} color={COLORS.accent} />
            }
          </TouchableOpacity>
        </View>

        {/* AI Explanation */}
        {explanation && (
          <View style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
              <Ionicons name="sparkles" size={16} color={COLORS.violet} />
              <Text style={styles.aiCardTitle}>AI Analysis</Text>
            </View>

            <View style={styles.aiSection}>
              <Text style={styles.aiSectionLabel}>Summary</Text>
              <Text style={styles.aiSummary}>{explanation.summary}</Text>
            </View>

            <View style={styles.aiSection}>
              <Text style={styles.aiSectionLabel}>Explanation</Text>
              <Text style={styles.aiExplanation}>{explanation.explanation}</Text>
            </View>

            {explanation.suggestions.length > 0 && (
              <View style={styles.aiSection}>
                <Text style={styles.aiSectionLabel}>Suggestions</Text>
                {explanation.suggestions.map((s, i) => (
                  <View key={i} style={styles.suggestion}>
                    <View style={styles.suggestionBullet} />
                    <Text style={styles.suggestionText}>{s}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Export Modal */}
      <Modal visible={showExport} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowExport(false)} activeOpacity={1}>
          <View style={styles.exportSheet}>
            <Text style={styles.exportTitle}>Export As</Text>
            {(['txt', 'js', 'json'] as ExportFormat[]).map((fmt) => (
              <TouchableOpacity
                key={fmt}
                style={styles.exportOption}
                onPress={() => handleExport(fmt)}
              >
                <View style={styles.exportIcon}>
                  <Ionicons name="document-text-outline" size={20} color={COLORS.accent} />
                </View>
                <View>
                  <Text style={styles.exportOptionTitle}>.{fmt}</Text>
                  <Text style={styles.exportOptionDesc}>
                    {fmt === 'txt' ? 'Plain text with metadata'
                      : fmt === 'js' ? 'JavaScript source file'
                      : 'JSON with full snippet data'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  backBtn: { padding: 4 },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: 8 },
  scroll: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  snippetTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.3, marginBottom: SPACING.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  langBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.bg2, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  langDot: { width: 7, height: 7, borderRadius: 3.5 },
  langText: { fontSize: 12, fontWeight: '700' },
  dateText: { fontSize: 12, color: COLORS.textMuted },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.md },
  tag: {
    backgroundColor: COLORS.accentGlow, borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.accentBorder,
  },
  tagText: { fontSize: 11, color: COLORS.textAccent, fontWeight: '500' },
  codeCard: {
    backgroundColor: COLORS.bg1, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: SPACING.md,
  },
  codeHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bg2, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  codeDots: { flexDirection: 'row', gap: 5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  codeHeaderLang: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  codeText: {
    fontFamily: 'SpaceMono', fontSize: 13, color: COLORS.textSecondary,
    padding: SPACING.md, lineHeight: 22,
  },
  actions: { flexDirection: 'row', gap: 8, marginBottom: SPACING.md },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: RADIUS.md,
  },
  aiBtn: { backgroundColor: COLORS.violet },
  aiBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  actionBtn2: {
    width: 46, height: 46, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
  },
  aiCard: {
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)',
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  aiCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md,
    paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  aiCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  aiSection: { marginBottom: SPACING.md },
  aiSectionLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textMuted,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6,
  },
  aiSummary: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600', lineHeight: 20 },
  aiExplanation: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  suggestion: { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  suggestionBullet: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.violet, marginTop: 6 },
  suggestionText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  exportSheet: {
    backgroundColor: COLORS.bg2, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg, paddingBottom: 40, borderTopWidth: 1, borderColor: COLORS.border,
  },
  exportTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  exportOption: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  exportIcon: {
    width: 40, height: 40, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentGlow, alignItems: 'center', justifyContent: 'center',
  },
  exportOptionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  exportOptionDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
