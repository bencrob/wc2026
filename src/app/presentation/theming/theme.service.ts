import { Injectable, computed, effect, signal } from '@angular/core';
import { AppTheme, DEFAULT_THEME, THEMES } from './themes';

/**
 * Gère le thème de couleurs courant (persisté), appliqué via une classe `theme-<id>`
 * sur <body> — ce qui couvre aussi les overlays Material (menus, snackbars).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private static readonly KEY = 'wc2026-theme';
  readonly themes: readonly AppTheme[] = THEMES;

  private readonly _current = signal<string>(this.load());
  readonly current = this._current.asReadonly();
  readonly currentLabel = computed(
    () => this.themes.find((t) => t.id === this._current())?.label ?? '',
  );

  constructor() {
    effect(() => this.apply(this._current()));
  }

  set(id: string): void {
    if (this.themes.some((t) => t.id === id)) this._current.set(id);
  }

  private apply(id: string): void {
    const body = document.body;
    const toRemove = Array.from(body.classList).filter((c) => c.startsWith('theme-'));
    body.classList.remove(...toRemove);
    body.classList.add('theme-' + id);
    try {
      localStorage.setItem(ThemeService.KEY, id);
    } catch {
      /* indispo : thème en mémoire uniquement */
    }
  }

  private load(): string {
    try {
      return localStorage.getItem(ThemeService.KEY) ?? DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  }
}
