import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ExpenseService } from '../../services/expense.service';
import { CostCategory } from '../../interfaces/expense.interface';
import { ExpenseInput } from '../../interfaces/expense.interface';

export interface ExpenseFormDialogData {
  projectId: string;
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
  readonly data = inject<ExpenseFormDialogData>(MAT_DIALOG_DATA);

  readonly categories = toSignal(this.expenseService.getAllCategories(), { initialValue: [] as CostCategory[] });

  readonly form = this.fb.nonNullable.group({
    CostCategoryId: ['', Validators.required],
    Description: [''],
    Amount: [0, [Validators.required, Validators.min(1)]],
    PaidTo: [''],
    Notes: [''],
  });

  topLevelCategories() {
    return this.categories().filter((c) => !c.ParentCategoryId);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: ExpenseInput = { ProjectId: this.data.projectId, ...this.form.getRawValue() };
    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close();
  }
}
