import { Component, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShareholderService } from '../../services/shareholder.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ShareholderFormDialogComponent } from '../shareholder-form-dialog/shareholder-form-dialog.component';
import { Shareholder } from '../../interfaces/shareholder.interface';

@Component({
  selector: 'app-shareholder-list',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, PageHeaderComponent],
  templateUrl: './shareholder-list.component.html',
  styleUrl: './shareholder-list.component.scss',
})
export class ShareholderListComponent {
  private readonly shareholderService = inject(ShareholderService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['Name', 'Phone', 'Email', 'actions'];
  readonly loading = signal(true);
  readonly shareholders = signal<Shareholder[]>([]);

  constructor() {
    this.refresh();
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
