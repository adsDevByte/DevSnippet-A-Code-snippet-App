import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { FileItem, ExportFormat } from '../types';
import { Snippet } from '../types';

export const APP_DIR = FileSystem.documentDirectory + 'SnipVault/';
export const SNIPPETS_DIR = APP_DIR + 'snippets/';
export const ATTACHMENTS_DIR = APP_DIR + 'attachments/';
export const TEMPLATES_DIR = APP_DIR + 'templates/';
export const EXPORTS_DIR = APP_DIR + 'exports/';

export const ensureDirectories = async (): Promise<void> => {
  for (const dir of [APP_DIR, SNIPPETS_DIR, ATTACHMENTS_DIR, TEMPLATES_DIR, EXPORTS_DIR]) {
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
  }
};

export const listFiles = async (dirUri: string): Promise<FileItem[]> => {
  try {
    const info = await FileSystem.getInfoAsync(dirUri);
    if (!info.exists || !info.isDirectory) return [];

    const names = await FileSystem.readDirectoryAsync(dirUri);
    const items = await Promise.all(
      names.map(async (name): Promise<FileItem> => {
        const uri = dirUri + name;
        const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
        return {
          name,
          uri,
          size: fileInfo.exists && !fileInfo.isDirectory ? fileInfo.size : undefined,
          isDirectory: fileInfo.exists && fileInfo.isDirectory,
          modificationTime: fileInfo.exists ? fileInfo.modificationTime : undefined,
        };
      })
    );

    return items.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  } catch {
    return [];
  }
};

export const readFile = async (uri: string): Promise<string> => {
  return await FileSystem.readAsStringAsync(uri);
};

export const writeFile = async (uri: string, content: string): Promise<void> => {
  await FileSystem.writeAsStringAsync(uri, content);
};

export const deleteFile = async (uri: string): Promise<void> => {
  await FileSystem.deleteAsync(uri, { idempotent: true });
};

export const copyFile = async (from: string, to: string): Promise<void> => {
  await FileSystem.copyAsync({ from, to });
};

export const moveFile = async (from: string, to: string): Promise<void> => {
  await FileSystem.moveAsync({ from, to });
};

export const getFileInfo = async (uri: string) => {
  return await FileSystem.getInfoAsync(uri, { size: true });
};

export const createDirectory = async (uri: string): Promise<void> => {
  await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
};

export const shareFile = async (uri: string): Promise<void> => {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) throw new Error('Sharing not available on this device');
  await Sharing.shareAsync(uri);
};

// ── Export Snippets ───────────────────────────────────────────────────────────

export const exportSnippet = async (
  snippet: Snippet,
  format: ExportFormat
): Promise<string> => {
  await ensureDirectories();
  const safeName = snippet.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  let content = '';
  let filename = '';

  if (format === 'txt') {
    filename = `${safeName}.txt`;
    content = [
      `Title: ${snippet.title}`,
      `Language: ${snippet.language}`,
      `Tags: ${JSON.parse(snippet.tags).join(', ')}`,
      `Created: ${snippet.created_at}`,
      '',
      '// Code:',
      snippet.code,
    ].join('\n');
  } else if (format === 'js') {
    filename = `${safeName}.js`;
    content = [
      `// ${snippet.title}`,
      `// Language: ${snippet.language}`,
      `// Tags: ${JSON.parse(snippet.tags).join(', ')}`,
      '',
      snippet.code,
    ].join('\n');
  } else if (format === 'json') {
    filename = `${safeName}.json`;
    content = JSON.stringify(
      {
        id: snippet.id,
        title: snippet.title,
        language: snippet.language,
        tags: JSON.parse(snippet.tags),
        code: snippet.code,
        created_at: snippet.created_at,
        updated_at: snippet.updated_at,
      },
      null,
      2
    );
  }

  const fileUri = EXPORTS_DIR + filename;
  await FileSystem.writeAsStringAsync(fileUri, content);
  return fileUri;
};

export const downloadTemplate = async (
  name: string,
  content: string
): Promise<string> => {
  await ensureDirectories();
  const uri = TEMPLATES_DIR + name;
  await FileSystem.writeAsStringAsync(uri, content);
  return uri;
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const SAMPLE_TEMPLATES = [
  {
    name: 'react-component.tsx',
    content: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
}

const MyComponent: React.FC<Props> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
});

export default MyComponent;
`,
  },
  {
    name: 'async-fetch.ts',
    content: `interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(\`HTTP error: \${response.status}\`);
    const data = await response.json();
    return { data, status: response.status, message: 'Success' };
  } catch (error) {
    throw new Error(\`Fetch failed: \${error}\`);
  }
}

export default fetchData;
`,
  },
  {
    name: 'debounce.js',
    content: `/**
 * Debounce a function call
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

module.exports = debounce;
`,
  },
];
