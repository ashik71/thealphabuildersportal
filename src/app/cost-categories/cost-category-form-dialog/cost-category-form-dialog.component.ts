import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CostCategory, CostCategoryInput } from '../../interfaces/expense.interface';

export interface CostCategoryFormDialogData {
  category?: CostCategory;
  parentId?: string;
  hasChildren?: boolean;
  topLevelCategories: CostCategory[];
}

@Component({
  selector: 'app-cost-category-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './cost-category-form-dialog.component.html',
})
export class CostCategoryFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CostCategoryFormDialogComponent>);
  readonly data = inject<CostCategoryFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data?.category;
  readonly isNewSubCategory = !this.isEdit && !!this.data?.parentId;
  readonly lockParent = this.isEdit && !!this.data?.hasChildren;

  readonly parentOptions = this.data.topLevelCategories.filter((c) => c._id !== this.data.category?._id);

  readonly form = this.fb.nonNullable.group({
    Name: [this.data?.category?.Name ?? '', Validators.required],
    ParentCategoryId: [{ value: this.data?.category?.ParentCategoryId ?? this.data?.parentId ?? '', disabled: this.lockParent }],
    Description: [this.data?.category?.Description ?? ''],
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: CostCategoryInput = {
      Name: raw.Name,
      ParentCategoryId: raw.ParentCategoryId || null,
      Description: raw.Description,
    };
    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close();
  }
}
