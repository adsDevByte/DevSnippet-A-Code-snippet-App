import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import { getAllSnippets, searchSnippets, toggleFavorite, getSnippetCount } from '../../src/database/snippets';
import { Snippet } from '../../src/types';
import SnippetCard from '../../src/components/SnippetCard';
import SearchBar from '../../src/components/SearchBar';

const LANGUAGES_FILTER = ['All', 'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'SQL'];

export default function HomeScreen() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const [all, count] = await Promise.all([getAllSnippets(), getSnippetCount()]);
      setSnippets(all);
      setTotalCount(count);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        const results = await searchSnippets(searchQuery);
        setSnippets(activeFilter === 'All' ? results : results.filter(s => s.language === activeFilter));
      } else {
        const all = await getAllSnippets();
        setSnippets(activeFilter === 'All' ? all : all.filter(s => s.language === activeFilter));
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, activeFilter]);

  const handleFilterChange = useCallback(async (lang: string) => {
    setActiveFilter(lang);
    const all = searchQuery ? await searchSnippets(searchQuery) : await getAllSnippets();
    setSnippets(lang === 'All' ? all : all.filter(s => s.language === lang));
  }, [searchQuery]);

  const handleToggleFavorite = useCallback(async (snippet: Snippet) => {
    await toggleFavorite(snippet.id, snippet.is_favorite);
    load();
  }, [load]);

  const filtered = snippets;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SnipVault</Text>
          <Text style={styles.headerSub}>{totalCount} snippet{totalCount !== 1 ? 's' : ''} saved</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/snippet/create')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color={COLORS.bg0} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* Language filter chips */}
      <View style={styles.filters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={LANGUAGES_FILTER}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: SPACING.md, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, activeFilter === item && styles.chipActive]}
              onPress={() => handleFilterChange(item)}
            >
              <Text style={[styles.chipText, activeFilter === item && styles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="code-slash-outline" size={56} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No results found' : 'No snippets yet'}
          </Text>
          <Text style={styles.emptySub}>
            {searchQuery
              ? 'Try a different search term'
              : 'Tap + to create your first snippet'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/snippet/create')}
            >
              <Text style={styles.emptyBtnText}>Create Snippet</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={COLORS.accent}
            />
          }
          renderItem={({ item }) => (
            <SnippetCard
              snippet={item}
              onPress={() => router.push(`/snippet/${item.id}`)}
              onToggleFavorite={() => handleToggleFavorite(item)}
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
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filters: {
    marginBottom: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bg2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.accentGlow,
    borderColor: COLORS.accentBorder,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  chipTextActive: {
    color: COLORS.accent,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  emptyBtnText: {
    color: COLORS.bg0,
    fontWeight: '700',
    fontSize: 14,
  },
});
