import { Component, OnInit } from '@angular/core';
import { Project, ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  latestLink: string | null = null;

  constructor(private ps: ProjectService, private router: Router) {}

  ngOnInit() { this.refresh(); }

  refresh() {
    this.ps.listProjects().subscribe(p => this.projects = p);
  }

  openDetails(id: string) {
    this.router.navigate(['/projects', id]);
  }

  generateLink(projectId: string) {
    // create view-only link valid for 60 minutes (demo)
    this.ps.createViewOnlyLink(projectId, 60).subscribe(res => {
      this.latestLink = res.url;
      alert('Link generated (demo). Copy and send to customer.');
    });
  }
}
