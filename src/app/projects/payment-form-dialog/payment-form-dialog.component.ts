import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ShareholderService } from '../../services/shareholder.service';
import { Shareholder } from '../../interfaces/shareholder.interface';
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
  readonly data = inject<PaymentFormDialogData>(MAT_DIALOG_DATA);

  readonly shareholders = toSignal(this.shareholderService.getAll(), { initialValue: [] as Shareholder[] });

  readonly form = this.fb.nonNullable.group({
    ShareholderId: ['', Validators.required],
    AmountPaid: [0, [Validators.required, Validators.min(1)]],
    Notes: [''],
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: PaymentInput = { ProjectId: this.data.projectId, ...this.form.getRawValue() };
    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close();
  }
}
