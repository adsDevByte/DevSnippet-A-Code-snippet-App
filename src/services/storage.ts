import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AppSettings } from '../types';

const KEYS = {
  SETTINGS: 'app_settings',
  ONBOARDED: 'onboarded',
  LAST_LANGUAGE: 'last_language',
};

const SECURE_KEYS = {
  ANTHROPIC_API_KEY: 'anthropic_api_key',
  OPENAI_API_KEY: 'openai_api_key',
};

// ── Settings ──────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  fontSize: 14,
  defaultLanguage: 'JavaScript',
  aiProvider: 'anthropic',
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  const current = await getSettings();
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }));
};

export const isOnboarded = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDED);
  return val === 'true';
};

export const setOnboarded = async (): Promise<void> => {
  await AsyncStorage.setItem(KEYS.ONBOARDED, 'true');
};

export const getLastLanguage = async (): Promise<string> => {
  return (await AsyncStorage.getItem(KEYS.LAST_LANGUAGE)) ?? 'JavaScript';
};

export const setLastLanguage = async (lang: string): Promise<void> => {
  await AsyncStorage.setItem(KEYS.LAST_LANGUAGE, lang);
};

// ── Secure API Keys ───────────────────────────────────────────────────────────

export const getAnthropicKey = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(SECURE_KEYS.ANTHROPIC_API_KEY);
  } catch {
    return null;
  }
};

export const saveAnthropicKey = async (key: string): Promise<void> => {
  await SecureStore.setItemAsync(SECURE_KEYS.ANTHROPIC_API_KEY, key);
};

export const deleteAnthropicKey = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(SECURE_KEYS.ANTHROPIC_API_KEY);
};

export const getOpenAIKey = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(SECURE_KEYS.OPENAI_API_KEY);
  } catch {
    return null;
  }
};

export const saveOpenAIKey = async (key: string): Promise<void> => {
  await SecureStore.setItemAsync(SECURE_KEYS.OPENAI_API_KEY, key);
};

export const deleteOpenAIKey = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(SECURE_KEYS.OPENAI_API_KEY);
};
