import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../interfaces/project.interface';

@Component({
  selector: 'app-view-link',
  standalone: true,
  imports: [DecimalPipe, DatePipe, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './view-link.component.html',
  styleUrl: './view-link.component.scss',
})
export class ViewLinkComponent {
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly project = signal<Project | null>(null);

  constructor() {
    const token = this.route.snapshot.paramMap.get('token')!;
    this.projectService.getByViewToken(token).subscribe({
      next: (project) => {
        this.project.set(project);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
