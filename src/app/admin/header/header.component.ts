import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly layout = inject(LayoutService);
}
