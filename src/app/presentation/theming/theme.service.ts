import { Injectable, computed, effect, signal } from '@angular/core';
import { AppTheme, DEFAULT_THEME, THEMES } from './themes';

/**
 * Gère le thème de couleurs courant (persisté), appliqué via une classe `theme-<id>`
 * sur <body> — ce qui couvre aussi les overlays Material (menus, snackbars).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private static readonly KEY = 'wc2026-theme';
  private static readonly DARK_KEY = 'wc2026-dark';
  readonly themes: readonly AppTheme[] = THEMES;

  private readonly _current = signal<string>(this.load());
  readonly current = this._current.asReadonly();
  readonly currentLabel = computed(
    () => this.themes.find((t) => t.id === this._current())?.label ?? '',
  );

  private readonly _dark = signal<boolean>(this.loadDark());
  readonly dark = this._dark.asReadonly();

  constructor() {
    effect(() => this.apply(this._current()));
    effect(() => this.applyDark(this._dark()));
  }

  set(id: string): void {
    if (this.themes.some((t) => t.id === id)) this._current.set(id);
  }

  toggleDark(): void {
    this._dark.update((d) => !d);
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

  private applyDark(dark: boolean): void {
    document.body.classList.toggle('wc-dark', dark);
    try {
      localStorage.setItem(ThemeService.DARK_KEY, dark ? '1' : '0');
    } catch {
      /* indispo : préférence en mémoire uniquement */
    }
  }

  private loadDark(): boolean {
    try {
      return localStorage.getItem(ThemeService.DARK_KEY) === '1';
    } catch {
      return false;
    }
  }

  private load(): string {
    try {
      const stored = localStorage.getItem(ThemeService.KEY);
      // Retombe sur Défaut si le thème mémorisé n'existe plus (ex. supprimé).
      return stored && THEMES.some((t) => t.id === stored) ? stored : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  }
}
