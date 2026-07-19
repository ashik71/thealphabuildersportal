import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { PortalService } from '../../services/portal.service';
import { PortalProjectDetail } from '../../interfaces/portal.interface';

@Component({
  selector: 'app-portal-project-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './portal-project-detail.component.html',
  styleUrl: './portal-project-detail.component.scss',
})
export class PortalProjectDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly portal = inject(PortalService);

  readonly loading = signal(true);
  /**
   * The API returns 404 both for a project that does not exist and for one
   * this shareholder has no commitment on — it does not distinguish, so
   * neither does this page.
   */
  readonly notFound = signal(false);
  readonly project = signal<PortalProjectDetail | null>(null);

  readonly displayedColumns = ['Date', 'Category', 'Notes', 'Amount'];

  constructor() {
    const projectId = this.route.snapshot.paramMap.get('projectId') ?? '';

    this.portal
      .getProject(projectId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (detail) => this.project.set(detail),
        error: () => this.notFound.set(true),
      });
  }

  progress() {
    const p = this.project();
    if (!p?.Committed) return 0;
    return Math.min(100, Math.round((p.Paid / p.Committed) * 100));
  }

  statusLabel(status: string) {
    return status.replace('-', ' ');
  }

  categoryLabel(categoryName: string | null, subCategoryName: string | null) {
    if (!categoryName) return 'Uncategorised';
    return subCategoryName ? `${categoryName} › ${subCategoryName}` : categoryName;
  }
}
