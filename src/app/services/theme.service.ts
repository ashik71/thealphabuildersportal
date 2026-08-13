import { Injectable, signal, effect } from '@angular/core';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'portal-theme';

/**
 * One theme switch for the whole site — admin rail and shareholder portal
 * both read and write it, so there is a single source of truth instead of
 * two toggles that can drift out of sync. Storage key and the
 * `data-portal-theme` attribute are unchanged from the portal-only service
 * this replaces, so existing sessions keep their saved preference.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<AppTheme>(this.readInitial());

  constructor() {
    effect(() => {
      const theme = this.theme();
      document.documentElement.setAttribute('data-portal-theme', theme);
      document.documentElement.classList.toggle('sb-dark', theme === 'dark');
      document.documentElement.classList.toggle('sb-light', theme === 'light');
      localStorage.setItem(STORAGE_KEY, theme);
    });
  }

  toggle() {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  private readInitial(): AppTheme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
