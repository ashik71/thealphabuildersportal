import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ProjectService } from '../../services/project.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { Project } from '../../interfaces/project.interface';

interface ChartBar {
  project: Project;
  estimated: number;
  actual: number;
  overBudget: boolean;
  /** Bar heights as a percentage of the chart's tallest value. */
  estimatedPct: number;
  actualPct: number;
}

const CHART_TOP_Y = 10;
const CHART_BOTTOM_Y = 190;
const CHART_HEIGHT = CHART_BOTTOM_Y - CHART_TOP_Y;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DecimalPipe, MatProgressSpinnerModule, MatIconModule, PageHeaderComponent, StatCardComponent],
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
  readonly completedCount = computed(() => this.projects().filter((p) => p.Status === 'completed').length);

  readonly drawnPct = computed(() => {
    const est = this.totalEstimated();
    return est > 0 ? Math.round((this.totalActual() / est) * 1000) / 10 : 0;
  });

  readonly recentProjects = computed(() => this.projects().slice(0, 6));

  /** Up to 6 projects, tallest-value-first scaling, for the estimated-vs-actual chart. */
  readonly chartBars = computed<ChartBar[]>(() => {
    const list = this.projects().slice(0, 6);
    const max = Math.max(1, ...list.map((p) => Math.max(p.EstimatedCost || 0, p.ActualCost || 0)));
    return list.map((project) => {
      const estimated = project.EstimatedCost || 0;
      const actual = project.ActualCost || 0;
      return {
        project,
        estimated,
        actual,
        overBudget: actual > estimated,
        estimatedPct: (estimated / max) * 100,
        actualPct: (actual / max) * 100,
      };
    });
  });

  readonly chartGroupWidth = computed(() => 560 / Math.max(1, this.chartBars().length));

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

  statusLabel(status: string) {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      case 'on-hold':
        return 'On Hold';
      case 'completed':
        return 'Completed';
      default:
        return 'Planned';
    }
  }

  /** Bar height in SVG user units, floored to stay visible even near zero. */
  barHeight(pct: number): number {
    return Math.max(1, (pct / 100) * CHART_HEIGHT);
  }

  barY(pct: number): number {
    return CHART_BOTTOM_Y - this.barHeight(pct);
  }

  progressPct(project: Project): number {
    const est = project.EstimatedCost || 0;
    if (est <= 0) return 0;
    return Math.min(100, Math.round(((project.ActualCost || 0) / est) * 1000) / 10);
  }
}
