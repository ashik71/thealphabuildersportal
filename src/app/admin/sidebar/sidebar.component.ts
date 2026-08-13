import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { LogoMarkComponent } from '../../shared/components/logo-mark/logo-mark.component';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatMenuModule, LogoMarkComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly layout = inject(LayoutService);
  readonly themeService = inject(ThemeService);

  readonly currentUser = this.auth.currentUser;
  readonly theme = this.themeService.theme;

  readonly navItems: NavItem[] = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    { path: '/admin/projects', label: 'Projects', icon: 'foundation' },
    { path: '/admin/shareholders', label: 'Shareholders', icon: 'groups' },
    { path: '/admin/cost-categories', label: 'Cost Categories', icon: 'category' },
  ];

  initials() {
    const name = this.currentUser()?.name ?? this.currentUser()?.email ?? '';
    return name.charAt(0).toUpperCase() || '?';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
