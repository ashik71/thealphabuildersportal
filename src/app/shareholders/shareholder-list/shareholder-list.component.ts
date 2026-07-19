import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShareholderService } from '../../services/shareholder.service';
import { ProjectService } from '../../services/project.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ShareholderFormDialogComponent } from '../shareholder-form-dialog/shareholder-form-dialog.component';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';
import { Shareholder, ShareholderProject } from '../../interfaces/shareholder.interface';
import { Project } from '../../interfaces/project.interface';

@Component({
  selector: 'app-shareholder-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PageHeaderComponent,
  ],
  templateUrl: './shareholder-list.component.html',
  styleUrl: './shareholder-list.component.scss',
})
export class ShareholderListComponent {
  private readonly shareholderService = inject(ShareholderService);
  private readonly projectService = inject(ProjectService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['Name', 'Phone', 'Email', 'Projects', 'actions'];
  readonly loading = signal(true);
  readonly shareholders = signal<Shareholder[]>([]);
  readonly projectFilter = signal('');

  readonly projects = toSignal(this.projectService.getAll(), { initialValue: [] as Project[] });

  readonly filteredShareholders = computed(() => {
    const projectId = this.projectFilter();
    const list = this.shareholders();
    if (!projectId) return list;
    return list.filter((s) => (s.Projects ?? []).some((p) => p.ProjectId === projectId));
  });

  constructor() {
    this.refresh();
  }

  extraProjectNames(projects: ShareholderProject[]) {
    return projects
      .slice(1)
      .map((p) => p.ProjectName)
      .join(', ');
  }

  refresh() {
    this.loading.set(true);
    this.shareholderService.getAll().subscribe({
      next: (list) => {
        this.shareholders.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(ShareholderFormDialogComponent, { data: {} });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.shareholderService.create(payload).subscribe(() => {
        this.snackBar.open('Shareholder created', 'Dismiss', { duration: 3000 });
        this.refresh();
      });
    });
  }

  openEditDialog(shareholder: Shareholder) {
    const dialogRef = this.dialog.open(ShareholderFormDialogComponent, { data: { shareholder } });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.shareholderService.update(shareholder._id, payload).subscribe(() => {
        this.snackBar.open('Shareholder updated', 'Dismiss', { duration: 3000 });
        this.refresh();
      });
    });
  }

  /**
   * A portal account is keyed to the shareholder's email address, so there is
   * nothing to invite without one.
   */
  canInvite(shareholder: Shareholder) {
    return !!shareholder.Email;
  }

  openInviteDialog(shareholder: Shareholder) {
    if (!this.canInvite(shareholder)) {
      this.snackBar.open('Add an email address for this shareholder first', 'Dismiss', {
        duration: 4000,
      });
      return;
    }
    this.dialog.open(InviteDialogComponent, { data: { shareholder }, width: '520px' });
  }

  deleteShareholder(shareholder: Shareholder) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Shareholder',
        message: `Delete "${shareholder.Name}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        danger: true,
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.shareholderService.delete(shareholder._id).subscribe(() => {
        this.snackBar.open('Shareholder deleted', 'Dismiss', { duration: 3000 });
        this.refresh();
      });
    });
  }
}
