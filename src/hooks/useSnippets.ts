import { useState, useEffect, useCallback } from 'react';
import {
  getAllSnippets,
  searchSnippets,
  getFavoriteSnippets,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  toggleFavorite,
  initDatabase,
} from '../database/snippets';
import { Snippet, SnippetFormData } from '../types';

export const useSnippets = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const all = await getAllSnippets();
      setSnippets(all);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initDatabase().then(load);
  }, [load]);

  const search = useCallback(async (query: string): Promise<Snippet[]> => {
    if (!query.trim()) return await getAllSnippets();
    return await searchSnippets(query);
  }, []);

  const favorites = useCallback(async (): Promise<Snippet[]> => {
    return await getFavoriteSnippets();
  }, []);

  const create = useCallback(async (data: SnippetFormData): Promise<number> => {
    const id = await createSnippet(data);
    await load();
    return id;
  }, [load]);

  const update = useCallback(async (id: number, data: Partial<SnippetFormData>): Promise<void> => {
    await updateSnippet(id, data);
    await load();
  }, [load]);

  const remove = useCallback(async (id: number): Promise<void> => {
    await deleteSnippet(id);
    await load();
  }, [load]);

  const toggle = useCallback(async (id: number, current: number): Promise<void> => {
    await toggleFavorite(id, current);
    await load();
  }, [load]);

  return {
    snippets,
    loading,
    error,
    refresh: load,
    search,
    favorites,
    create,
    update,
    remove,
    toggle,
  };
};
