import { Component, computed, input } from '@angular/core';

interface AvatarTint {
  container: string;
  onContainer: string;
}

// Mirrors the-alpha-builders-mobile's champagne_theme.dart avatarPalette, so
// the same name renders the same color in both apps.
const PALETTE: AvatarTint[] = [
  { container: '#F1E6C3', onContainer: '#5C450C' }, // gold
  { container: '#DFEADF', onContainer: '#276749' }, // green
  { container: '#DCE7F0', onContainer: '#2C5B7A' }, // blue
  { container: '#F0DCE7', onContainer: '#7A2C5B' }, // pink
  { container: '#F7E0DD', onContainer: '#9B4A2C' }, // red
  { container: '#E3DCF0', onContainer: '#5A2C7A' }, // purple
];

@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  name = input('');
  size = input(32);

  protected readonly initials = computed(() => initialsOf(this.name()));
  protected readonly tint = computed(() => PALETTE[stableHash(this.name()) % PALETTE.length]);
}

// djb2 hash — mirrors avatar.dart's _stableHash. Deliberately not
// String.prototype's own hashing (there isn't one) or a naive sum, which
// clusters short strings into too few buckets.
function stableHash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
}

// Mirrors avatar.dart's _initials: strip email domain, split on
// whitespace/./_/-, first letter of first + last token.
function initialsOf(name: string): string {
  const cleaned = name.trim().split('@')[0];
  const parts = cleaned.split(/[\s._-]+/).filter((p) => p.length > 0);
  if (parts.length === 0) {
    return '?';
  }
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
