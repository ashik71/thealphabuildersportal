import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvestorService } from '../../services/investor.service';
import { Investor } from '../../interfaces/investor.interface';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { InvestorFormDialogComponent } from './investor-form-dialog.component';

@Component({
  selector: 'app-investor-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatTooltipModule, DecimalPipe, PageHeaderComponent],
  templateUrl: './investor-list.component.html',
  styleUrl: './investor-list.component.scss',
})
export class InvestorListComponent {
  private readonly service = inject(InvestorService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly investors = signal<Investor[]>([]);
  readonly filter = signal('');
  readonly filteredInvestors = computed(() => {
    const query = this.filter().trim().toLowerCase();
    return query ? this.investors().filter((i) => `${i.Name} ${i.Email} ${i.Phone}`.toLowerCase().includes(query)) : this.investors();
  });

  constructor() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.error.set(false);
    this.service.getAll().subscribe({
      next: (investors) => { this.investors.set(investors); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }
  openCreateDialog() {
    this.dialog.open(InvestorFormDialogComponent, { data: {} }).afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.service.create(payload).subscribe({
        next: () => { this.snackBar.open('Investor created', 'Dismiss', { duration: 3000 }); this.refresh(); },
        error: () => this.snackBar.open('Could not create investor', 'Dismiss', { duration: 4000 }),
      });
    });
  }
  openEditDialog(investor: Investor) {
    this.dialog.open(InvestorFormDialogComponent, { data: { investor } }).afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.service.update(investor._id, payload).subscribe({
        next: () => { this.snackBar.open('Investor updated', 'Dismiss', { duration: 3000 }); this.refresh(); },
        error: () => this.snackBar.open('Could not update investor', 'Dismiss', { duration: 4000 }),
      });
    });
  }
  deleteInvestor(investor: Investor) {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Investor', message: `Delete "${investor.Name}"? This cannot be undone.`, confirmLabel: 'Delete', danger: true },
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.service.delete(investor._id).subscribe({
        next: () => { this.snackBar.open('Investor deleted', 'Dismiss', { duration: 3000 }); this.refresh(); },
        error: () => this.snackBar.open('Could not delete investor', 'Dismiss', { duration: 4000 }),
      });
    });
  }
}
