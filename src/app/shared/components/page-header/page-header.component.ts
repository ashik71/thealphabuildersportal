import { Component, input } from '@angular/core';
import { Location } from '@angular/common';
import { inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  private readonly location = inject(Location);

  title = input('');
  subtitle = input('');
  showBack = input(false);

  goBack() {
    this.location.back();
  }
}
