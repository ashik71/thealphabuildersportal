import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Shareholder, ShareholderInput } from '../../interfaces/shareholder.interface';

export interface ShareholderFormDialogData {
  shareholder?: Shareholder;
}

@Component({
  selector: 'app-shareholder-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './shareholder-form-dialog.component.html',
})
export class ShareholderFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ShareholderFormDialogComponent>);
  readonly data = inject<ShareholderFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data?.shareholder;

  readonly form = this.fb.nonNullable.group({
    Name: [this.data?.shareholder?.Name ?? '', Validators.required],
    Phone: [this.data?.shareholder?.Phone ?? ''],
    Email: [this.data?.shareholder?.Email ?? '', Validators.email],
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: ShareholderInput = this.form.getRawValue();
    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close();
  }
}
