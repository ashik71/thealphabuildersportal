import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Project, ProjectInput, ProjectStatus } from '../../interfaces/project.interface';

export interface ProjectFormDialogData {
  project?: Project;
}

@Component({
  selector: 'app-project-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './project-form-dialog.component.html',
  styleUrl: './project-form-dialog.component.scss',
})
export class ProjectFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ProjectFormDialogComponent>);
  readonly data = inject<ProjectFormDialogData>(MAT_DIALOG_DATA);

  readonly statuses: ProjectStatus[] = ['planned', 'in-progress', 'completed', 'on-hold'];
  readonly isEdit = !!this.data?.project;

  readonly form = this.fb.nonNullable.group({
    Name: [this.data?.project?.Name ?? '', Validators.required],
    Location: [this.data?.project?.Location ?? ''],
    Summary: [this.data?.project?.Summary ?? ''],
    EstimatedCost: [this.data?.project?.EstimatedCost ?? 0, [Validators.required, Validators.min(0)]],
    StartDate: [this.data?.project?.StartDate ? new Date(this.data.project.StartDate) : null],
    EndDate: [this.data?.project?.EndDate ? new Date(this.data.project.EndDate) : null],
    Status: [this.data?.project?.Status ?? ('planned' as ProjectStatus), Validators.required],
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: ProjectInput = {
      ...raw,
      StartDate: raw.StartDate ? new Date(raw.StartDate).toISOString() : undefined,
      EndDate: raw.EndDate ? new Date(raw.EndDate).toISOString() : undefined,
    };

    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close();
  }
}
