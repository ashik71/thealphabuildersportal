import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Project } from '../../interfaces/project.interface';
import {
  InvestorProject,
  InvestorProjectInput,
  InvestorProjectStatus,
} from '../../interfaces/investor.interface';

interface DialogData {
  investorId: string;
  projects: Project[];
  assignment?: InvestorProject;
}

@Component({
  selector: 'app-investor-project-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
  ],
  templateUrl: './investor-project-form-dialog.component.html',
})
export class InvestorProjectFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<InvestorProjectFormDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly assignment = this.data.assignment;
  readonly isEdit = !!this.assignment;

  readonly form = this.fb.nonNullable.group({
    ProjectId: [this.projectId(this.assignment?.ProjectId) ?? '', Validators.required],
    Amount: [this.assignment?.Amount ?? 0, [Validators.required, Validators.min(0)]],
    DurationMonths: [this.assignment?.DurationMonths ?? 1, [Validators.required, Validators.min(1)]],
    ProfitMargin: [this.assignment?.ProfitMargin ?? 0, [Validators.required, Validators.min(0)]],
    Deadline: [this.assignment?.Deadline ? new Date(this.assignment.Deadline) : null, Validators.required],
    Notes: [this.assignment?.Notes ?? ''],
    Status: [this.assignment?.Status ?? ('pending' as InvestorProjectStatus), Validators.required],
  });

  private projectId(project: InvestorProject['ProjectId'] | undefined) {
    return typeof project === 'string' ? project : project?._id;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: InvestorProjectInput = {
      InvestorId: this.data.investorId,
      ...raw,
      Deadline: raw.Deadline ? raw.Deadline.toISOString() : '',
    };
    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close();
  }
}
