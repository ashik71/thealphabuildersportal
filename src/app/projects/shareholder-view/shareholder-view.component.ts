import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FundingService } from '../../services/funding.service';
import { ShareholderView } from '../../interfaces/funding.interface';

@Component({
  selector: 'app-shareholder-view',
  standalone: true,
  imports: [
    DecimalPipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  templateUrl: './shareholder-view.component.html',
  styleUrl: './shareholder-view.component.scss',
})
export class ShareholderViewComponent {
  private readonly fundingService = inject(FundingService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly token = this.route.snapshot.paramMap.get('token')!;

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly errorStatus = signal<number | null>(null);
  readonly data = signal<ShareholderView | null>(null);
  readonly downloading = signal(false);

  readonly paidPercent = computed(() => {
    const d = this.data();
    if (!d || d.Committed <= 0) return 0;
    return Math.min(100, Math.round((d.Paid / d.Committed) * 100));
  });

  readonly isOverpaid = computed(() => (this.data()?.Remaining ?? 0) < 0);

  constructor() {
    this.fundingService.getByShareholderViewToken(this.token).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorStatus.set(err?.status ?? null);
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  downloadReport() {
    this.downloading.set(true);
    this.fundingService.downloadShareholderReport(this.token).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const projectName = this.data()?.ProjectName || 'project';
        const shareholderName = this.data()?.ShareholderName || 'shareholder';
        a.download = `${projectName}_${shareholderName}_report.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => {
        this.downloading.set(false);
        this.snackBar.open('Failed to download report', 'Dismiss', { duration: 3000 });
      },
    });
  }
}
