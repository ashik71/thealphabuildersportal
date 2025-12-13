import { Component } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent {
  projectId!: string;
  report: any;
  loading = true;

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id')!;
    this.loadReport();
  }

  loadReport() {
    this.projectService.getProjectReport(this.projectId).subscribe({
      next: (res) => {
        this.report = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }
  back(){
    this.router.navigate(['/projects']);
  }
}
