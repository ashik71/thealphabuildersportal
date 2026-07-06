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
import { Expense } from '../../interfaces/expense.interface';

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
  readonly expenses = signal<Expense[]>([]);

  readonly commitmentColumns = ['shareholder', 'amount', 'notes', 'actions'];
  readonly paymentColumns = ['shareholder', 'amount', 'date', 'notes', 'actions'];
  readonly expenseColumns = ['category', 'subcategory', 'estimated', 'actual'];
  readonly expenseRowColumns = ['date', 'category', 'subcategory', 'description', 'amount', 'paidTo', 'actions'];

  readonly reportExpenseColumns = ['date', 'category', 'subcategory', 'description', 'amount', 'paidTo'];
  readonly reportCommitmentColumns = ['shareholder', 'amount', 'notes'];
  readonly reportPaymentColumns = ['shareholder', 'amount', 'date', 'notes'];
  readonly shareholderSummaryColumns = ['shareholder', 'committed', 'paid', 'remaining'];

  constructor() {
    this.loadAll();
  }

  private loadAll() {
    this.loading.set(true);
    this.projectService.getById(this.projectId).subscribe((p) => this.project.set(p));
    this.loadReport();
    this.loadFunding();
    this.loadExpenses();
  }

  private loadExpenses() {
    this.expenseService.getByProject(this.projectId).subscribe((e) => this.expenses.set(e));
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

  downloadReport() {
    this.projectService.exportReport(this.projectId).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.project()?.Name || 'project'}_report.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  shareholderName(shareholderId: Commitment['ShareholderId']) {
    if (typeof shareholderId === 'string') return shareholderId;
    return shareholderId?.Name ?? 'Unknown';
  }

  categoryName(categoryId: Expense['CostCategoryId'] | Expense['SubCategoryId']) {
    if (!categoryId) return null;
    if (typeof categoryId === 'string') return categoryId;
    return categoryId.Name ?? 'Unknown';
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
        this.loadExpenses();
      });
    });
  }

  editExpense(expense: Expense) {
    const dialogRef = this.dialog.open(ExpenseFormDialogComponent, { data: { projectId: this.projectId, expense } });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.expenseService.update(expense._id, payload).subscribe(() => {
        this.snackBar.open('Expense updated', 'Dismiss', { duration: 3000 });
        this.loadReport();
        this.loadExpenses();
      });
    });
  }

  deleteExpense(expense: Expense) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Expense', message: 'Remove this expense record?', confirmLabel: 'Delete', danger: true },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.expenseService.delete(expense._id).subscribe(() => {
        this.loadReport();
        this.loadExpenses();
      });
    });
  }
}
