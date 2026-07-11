import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ProjectService } from '../../services/project.service';
import { ProjectPublicView } from '../../interfaces/project.interface';

@Component({
  selector: 'app-view-link',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  templateUrl: './view-link.component.html',
  styleUrl: './view-link.component.scss',
})
export class ViewLinkComponent {
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly errorStatus = signal<number | null>(null);
  readonly project = signal<ProjectPublicView | null>(null);

  readonly costPercent = computed(() => {
    const p = this.project();
    if (!p || p.EstimatedCost <= 0) return 0;
    return Math.min(100, Math.round((p.ActualCost / p.EstimatedCost) * 100));
  });

  readonly isOverBudget = computed(() => {
    const p = this.project();
    return !!p && p.ActualCost > p.EstimatedCost;
  });

  readonly fundingPercent = computed(() => {
    const f = this.project()?.Funding;
    if (!f || f.Committed <= 0) return 0;
    return Math.min(100, Math.round((f.Paid / f.Committed) * 100));
  });

  constructor() {
    const token = this.route.snapshot.paramMap.get('token')!;
    this.projectService.getByViewToken(token).subscribe({
      next: (project) => {
        this.project.set(project);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorStatus.set(err?.status ?? null);
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
