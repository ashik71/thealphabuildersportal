import { Injectable, signal, effect } from '@angular/core';

export type PortalTheme = 'light' | 'dark';

const STORAGE_KEY = 'portal-theme';

@Injectable({ providedIn: 'root' })
export class PortalThemeService {
  readonly theme = signal<PortalTheme>(this.readInitial());

  constructor() {
    effect(() => {
      const theme = this.theme();
      document.documentElement.setAttribute('data-portal-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);
    });
  }

  toggle() {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  private readInitial(): PortalTheme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
