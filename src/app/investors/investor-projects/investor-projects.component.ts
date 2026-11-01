import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvestorService } from '../../services/investor.service';
import { ProjectService } from '../../services/project.service';
import { Investor, InvestorProject } from '../../interfaces/investor.interface';
import { Project } from '../../interfaces/project.interface';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { InvestorProjectFormDialogComponent } from './investor-project-form-dialog.component';
import { InvestorPaymentDialogComponent } from './investor-payment-dialog.component';

@Component({
  selector: 'app-investor-projects',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, PageHeaderComponent],
  templateUrl: './investor-projects.component.html',
  styleUrl: './investor-projects.component.scss',
})
export class InvestorProjectsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly investorService = inject(InvestorService);
  private readonly projectService = inject(ProjectService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly investorId = this.route.snapshot.paramMap.get('id')!;
  readonly investor = signal<Investor | null>(null);
  readonly projects = signal<Project[]>([]);
  readonly assignments = signal<InvestorProject[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  constructor() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.error.set(false);
    Promise.all([
      this.investorService.getAll().toPromise(),
      this.projectService.getAll().toPromise(),
      this.investorService.getProjects(this.investorId).toPromise(),
    ]).then(([investors, projects, assignments]) => {
      this.investor.set((investors ?? []).find((item) => item._id === this.investorId) ?? null);
      this.projects.set(projects ?? []);
      this.assignments.set(assignments ?? []);
      this.loading.set(false);
    }).catch(() => {
      this.error.set(true);
      this.loading.set(false);
    });
  }

  projectName(assignment: InvestorProject) {
    return typeof assignment.ProjectId === 'string' ? assignment.ProjectId : assignment.ProjectId.Name;
  }

  openCreateDialog() {
    this.dialog.open(InvestorProjectFormDialogComponent, {
      data: { investorId: this.investorId, projects: this.projects() },
      width: '520px',
    }).afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.investorService.createProject(this.investorId, payload).subscribe({
        next: () => { this.snackBar.open('Project assigned', 'Dismiss', { duration: 3000 }); this.refresh(); },
        error: () => this.snackBar.open('Could not assign project', 'Dismiss', { duration: 4000 }),
      });
    });
  }

  openEditDialog(assignment: InvestorProject) {
    this.dialog.open(InvestorProjectFormDialogComponent, {
      data: { investorId: this.investorId, projects: this.projects(), assignment },
      width: '520px',
    }).afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.investorService.updateProject(this.investorId, assignment._id, payload).subscribe({
        next: () => { this.snackBar.open('Assignment updated', 'Dismiss', { duration: 3000 }); this.refresh(); },
        error: () => this.snackBar.open('Could not update assignment', 'Dismiss', { duration: 4000 }),
      });
    });
  }

  openPaymentDialog(assignment: InvestorProject) {
    if (assignment.Due <= 0) {
      this.snackBar.open('This assignment has no remaining due amount', 'Dismiss', { duration: 3000 });
      return;
    }
    this.dialog.open(InvestorPaymentDialogComponent, { data: assignment, width: '480px' }).afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.investorService.createPayment(this.investorId, assignment._id, payload).subscribe({
        next: () => { this.snackBar.open('Payment recorded', 'Dismiss', { duration: 3000 }); this.refresh(); },
        error: () => this.snackBar.open('Could not record payment', 'Dismiss', { duration: 4000 }),
      });
    });
  }

  deleteAssignment(assignment: InvestorProject) {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Remove Project Assignment', message: `Remove "${this.projectName(assignment)}" from this investor?`, confirmLabel: 'Remove', danger: true },
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.investorService.deleteProject(this.investorId, assignment._id).subscribe({
        next: () => { this.snackBar.open('Project assignment removed', 'Dismiss', { duration: 3000 }); this.refresh(); },
        error: () => this.snackBar.open('Could not remove assignment', 'Dismiss', { duration: 4000 }),
      });
    });
  }
}
