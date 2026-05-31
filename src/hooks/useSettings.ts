import { useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '../services/storage';
import { AppSettings } from '../types';

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const update = useCallback(async (changes: Partial<AppSettings>) => {
    const next = { ...settings, ...changes };
    setSettings(next);
    await saveSettings(changes);
  }, [settings]);

  return { settings, loading, update };
};
