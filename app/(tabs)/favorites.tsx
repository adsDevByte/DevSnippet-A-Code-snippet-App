import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import { getFavoriteSnippets, toggleFavorite } from '../../src/database/snippets';
import { Snippet } from '../../src/types';
import SnippetCard from '../../src/components/SnippetCard';
import SearchBar from '../../src/components/SearchBar';

export default function FavoritesScreen() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filtered, setFiltered] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const favs = await getFavoriteSnippets();
    setSnippets(favs);
    setFiltered(favs);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (!text.trim()) { setFiltered(snippets); return; }
    const q = text.toLowerCase();
    setFiltered(snippets.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.language.toLowerCase().includes(q)
    ));
  }, [snippets]);

  const handleToggle = useCallback(async (snippet: Snippet) => {
    await toggleFavorite(snippet.id, snippet.is_favorite);
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Favorites</Text>
          <Text style={styles.sub}>{snippets.length} starred snippet{snippets.length !== 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.starBadge}>
          <Ionicons name="star" size={18} color={COLORS.gold} />
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={handleSearch} placeholder="Search favorites..." />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="star-outline" size={56} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>{query ? 'No results' : 'No favorites yet'}</Text>
          <Text style={styles.emptySub}>
            {query ? 'Try another search' : 'Star a snippet to see it here'}
          </Text>
          {!query && (
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/')}>
              <Text style={styles.browseBtnText}>Browse Snippets</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SnippetCard
              snippet={item}
              onPress={() => router.push(`/snippet/${item.id}`)}
              onToggleFavorite={() => handleToggle(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  sub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  starBadge: {
    width: 42, height: 42, borderRadius: RADIUS.md,
    backgroundColor: COLORS.goldGlow,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
  },
  searchWrap: { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  list: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary, marginTop: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  browseBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  browseBtnText: { color: COLORS.bg0, fontWeight: '700', fontSize: 14 },
});
