export interface Snippet {
  id: number;
  title: string;
  code: string;
  language: string;
  tags: string; // JSON string array
  is_favorite: number; // 0 or 1 (SQLite boolean)
  created_at: string;
  updated_at: string;
  file_path?: string; // optional attached file
}

export interface SnippetFormData {
  title: string;
  code: string;
  language: string;
  tags: string[];
  is_favorite: boolean;
}

export interface FileItem {
  name: string;
  uri: string;
  size?: number;
  isDirectory: boolean;
  modificationTime?: number;
}

export interface AIExplanation {
  explanation: string;
  summary: string;
  suggestions: string[];
}

export type ExportFormat = 'txt' | 'js' | 'json';

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  defaultLanguage: string;
  aiProvider: 'anthropic' | 'openai';
}

export const PROGRAMMING_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'PHP',
  'Ruby',
  'Shell',
  'SQL',
  'HTML',
  'CSS',
  'JSON',
  'YAML',
  'Markdown',
  'Other',
];
