import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import {
  getSettings, saveSettings, getAnthropicKey, saveAnthropicKey,
  deleteAnthropicKey, getOpenAIKey, saveOpenAIKey, deleteOpenAIKey
} from '../../src/services/storage';
import { AppSettings } from '../../src/types';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const Row = ({ icon, label, children, desc }: {
  icon: string; label: string; children?: React.ReactNode; desc?: string
}) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon as any} size={18} color={COLORS.accent} />
      </View>
      <View>
        <Text style={styles.rowLabel}>{label}</Text>
        {desc && <Text style={styles.rowDesc}>{desc}</Text>}
      </View>
    </View>
    {children}
  </View>
);

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark', fontSize: 14, defaultLanguage: 'JavaScript', aiProvider: 'anthropic'
  });
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [hasAnthropicKey, setHasAnthropicKey] = useState(false);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [keyModal, setKeyModal] = useState<null | 'anthropic' | 'openai'>(null);
  const [tempKey, setTempKey] = useState('');

  useEffect(() => {
    getSettings().then(setSettings);
    getAnthropicKey().then(k => setHasAnthropicKey(!!k));
    getOpenAIKey().then(k => setHasOpenAIKey(!!k));
  }, []);

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await saveSettings({ [key]: value });
  };

  const handleSaveKey = async () => {
    if (!tempKey.trim()) return;
    if (keyModal === 'anthropic') {
      await saveAnthropicKey(tempKey.trim());
      setHasAnthropicKey(true);
    } else if (keyModal === 'openai') {
      await saveOpenAIKey(tempKey.trim());
      setHasOpenAIKey(true);
    }
    setTempKey('');
    setKeyModal(null);
    Alert.alert('Saved', 'API key stored securely.');
  };

  const handleDeleteKey = (provider: 'anthropic' | 'openai') => {
    Alert.alert('Remove API Key', `Remove your ${provider === 'anthropic' ? 'Anthropic' : 'OpenAI'} API key?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          if (provider === 'anthropic') { await deleteAnthropicKey(); setHasAnthropicKey(false); }
          else { await deleteOpenAIKey(); setHasOpenAIKey(false); }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.sub}>Customize your experience</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Section title="AI Provider">
          <Row icon="sparkles-outline" label="Provider" desc="Used for code explanations">
            <View style={styles.providerToggle}>
              <TouchableOpacity
                style={[styles.providerBtn, settings.aiProvider === 'anthropic' && styles.providerBtnActive]}
                onPress={() => updateSetting('aiProvider', 'anthropic')}
              >
                <Text style={[styles.providerBtnText, settings.aiProvider === 'anthropic' && styles.providerBtnTextActive]}>
                  Claude
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.providerBtn, settings.aiProvider === 'openai' && styles.providerBtnActive]}
                onPress={() => updateSetting('aiProvider', 'openai')}
              >
                <Text style={[styles.providerBtnText, settings.aiProvider === 'openai' && styles.providerBtnTextActive]}>
                  OpenAI
                </Text>
              </TouchableOpacity>
            </View>
          </Row>

          <Row
            icon="key-outline"
            label="Anthropic API Key"
            desc={hasAnthropicKey ? '● Configured securely' : 'Not configured'}
          >
            <View style={styles.keyActions}>
              <TouchableOpacity
                style={[styles.keyBtn, hasAnthropicKey && styles.keyBtnDanger]}
                onPress={hasAnthropicKey ? () => handleDeleteKey('anthropic') : () => { setTempKey(''); setKeyModal('anthropic'); }}
              >
                <Ionicons
                  name={hasAnthropicKey ? 'trash-outline' : 'add-circle-outline'}
                  size={14}
                  color={hasAnthropicKey ? COLORS.error : COLORS.accent}
                />
                <Text style={[styles.keyBtnText, hasAnthropicKey && { color: COLORS.error }]}>
                  {hasAnthropicKey ? 'Remove' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </Row>

          <Row
            icon="key-outline"
            label="OpenAI API Key"
            desc={hasOpenAIKey ? '● Configured securely' : 'Not configured'}
          >
            <View style={styles.keyActions}>
              <TouchableOpacity
                style={[styles.keyBtn, hasOpenAIKey && styles.keyBtnDanger]}
                onPress={hasOpenAIKey ? () => handleDeleteKey('openai') : () => { setTempKey(''); setKeyModal('openai'); }}
              >
                <Ionicons
                  name={hasOpenAIKey ? 'trash-outline' : 'add-circle-outline'}
                  size={14}
                  color={hasOpenAIKey ? COLORS.error : COLORS.accent}
                />
                <Text style={[styles.keyBtnText, hasOpenAIKey && { color: COLORS.error }]}>
                  {hasOpenAIKey ? 'Remove' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </Row>
        </Section>

        <Section title="Editor">
          <Row icon="text-outline" label="Font Size" desc={`${settings.fontSize}px`}>
            <View style={styles.fontSizeRow}>
              <TouchableOpacity
                style={styles.fontBtn}
                onPress={() => updateSetting('fontSize', Math.max(10, settings.fontSize - 1))}
              >
                <Ionicons name="remove" size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.fontSizeVal}>{settings.fontSize}</Text>
              <TouchableOpacity
                style={styles.fontBtn}
                onPress={() => updateSetting('fontSize', Math.min(22, settings.fontSize + 1))}
              >
                <Ionicons name="add" size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </Row>
        </Section>

        <Section title="About">
          <Row icon="information-circle-outline" label="Version" desc="1.0.0">
            <Text style={styles.versionText}>SnipVault</Text>
          </Row>
          <Row icon="shield-checkmark-outline" label="Security" desc="API keys stored with SecureStore" />
          <Row icon="server-outline" label="Storage" desc="SQLite + Expo FileSystem offline-first" />
        </Section>

      </ScrollView>

      {/* API Key Modal */}
      <Modal visible={!!keyModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {keyModal === 'anthropic' ? 'Anthropic API Key' : 'OpenAI API Key'}
            </Text>
            <Text style={styles.modalDesc}>
              Your key is stored securely using Expo SecureStore and never leaves your device.
            </Text>
            <View style={styles.keyInputRow}>
              <TextInput
                style={styles.keyInput}
                value={tempKey}
                onChangeText={setTempKey}
                placeholder={keyModal === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showAnthropicKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowAnthropicKey(!showAnthropicKey)}
              >
                <Ionicons
                  name={showAnthropicKey ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setKeyModal(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveKey}>
                <Text style={styles.modalSaveText}>Save Securely</Text>
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
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  sub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  scroll: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  section: { marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.textMuted,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4,
  },
  sectionBody: {
    backgroundColor: COLORS.bg2, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  rowIcon: {
    width: 32, height: 32, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentGlow, alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  rowDesc: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  providerToggle: { flexDirection: 'row', gap: 4 },
  providerBtn: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bg3, borderWidth: 1, borderColor: COLORS.border,
  },
  providerBtnActive: { backgroundColor: COLORS.accentGlow, borderColor: COLORS.accentBorder },
  providerBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  providerBtnTextActive: { color: COLORS.accent },
  keyActions: { flexDirection: 'row', gap: 6 },
  keyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentGlow, borderWidth: 1, borderColor: COLORS.accentBorder,
  },
  keyBtnDanger: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' },
  keyBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.accent },
  fontSizeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fontBtn: {
    width: 28, height: 28, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bg3, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  fontSizeVal: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, minWidth: 20, textAlign: 'center' },
  versionText: { fontSize: 12, color: COLORS.textMuted },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.bg2, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg, borderTopWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  modalDesc: { fontSize: 13, color: COLORS.textMuted, marginBottom: SPACING.md, lineHeight: 18 },
  keyInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg3, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md,
  },
  keyInput: { flex: 1, padding: SPACING.sm, color: COLORS.textPrimary, fontSize: 13, fontFamily: 'SpaceMono' },
  eyeBtn: { padding: SPACING.sm },
  modalActions: { flexDirection: 'row', gap: 8, paddingBottom: SPACING.md },
  modalCancel: {
    flex: 1, padding: SPACING.sm + 2, borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg3, alignItems: 'center',
  },
  modalCancelText: { color: COLORS.textSecondary, fontWeight: '600' },
  modalSave: {
    flex: 2, padding: SPACING.sm + 2, borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent, alignItems: 'center',
  },
  modalSaveText: { color: COLORS.bg0, fontWeight: '700' },
});
