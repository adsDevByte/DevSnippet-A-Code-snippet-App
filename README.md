# SnipVault 📦

A modern, offline-first code snippet manager built with **Expo SDK 52**, **React Native**, and **TypeScript**.

---

## Features

- ✅ **Snippet Management** — Create, edit, delete, search, and favorite code snippets
- ✅ **Offline-First** — All data stored locally with SQLite; no internet required
- ✅ **File Manager** — Browse exports, templates, attachments via Expo FileSystem
- ✅ **AI Explanations** — Explain code with Anthropic Claude or OpenAI GPT
- ✅ **Export & Share** — Export snippets as `.txt`, `.js`, or `.json`
- ✅ **Secure Key Storage** — API keys stored with Expo SecureStore
- ✅ **Beautiful Dark UI** — Developer-focused design with monospace fonts

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator / Android Emulator, or Expo Go app

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Add the SpaceMono font
# Download SpaceMono-Regular.ttf and place it at:
# assets/fonts/SpaceMono-Regular.ttf
# (Available from Google Fonts: https://fonts.google.com/specimen/Space+Mono)

# 3. Start the development server
npx expo start
```

### Running on Device

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

---

## Project Structure

```
SnipVault/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout (fonts, DB init)
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab navigator
│   │   ├── index.tsx           # Home (snippet list)
│   │   ├── favorites.tsx       # Favorites screen
│   │   ├── files.tsx           # File manager screen
│   │   └── settings.tsx        # Settings screen
│   └── snippet/
│       ├── [id].tsx            # Snippet detail + AI explain + export
│       ├── create.tsx          # Create new snippet
│       └── edit/[id].tsx       # Edit snippet
├── src/
│   ├── components/
│   │   ├── SnippetCard.tsx     # Snippet list card
│   │   ├── SearchBar.tsx       # Search input
│   │   ├── TagInput.tsx        # Tag management
│   │   └── LanguagePicker.tsx  # Language selector modal
│   ├── constants/
│   │   └── theme.ts            # Colors, spacing, radius
│   ├── database/
│   │   └── snippets.ts         # SQLite CRUD operations
│   ├── hooks/
│   │   ├── useSnippets.ts      # Snippet state hook
│   │   └── useSettings.ts      # Settings state hook
│   ├── services/
│   │   ├── ai.ts               # AI explanation (Anthropic / OpenAI)
│   │   ├── fileSystem.ts       # Expo FileSystem operations
│   │   └── storage.ts          # AsyncStorage + SecureStore
│   └── types/
│       └── index.ts            # TypeScript types
└── assets/
    └── fonts/
        └── SpaceMono-Regular.ttf
```

---

## Storage Architecture

| Technology | Usage |
|---|---|
| **SQLite** (`expo-sqlite`) | All snippet data — offline-first |
| **AsyncStorage** | App preferences, theme, last language |
| **SecureStore** | API keys (Anthropic, OpenAI) — encrypted |
| **Expo FileSystem** | Exports, templates, file browser |

---

## AI Setup

1. Open the app → **Settings** tab
2. Choose your AI provider: **Claude** (Anthropic) or **OpenAI**
3. Tap **Add** next to the relevant API key
4. Enter your key — stored securely on-device

- Anthropic key format: `sk-ant-...`
- OpenAI key format: `sk-...`

Then open any snippet → tap **"Explain with AI"**

---

## Screens

| Screen | Description |
|---|---|
| Home | Browse all snippets, search, filter by language |
| Favorites | Starred snippets |
| Files | File browser for exports, templates, attachments |
| Settings | AI provider, API keys, font size |
| Snippet Detail | View code, AI explain, export, share, edit, delete |
| Create/Edit | Form to create or edit snippets |

---

## Notes

- The app uses `expo-router` for file-based navigation
- SQLite database is initialized on app start with `WAL` mode for performance
- All file operations use `expo-file-system` in the app's document directory
- The font `SpaceMono` must be present in `assets/fonts/` for code rendering
