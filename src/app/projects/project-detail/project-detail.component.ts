import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../services/project.service';
import { FundingService } from '../../services/funding.service';
import { ExpenseService } from '../../services/expense.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CommitmentFormDialogComponent } from '../commitment-form-dialog/commitment-form-dialog.component';
import { PaymentFormDialogComponent } from '../payment-form-dialog/payment-form-dialog.component';
import { ExpenseFormDialogComponent } from '../expense-form-dialog/expense-form-dialog.component';
import { Project, ProjectCostReport } from '../../interfaces/project.interface';
import { Commitment, Payment, ProjectFunding } from '../../interfaces/funding.interface';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PageHeaderComponent,
    StatCardComponent,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent {
  private readonly projectService = inject(ProjectService);
  private readonly fundingService = inject(FundingService);
  private readonly expenseService = inject(ExpenseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly projectId = this.route.snapshot.paramMap.get('id')!;

  readonly loading = signal(true);
  readonly project = signal<Project | null>(null);
  readonly report = signal<ProjectCostReport | null>(null);
  readonly funding = signal<ProjectFunding | null>(null);
  readonly commitments = signal<Commitment[]>([]);
  readonly payments = signal<Payment[]>([]);

  readonly commitmentColumns = ['shareholder', 'amount', 'notes', 'actions'];
  readonly paymentColumns = ['shareholder', 'amount', 'date', 'notes', 'actions'];
  readonly expenseColumns = ['category', 'subcategory', 'estimated', 'actual'];

  constructor() {
    this.loadAll();
  }

  private loadAll() {
    this.loading.set(true);
    this.projectService.getById(this.projectId).subscribe((p) => this.project.set(p));
    this.loadReport();
    this.loadFunding();
  }

  private loadReport() {
    this.projectService.getProjectReport(this.projectId).subscribe({
      next: (res) => {
        this.report.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadFunding() {
    this.fundingService.getCommitmentsByProject(this.projectId).subscribe((c) => this.commitments.set(c));
    this.fundingService.getPaymentsByProject(this.projectId).subscribe((p) => this.payments.set(p));
    this.projectService.getProjectFunding(this.projectId).subscribe((f) => this.funding.set(f));
  }

  back() {
    this.router.navigate(['/admin/projects']);
  }

  shareholderName(shareholderId: Commitment['ShareholderId']) {
    if (typeof shareholderId === 'string') return shareholderId;
    return shareholderId?.Name ?? 'Unknown';
  }

  addCommitment() {
    const dialogRef = this.dialog.open(CommitmentFormDialogComponent, { data: { projectId: this.projectId } });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.fundingService.createCommitment(payload).subscribe(() => {
        this.snackBar.open('Commitment added', 'Dismiss', { duration: 3000 });
        this.loadFunding();
      });
    });
  }

  deleteCommitment(commitment: Commitment) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Commitment', message: 'Remove this shareholder commitment?', confirmLabel: 'Delete', danger: true },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.fundingService.deleteCommitment(commitment._id).subscribe(() => this.loadFunding());
    });
  }

  addPayment() {
    const dialogRef = this.dialog.open(PaymentFormDialogComponent, { data: { projectId: this.projectId } });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.fundingService.createPayment(payload).subscribe(() => {
        this.snackBar.open('Payment recorded', 'Dismiss', { duration: 3000 });
        this.loadFunding();
      });
    });
  }

  deletePayment(payment: Payment) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Payment', message: 'Remove this payment record?', confirmLabel: 'Delete', danger: true },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.fundingService.deletePayment(payment._id).subscribe(() => this.loadFunding());
    });
  }

  addExpense() {
    const dialogRef = this.dialog.open(ExpenseFormDialogComponent, { data: { projectId: this.projectId } });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.expenseService.create(payload).subscribe(() => {
        this.snackBar.open('Expense added', 'Dismiss', { duration: 3000 });
        this.loadReport();
      });
    });
  }
}
