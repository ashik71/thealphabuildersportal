import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo-lockup',
  standalone: true,
  templateUrl: './logo-lockup.component.html',
  styleUrl: './logo-lockup.component.scss',
})
export class LogoLockupComponent {
  /** Rendered height in px; width follows the artwork's aspect ratio. */
  size = input(180);

  /**
   * Colour of the gap separating the tower from the letterforms. Must match the
   * surface behind the mark, or the separation reads as a stray outline.
   */
  gap = input('#F5F2EB');

  /** Hides the SUKUN / BUILDERS wordmark, leaving just the S-B-tower mark. */
  markOnly = input(false);

  protected width(): number {
    return this.markOnly() ? (this.size() * 1180) / 1500 : (this.size() * 1180) / 1900;
  }
}
