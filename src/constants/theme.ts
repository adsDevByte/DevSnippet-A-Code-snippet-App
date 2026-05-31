export const COLORS = {
  // Backgrounds
  bg0: '#0a0a0f',
  bg1: '#0f0f1a',
  bg2: '#151520',
  bg3: '#1c1c2e',
  bg4: '#252538',

  // Accent - Electric Cyan
  accent: '#00d4ff',
  accentDim: '#00aacc',
  accentGlow: 'rgba(0, 212, 255, 0.15)',
  accentBorder: 'rgba(0, 212, 255, 0.3)',

  // Secondary accent - Violet
  violet: '#7c3aed',
  violetDim: '#5b21b6',
  violetGlow: 'rgba(124, 58, 237, 0.15)',

  // Success / Favorite
  gold: '#f59e0b',
  goldGlow: 'rgba(245, 158, 11, 0.15)',

  // Status
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',

  // Text
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted: '#475569',
  textAccent: '#00d4ff',

  // Borders
  border: 'rgba(255,255,255,0.06)',
  borderActive: 'rgba(0, 212, 255, 0.4)',

  // Language colors
  langColors: {
    JavaScript: '#f7df1e',
    TypeScript: '#3178c6',
    Python: '#3776ab',
    Java: '#ed8b00',
    'C++': '#00599c',
    'C#': '#239120',
    Go: '#00add8',
    Rust: '#dea584',
    Swift: '#fa7343',
    Kotlin: '#7f52ff',
    PHP: '#777bb4',
    Ruby: '#cc342d',
    Shell: '#4eaa25',
    SQL: '#336791',
    HTML: '#e34f26',
    CSS: '#1572b6',
    Other: '#94a3b8',
  } as Record<string, string>,
};

export const FONTS = {
  mono: 'SpaceMono',
  sans: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};
