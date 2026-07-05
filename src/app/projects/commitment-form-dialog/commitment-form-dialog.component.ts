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
import { CommitmentInput } from '../../interfaces/funding.interface';

export interface CommitmentFormDialogData {
  projectId: string;
}

@Component({
  selector: 'app-commitment-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './commitment-form-dialog.component.html',
})
export class CommitmentFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CommitmentFormDialogComponent>);
  private readonly shareholderService = inject(ShareholderService);
  readonly data = inject<CommitmentFormDialogData>(MAT_DIALOG_DATA);

  readonly shareholders = toSignal(this.shareholderService.getAll(), { initialValue: [] as Shareholder[] });

  readonly form = this.fb.nonNullable.group({
    ShareholderId: ['', Validators.required],
    CommittedAmount: [0, [Validators.required, Validators.min(1)]],
    Notes: [''],
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: CommitmentInput = { ProjectId: this.data.projectId, ...this.form.getRawValue() };
    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close();
  }
}
