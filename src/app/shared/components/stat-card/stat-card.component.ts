import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type StatCardTone = 'neutral' | 'primary' | 'success' | 'warn';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | null>();
  icon = input<string>('');
  tone = input<StatCardTone>('neutral');
}
