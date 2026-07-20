import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { LayoutService } from '../../services/layout.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatListModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly layout = inject(LayoutService);

  readonly navItems: NavItem[] = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    { path: '/admin/projects', label: 'Projects', icon: 'foundation' },
    { path: '/admin/shareholders', label: 'Shareholders', icon: 'groups' },
    { path: '/admin/cost-categories', label: 'Cost Categories', icon: 'category' },
  ];
}
