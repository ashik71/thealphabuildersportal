import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../services/project.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProjectFormDialogComponent } from '../project-form-dialog/project-form-dialog.component';
import { Project } from '../../interfaces/project.interface';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PageHeaderComponent,
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent {
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly searchTerm = signal('');

  private readonly projects = signal<Project[]>([]);

  readonly filteredProjects = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.projects();
    if (!term) return list;
    return list.filter(
      (p) => p.Name.toLowerCase().includes(term) || (p.Location ?? '').toLowerCase().includes(term)
    );
  });

  readonly totals = computed(() => {
    const list = this.filteredProjects();
    const estimated = list.reduce((sum, p) => sum + (p.EstimatedCost || 0), 0);
    const actual = list.reduce((sum, p) => sum + (p.ActualCost || 0), 0);
    return { estimated, actual, usedPct: estimated > 0 ? Math.round((actual / estimated) * 1000) / 10 : 0 };
  });

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

  openDetails(id: string) {
    this.router.navigate(['/admin/projects', id]);
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(ProjectFormDialogComponent, { data: {} });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.projectService.create(payload).subscribe(() => {
        this.snackBar.open('Project created', 'Dismiss', { duration: 3000 });
        this.refresh();
      });
    });
  }

  openEditDialog(project: Project, event: Event) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ProjectFormDialogComponent, { data: { project } });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.projectService.update(project._id, payload).subscribe(() => {
        this.snackBar.open('Project updated', 'Dismiss', { duration: 3000 });
        this.refresh();
      });
    });
  }

  deleteProject(project: Project, event: Event) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Project',
        message: `Delete "${project.Name}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        danger: true,
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.projectService.delete(project._id).subscribe(() => {
        this.snackBar.open('Project deleted', 'Dismiss', { duration: 3000 });
        this.refresh();
      });
    });
  }

  generateLink(project: Project, event: Event) {
    event.stopPropagation();
    this.projectService.generateViewLink(project._id).subscribe({
      next: (res) => {
        navigator.clipboard?.writeText(res.url).catch(() => {});
        this.snackBar.open('View-only link copied to clipboard', 'Dismiss', { duration: 4000 });
      },
      error: () => {
        this.snackBar.open('Failed to generate link', 'Dismiss', { duration: 3000 });
      },
    });
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

  usedPct(project: Project): number {
    const est = project.EstimatedCost || 0;
    if (est <= 0) return 0;
    return Math.round(((project.ActualCost || 0) / est) * 1000) / 10;
  }

  isOverBudget(project: Project): boolean {
    return project.ActualCost > project.EstimatedCost;
  }
}
