import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { InvestorPaymentInput, InvestorPaymentMethod, InvestorProject } from '../../interfaces/investor.interface';

@Component({
  selector: 'app-investor-payment-dialog',
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './investor-payment-dialog.component.html',
})
export class InvestorPaymentDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<InvestorPaymentDialogComponent>);
  readonly assignment = inject<InvestorProject>(MAT_DIALOG_DATA);
  readonly form = this.fb.nonNullable.group({
    Amount: [0, [Validators.required, Validators.min(0.01), Validators.max(this.assignment.Due)]],
    PaymentMethod: ['Bank' as InvestorPaymentMethod, Validators.required],
    Notes: [''],
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue() as InvestorPaymentInput);
  }

  cancel() {
    this.dialogRef.close();
  }
}
