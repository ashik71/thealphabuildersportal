import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ExpenseService } from '../../services/expense.service';
import { CostCategoryService } from '../../services/cost-category.service';
import { CostCategory, Expense } from '../../interfaces/expense.interface';
import { ExpenseInput } from '../../interfaces/expense.interface';

export interface ExpenseFormDialogData {
  projectId: string;
  expense?: Expense;
  /** Shareholders currently committed to this project — the split's denominator. */
  shareholderCount?: number;
}

@Component({
  selector: 'app-expense-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    DecimalPipe,
  ],
  templateUrl: './expense-form-dialog.component.html',
  styleUrl: './expense-form-dialog.component.scss',
})
export class ExpenseFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ExpenseFormDialogComponent>);
  private readonly expenseService = inject(ExpenseService);
  private readonly costCategoryService = inject(CostCategoryService);
  readonly data = inject<ExpenseFormDialogData>(MAT_DIALOG_DATA);

  readonly categories = toSignal(this.costCategoryService.getAll(), { initialValue: [] as CostCategory[] });

  /** Splitting only makes sense when creating a new expense with shareholders on the project. */
  readonly canSplit = !this.data.expense && (this.data.shareholderCount ?? 0) > 0;

  readonly form = this.fb.nonNullable.group({
    CostCategoryId: ['', Validators.required],
    SubCategoryId: [''],
    Description: [''],
    Amount: [0, [Validators.required, Validators.min(1)]],
    PaidTo: [''],
    Notes: [''],
    SplitAmongShareholders: [false],
    MarkSharesPaid: [false],
  });

  private readonly amountChanges = toSignal(this.form.controls.Amount.valueChanges, {
    initialValue: this.form.controls.Amount.value,
  });

  /** Each shareholder's equal slice, for the toggle's live preview. Mirrors the
   * backend's splitEqually (2-decimal, remainder-first) closely enough for
   * display — the server computes the values actually persisted. */
  readonly perShareholderAmount = () => {
    const count = this.data.shareholderCount ?? 0;
    if (count === 0) return 0;
    return Math.floor((this.amountChanges() / count) * 100) / 100;
  };

  constructor() {
    const expense = this.data.expense;
    if (expense) {
      this.form.patchValue({
        CostCategoryId: typeof expense.CostCategoryId === 'string' ? expense.CostCategoryId : expense.CostCategoryId._id,
        SubCategoryId:
          (typeof expense.SubCategoryId === 'string' ? expense.SubCategoryId : expense.SubCategoryId?._id) ?? '',
        Description: expense.Description ?? '',
        Amount: expense.Amount,
        PaidTo: expense.PaidTo ?? '',
        Notes: expense.Notes ?? '',
      });
    }
  }

  topLevelCategories() {
    return this.categories().filter((c) => !c.ParentCategoryId);
  }

  subcategoryOptions() {
    const parentId = this.form.controls.CostCategoryId.value;
    if (!parentId) return [];
    return this.categories().filter((c) => c.ParentCategoryId === parentId);
  }

  onCategoryChange() {
    this.form.controls.SubCategoryId.setValue('');
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: ExpenseInput = {
      ProjectId: this.data.projectId,
      ...raw,
      SubCategoryId: raw.SubCategoryId || null,
      SplitAmongShareholders: this.canSplit && raw.SplitAmongShareholders,
      MarkSharesPaid: this.canSplit && raw.SplitAmongShareholders && raw.MarkSharesPaid,
    };
    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close();
  }
}
