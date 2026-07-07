import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ShareholderService } from '../../services/shareholder.service';
import { CostCategoryService } from '../../services/cost-category.service';
import { Shareholder } from '../../interfaces/shareholder.interface';
import { CostCategory } from '../../interfaces/expense.interface';
import { PaymentInput } from '../../interfaces/funding.interface';

export interface PaymentFormDialogData {
  projectId: string;
}

@Component({
  selector: 'app-payment-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './payment-form-dialog.component.html',
})
export class PaymentFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PaymentFormDialogComponent>);
  private readonly shareholderService = inject(ShareholderService);
  private readonly costCategoryService = inject(CostCategoryService);
  readonly data = inject<PaymentFormDialogData>(MAT_DIALOG_DATA);

  readonly shareholders = toSignal(this.shareholderService.getAll(), { initialValue: [] as Shareholder[] });
  readonly categories = toSignal(this.costCategoryService.getAll(), { initialValue: [] as CostCategory[] });

  readonly form = this.fb.nonNullable.group({
    ShareholderId: ['', Validators.required],
    CostCategoryId: [''],
    SubCategoryId: [''],
    AmountPaid: [0, [Validators.required, Validators.min(1)]],
    Notes: [''],
  });

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
    const payload: PaymentInput = {
      ProjectId: this.data.projectId,
      ...raw,
      CostCategoryId: raw.CostCategoryId || null,
      SubCategoryId: raw.SubCategoryId || null,
    };
    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close();
  }
}
