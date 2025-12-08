import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { Project } from '../../interfaces/project.interface';

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
    this.ps.getAll().subscribe(p => this.projects = p);
  }

  openDetails(id: string) {
    this.router.navigate(['/projects', id]);
  }

  generateLink(projectId: string) {
    // create view-only link valid for 60 minutes (demo)
    
  }
}
