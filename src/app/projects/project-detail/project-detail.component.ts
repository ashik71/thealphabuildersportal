import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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

type DetailTab = 'cost' | 'expenses' | 'funding';

interface SubcategorySpend {
  name: string;
  amount: number;
}

interface CategorySpend {
  categoryId: string;
  name: string;
  amount: number;
  /** Share of this project's total actual spend, 0-100. */
  pct: number;
  /** Subcategories under this category, same-named ones merged and summed
   *  — the backend keys breakdown rows by subcategory _id, so two
   *  differently-created "Cement" records would otherwise show up as two
   *  separate lines instead of one. */
  subcategories: SubcategorySpend[];
}

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
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

  readonly activeTab = signal<DetailTab>('cost');

  /**
   * Where the money went, grouped at the level that's actually meaningful:
   * top-level category. There is no per-category budget in this product —
   * only a single estimate for the whole project — so this compares
   * categories to each other by actual spend, not to a budget that doesn't
   * exist. Subcategories are rolled up under their parent and merged by
   * name, so a subcategory that got created twice under the same name
   * (a data-entry duplicate, not a real second line item) reads as one row
   * with a combined total instead of two separate, misleadingly-equal bars.
   */
  readonly categorySpend = computed<CategorySpend[]>(() => {
    const breakdown = this.report()?.Breakdown ?? [];

    const byCategory = new Map<string, { name: string; amount: number; subMap: Map<string, number> }>();
    for (const item of breakdown) {
      const amount = item.ActualCost || 0;
      let group = byCategory.get(item.CategoryId);
      if (!group) {
        group = { name: item.CategoryName, amount: 0, subMap: new Map() };
        byCategory.set(item.CategoryId, group);
      }
      group.amount += amount;
      if (item.SubcategoryName) {
        group.subMap.set(item.SubcategoryName, (group.subMap.get(item.SubcategoryName) || 0) + amount);
      }
    }

    const total = [...byCategory.values()].reduce((sum, g) => sum + g.amount, 0);

    return [...byCategory.entries()]
      .map(([categoryId, group]) => ({
        categoryId,
        name: group.name,
        amount: group.amount,
        pct: total > 0 ? (group.amount / total) * 100 : 0,
        subcategories: [...group.subMap.entries()]
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount),
      }))
      .sort((a, b) => b.amount - a.amount);
  });

  readonly fundingProgressPct = computed(() => {
    const f = this.funding();
    if (!f || f.Totals.Committed <= 0) return 0;
    return Math.min(100, Math.round((f.Totals.Paid / f.Totals.Committed) * 1000) / 10);
  });

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
    const dialogRef = this.dialog.open(ExpenseFormDialogComponent, {
      data: { projectId: this.projectId, shareholderCount: this.commitments().length },
    });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.expenseService.create(payload).subscribe(() => {
        this.snackBar.open('Expense added', 'Dismiss', { duration: 3000 });
        this.loadReport();
        this.loadExpenses();
        if (payload.SplitAmongShareholders) {
          this.loadFunding();
        }
      });
    });
  }

  editExpense(expense: Expense) {
    const dialogRef = this.dialog.open(ExpenseFormDialogComponent, {
      data: { projectId: this.projectId, expense, shareholderCount: this.commitments().length },
    });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.expenseService.update(expense._id, payload).subscribe(() => {
        this.snackBar.open('Expense updated', 'Dismiss', { duration: 3000 });
        this.loadReport();
        this.loadExpenses();
        if (payload.SplitAmongShareholders || expense.HasShares) {
          this.loadFunding();
        }
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
        if (expense.HasShares) {
          this.loadFunding();
        }
      });
    });
  }
}
