import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ExpenseService } from '../../services/expense.service';
import { CostCategoryService } from '../../services/cost-category.service';
import { CostCategory, Expense } from '../../interfaces/expense.interface';
import { ExpenseInput } from '../../interfaces/expense.interface';

export interface ExpenseFormDialogData {
  projectId: string;
  expense?: Expense;
}

@Component({
  selector: 'app-expense-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './expense-form-dialog.component.html',
})
export class ExpenseFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ExpenseFormDialogComponent>);
  private readonly expenseService = inject(ExpenseService);
  private readonly costCategoryService = inject(CostCategoryService);
  readonly data = inject<ExpenseFormDialogData>(MAT_DIALOG_DATA);

  readonly categories = toSignal(this.costCategoryService.getAll(), { initialValue: [] as CostCategory[] });

  readonly form = this.fb.nonNullable.group({
    CostCategoryId: ['', Validators.required],
    SubCategoryId: [''],
    Description: [''],
    Amount: [0, [Validators.required, Validators.min(1)]],
    PaidTo: [''],
    Notes: [''],
  });

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
    const payload: ExpenseInput = { ProjectId: this.data.projectId, ...raw, SubCategoryId: raw.SubCategoryId || null };
    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close();
  }
}
