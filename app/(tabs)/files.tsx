import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, Modal, TextInput
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import {
  listFiles, deleteFile, shareFile, formatFileSize,
  APP_DIR, SNIPPETS_DIR, ATTACHMENTS_DIR, TEMPLATES_DIR, EXPORTS_DIR,
  downloadTemplate, SAMPLE_TEMPLATES, createDirectory, ensureDirectories,
} from '../../src/services/fileSystem';
import { FileItem } from '../../src/types';

const DIR_TABS = [
  { label: 'Exports', dir: EXPORTS_DIR, icon: 'download-outline' as const },
  { label: 'Templates', dir: TEMPLATES_DIR, icon: 'document-text-outline' as const },
  { label: 'Attachments', dir: ATTACHMENTS_DIR, icon: 'image-outline' as const },
  { label: 'Snippets', dir: SNIPPETS_DIR, icon: 'code-slash-outline' as const },
];

export default function FilesScreen() {
  const [activeDir, setActiveDir] = useState(EXPORTS_DIR);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');

  const load = useCallback(async () => {
    await ensureDirectories();
    const items = await listFiles(activeDir);
    setFiles(items);
    setLoading(false);
    setRefreshing(false);
  }, [activeDir]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = (file: FileItem) => {
    Alert.alert('Delete File', `Delete "${file.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteFile(file.uri); load(); }
      },
    ]);
  };

  const handleShare = async (file: FileItem) => {
    try { await shareFile(file.uri); }
    catch (e) { Alert.alert('Share Error', String(e)); }
  };

  const handleDownloadTemplates = async () => {
    for (const tpl of SAMPLE_TEMPLATES) {
      await downloadTemplate(tpl.name, tpl.content);
    }
    if (activeDir === TEMPLATES_DIR) load();
    Alert.alert('Templates Downloaded', `${SAMPLE_TEMPLATES.length} templates saved to Templates folder.`);
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    await createDirectory(activeDir + folderName.trim() + '/');
    setFolderName('');
    setNewFolderModal(false);
    load();
  };

  const FileIcon = ({ file }: { file: FileItem }) => {
    if (file.isDirectory) return <Ionicons name="folder" size={22} color={COLORS.gold} />;
    const ext = file.name.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      js: 'logo-javascript', ts: 'logo-javascript',
      json: 'document-text', txt: 'document-text',
      png: 'image', jpg: 'image', jpeg: 'image',
    };
    const iconName = (icons[ext ?? ''] ?? 'document') as any;
    return <Ionicons name={iconName} size={22} color={COLORS.accent} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>File Manager</Text>
          <Text style={styles.sub}>{files.length} item{files.length !== 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleDownloadTemplates}>
            <Ionicons name="cloud-download-outline" size={20} color={COLORS.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setNewFolderModal(true)}>
            <Ionicons name="folder-open-outline" size={20} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dir Tabs */}
      <View style={styles.tabRow}>
        {DIR_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.tab, activeDir === tab.dir && styles.tabActive]}
            onPress={() => { setActiveDir(tab.dir); setLoading(true); }}
          >
            <Ionicons
              name={tab.icon}
              size={14}
              color={activeDir === tab.dir ? COLORS.accent : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeDir === tab.dir && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={COLORS.accent} /></View>
      ) : files.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="folder-open-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Empty folder</Text>
          <Text style={styles.emptySub}>Files saved here will appear below</Text>
          {activeDir === TEMPLATES_DIR && (
            <TouchableOpacity style={styles.dlBtn} onPress={handleDownloadTemplates}>
              <Ionicons name="cloud-download-outline" size={16} color={COLORS.bg0} />
              <Text style={styles.dlBtnText}>Download Templates</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.uri}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.accent} />
          }
          renderItem={({ item }) => (
            <View style={styles.fileRow}>
              <View style={styles.fileIcon}><FileIcon file={item} /></View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.fileMeta}>
                  {item.isDirectory ? 'Folder' : formatFileSize(item.size)}
                  {item.modificationTime
                    ? `  ·  ${new Date(item.modificationTime * 1000).toLocaleDateString()}`
                    : ''}
                </Text>
              </View>
              <View style={styles.fileActions}>
                {!item.isDirectory && (
                  <TouchableOpacity onPress={() => handleShare(item)} hitSlop={8} style={styles.actionBtn}>
                    <Ionicons name="share-outline" size={18} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* New Folder Modal */}
      <Modal visible={newFolderModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Folder</Text>
            <TextInput
              style={styles.modalInput}
              value={folderName}
              onChangeText={setFolderName}
              placeholder="Folder name..."
              placeholderTextColor={COLORS.textMuted}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setNewFolderModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleCreateFolder}>
                <Text style={styles.modalConfirmText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  sub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg2, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  tabRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md, gap: 6,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 7, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.accentGlow, borderColor: COLORS.accentBorder },
  tabText: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.accent },
  list: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  fileRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  fileIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  fileMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  fileActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary },
  emptySub: { fontSize: 13, color: COLORS.textMuted },
  dlBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: SPACING.md, backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.md,
  },
  dlBtnText: { color: COLORS.bg0, fontWeight: '700', fontSize: 13 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  modalBox: {
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.lg,
    padding: SPACING.lg, width: '80%', borderWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  modalInput: {
    backgroundColor: COLORS.bg3, borderRadius: RADIUS.sm, padding: SPACING.sm,
    color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md,
  },
  modalActions: { flexDirection: 'row', gap: 8 },
  modalCancel: {
    flex: 1, padding: SPACING.sm, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bg3, alignItems: 'center',
  },
  modalCancelText: { color: COLORS.textSecondary, fontWeight: '600' },
  modalConfirm: {
    flex: 1, padding: SPACING.sm, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accent, alignItems: 'center',
  },
  modalConfirmText: { color: COLORS.bg0, fontWeight: '700' },
});
