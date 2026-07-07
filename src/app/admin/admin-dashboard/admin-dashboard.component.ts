import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjectService } from '../../services/project.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { Project } from '../../interfaces/project.interface';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    StatCardComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  private readonly projects = signal<Project[]>([]);

  readonly projectCount = computed(() => this.projects().length);
  readonly totalEstimated = computed(() => this.projects().reduce((sum, p) => sum + (p.EstimatedCost || 0), 0));
  readonly totalActual = computed(() => this.projects().reduce((sum, p) => sum + (p.ActualCost || 0), 0));
  readonly activeCount = computed(() => this.projects().filter((p) => p.Status === 'in-progress').length);

  readonly recentProjects = computed(() => this.projects().slice(0, 6));

  constructor() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.projectService.getAll().subscribe({
      next: (list) => {
        this.projects.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openProject(id: string) {
    this.router.navigate(['/admin/projects', id]);
  }

  statusTone(status: string) {
    switch (status) {
      case 'completed':
        return 'success';
      case 'on-hold':
        return 'warn';
      default:
        return 'primary';
    }
  }
}
