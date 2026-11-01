import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Investor, InvestorInput } from '../../interfaces/investor.interface';

@Component({
  selector: 'app-investor-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './investor-form-dialog.component.html',
})
export class InvestorFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<InvestorFormDialogComponent>);
  readonly investor = inject<{ investor?: Investor }>(MAT_DIALOG_DATA)?.investor;
  readonly isEdit = !!this.investor;
  readonly form = this.fb.nonNullable.group({
    Name: [this.investor?.Name ?? '', Validators.required],
    Email: [this.investor?.Email ?? '', [Validators.email]],
    Phone: [this.investor?.Phone ?? '', [Validators.required, Validators.minLength(7)]],
    InvestmentAmount: [this.investor?.InvestmentAmount ?? 0, [Validators.required, Validators.min(0)]],
    Status: [this.investor?.Status ?? 'active', Validators.required],
  });

  save() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.dialogRef.close(this.form.getRawValue() as InvestorInput);
  }
  cancel() { this.dialogRef.close(); }
}
