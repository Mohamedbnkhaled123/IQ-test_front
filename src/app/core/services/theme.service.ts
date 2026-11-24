import { Injectable, computed, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'iq_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeSignal = signal<ThemeMode>(this.readInitialTheme());

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    effect(() => {
      const mode = this.themeSignal();
      document.documentElement.setAttribute('data-theme', mode);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch {
        // Ignore storage errors in restricted environments.
      }
    });
  }

  toggleTheme(): void {
    this.themeSignal.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  private readInitialTheme(): ThemeMode {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // Ignore storage errors.
    }
    return 'light';
  }
}
