import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo-mark',
  standalone: true,
  templateUrl: './logo-mark.component.html',
  styleUrl: './logo-mark.component.scss',
})
export class LogoMarkComponent {
  /** Rendered height in px; the mark scales on its intrinsic aspect ratio. */
  size = input(24);

  /**
   * Colour of the gap carved between the tower and the letterforms. Must match
   * the surface the mark sits on, otherwise the separation reads as an outline.
   */
  gap = input('transparent');

  /**
   * Drops the antenna and tightens the crop so the S and B fill the box. The
   * full mark is too tall to sit beside a wordmark — at matching height the
   * letters shrink to roughly a quarter of the text's cap height. Use the full
   * mark only where it stands alone.
   */
  inline = input(false);

  /**
   * Width preserving the active viewBox's ratio. Both boxes come from measured
   * geometry bounds, so changing the artwork means re-measuring these.
   */
  protected width(): number {
    return this.inline() ? (this.size() * 403) / 432 : (this.size() * 403) / 464;
  }
}
