import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, finalize } from 'rxjs';
import { PortalService } from '../../services/portal.service';
import { PortalProject, PortalSummary } from '../../interfaces/portal.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './portal-dashboard.component.html',
  styleUrl: './portal-dashboard.component.scss',
})
export class PortalDashboardComponent {
  private readonly portal = inject(PortalService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly summary = signal<PortalSummary | null>(null);
  readonly projects = signal<PortalProject[]>([]);

  readonly userName = this.auth.currentUser()?.name ?? '';

  constructor() {
    forkJoin({
      summary: this.portal.getSummary(),
      projects: this.portal.getProjects(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ summary, projects }) => {
          this.summary.set(summary);
          this.projects.set(projects);
        },
        error: () => this.failed.set(true),
      });
  }

  /** Share of this project's commitment already paid, as a percentage. */
  progress(project: PortalProject) {
    if (!project.Committed) return 0;
    return Math.min(100, Math.round((project.Paid / project.Committed) * 100));
  }

  statusLabel(status: string) {
    return status.replace('-', ' ');
  }
}
