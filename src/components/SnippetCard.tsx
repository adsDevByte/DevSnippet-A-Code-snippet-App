import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Snippet } from '../types';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  snippet: Snippet;
  onPress: () => void;
  onToggleFavorite: () => void;
}

const getLangColor = (lang: string): string =>
  COLORS.langColors[lang] ?? COLORS.langColors['Other'];

const SnippetCard: React.FC<Props> = ({ snippet, onPress, onToggleFavorite }) => {
  const tags: string[] = (() => {
    try { return JSON.parse(snippet.tags); } catch { return []; }
  })();

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(snippet.updated_at), { addSuffix: true });
    } catch {
      return '';
    }
  })();

  const langColor = getLangColor(snippet.language);
  const preview = snippet.code.split('\n').slice(0, 3).join('\n');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Top row */}
      <View style={styles.header}>
        <View style={styles.langBadge}>
          <View style={[styles.langDot, { backgroundColor: langColor }]} />
          <Text style={[styles.langText, { color: langColor }]}>{snippet.language}</Text>
        </View>
        <TouchableOpacity onPress={onToggleFavorite} hitSlop={8}>
          <Ionicons
            name={snippet.is_favorite === 1 ? 'star' : 'star-outline'}
            size={18}
            color={snippet.is_favorite === 1 ? COLORS.gold : COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>{snippet.title}</Text>

      {/* Code preview */}
      <View style={styles.codePreview}>
        <Text style={styles.codeText} numberOfLines={3}>{preview}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.tags}>
          {tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {tags.length > 3 && (
            <Text style={styles.moreText}>+{tags.length - 3}</Text>
          )}
        </View>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg2,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardPressed: {
    backgroundColor: COLORS.bg3,
    borderColor: COLORS.accentBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.bg4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  langDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  langText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  codePreview: {
    backgroundColor: COLORS.bg0,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accentDim,
  },
  codeText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
  },
  tag: {
    backgroundColor: COLORS.accentGlow,
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.textAccent,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  time: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
});

export default SnippetCard;
