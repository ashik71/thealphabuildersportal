import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { InvitationService } from '../../services/invitation.service';
import { InviteExpiryHours } from '../../interfaces/invitation.interface';
import { Shareholder } from '../../interfaces/shareholder.interface';

export interface InviteDialogData {
  shareholder: Shareholder;
}

@Component({
  selector: 'app-invite-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  templateUrl: './invite-dialog.component.html',
  styleUrl: './invite-dialog.component.scss',
})
export class InviteDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly invitations = inject(InvitationService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<InviteDialogComponent>);
  readonly data = inject<InviteDialogData>(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly inviteUrl = signal('');
  readonly emailSent = signal(false);
  readonly expiresAt = signal('');
  readonly copied = signal(false);

  readonly expiryOptions: InviteExpiryHours[] = [24, 48, 72];

  readonly form = this.fb.nonNullable.group({
    expiryHours: [48 as InviteExpiryHours],
  });

  send() {
    this.errorMessage.set('');
    this.loading.set(true);

    this.invitations
      .create(this.data.shareholder._id, this.form.getRawValue().expiryHours)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result) => {
          this.inviteUrl.set(result.inviteUrl);
          this.emailSent.set(result.emailSent);
          this.expiresAt.set(result.expiresAt);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message ?? 'Could not create the invitation.');
        },
      });
  }

  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.inviteUrl());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Clipboard access is denied outside a secure context; the link is
      // on screen and selectable, so this is not worth failing over.
      this.snackBar.open('Could not copy automatically — select the link and copy it', 'Dismiss', {
        duration: 4000,
      });
    }
  }

  close() {
    this.dialogRef.close(this.inviteUrl() ? 'sent' : undefined);
  }
}
