/** Thème de couleurs sélectionnable (palette appliquée via une classe sur <body>). */
export interface AppTheme {
  readonly id: string;
  readonly label: string;
}

export const DEFAULT_THEME = 'default';

/** Pour ajouter un thème : 1 entrée ici + 1 bloc `body.theme-<id>` dans styles.scss. */
export const THEMES: readonly AppTheme[] = [
  { id: 'default', label: '⚽ Défaut' },
  { id: 'france', label: '🇫🇷 France' },
  { id: 'civ', label: "🇨🇮 Côte d'Ivoire" },
  { id: 'portugal', label: '🇵🇹 Portugal' },
  { id: 'espagne', label: '🇪🇸 Espagne' },
  { id: 'usa', label: '🇺🇸 États-Unis' },
  { id: 'maroc', label: '🇲🇦 Maroc' },
];
