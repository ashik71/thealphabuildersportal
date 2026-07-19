import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { InvitationService } from '../../services/invitation.service';
import { AuthService } from '../../services/auth.service';

/** Both password fields must agree before the form can be submitted. */
const passwordsMatch = (group: AbstractControl) =>
  group.get('password')?.value === group.get('confirmPassword')?.value
    ? null
    : { mismatch: true };

@Component({
  selector: 'app-accept-invite',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './accept-invite.component.html',
  styleUrl: './accept-invite.component.scss',
})
export class AcceptInviteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invitations = inject(InvitationService);
  private readonly auth = inject(AuthService);

  private readonly token = this.route.snapshot.paramMap.get('token') ?? '';

  readonly checking = signal(true);
  readonly submitting = signal(false);
  readonly invalidInvite = signal(false);
  readonly errorMessage = signal('');
  readonly shareholderName = signal('');
  readonly email = signal('');
  readonly hidePassword = signal(true);

  readonly form = this.fb.nonNullable.group(
    {
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch }
  );

  constructor() {
    // Any signed-in session belongs to someone else — accepting an invitation
    // creates a different account, so clear it to avoid mixing the two.
    this.auth.logout();
    this.loadInvitation();
  }

  private loadInvitation() {
    this.invitations
      .preview(this.token)
      .pipe(finalize(() => this.checking.set(false)))
      .subscribe({
        next: (invite) => {
          this.shareholderName.set(invite.shareholderName ?? '');
          this.email.set(invite.email);
          this.form.patchValue({ name: invite.shareholderName ?? '' });
        },
        error: () => this.invalidInvite.set(true),
      });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.submitting.set(true);
    const { name, password } = this.form.getRawValue();

    this.invitations
      .accept(this.token, name, password)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          // Sign in with the credentials just set, rather than auto-issuing a
          // session from the accept response — one code path for logging in.
          this.auth.login(this.email(), password).subscribe({
            next: () => this.router.navigate([this.auth.homeRoute()]),
            error: () => this.router.navigate(['/login']),
          });
        },
        error: (err) => {
          if (err.status === 404) {
            this.invalidInvite.set(true);
            return;
          }
          this.errorMessage.set(err.error?.message ?? 'Could not create your account.');
        },
      });
  }
}
