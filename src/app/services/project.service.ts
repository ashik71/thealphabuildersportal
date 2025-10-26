import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Observable, of } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  location: string;
  summary: string;
  costEstimate: number;
  createdAt: string;
}

export interface ViewToken {
  token: string;
  projectId: string;
  expiresAt: number; // epoch ms
  readonly: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private projects: Project[] = [
    { id: 'p1', name: 'Sunshine Heights', location: 'Dhaka', summary: 'Residential complex', costEstimate: 50000000, createdAt: new Date().toISOString() },
    { id: 'p2', name: 'Riverfront Plaza', location: 'Chittagong', summary: 'Commercial building', costEstimate: 120000000, createdAt: new Date().toISOString() },
  ];

  // in-memory token store (demo)
  private tokens: ViewToken[] = [];

  listProjects(): Observable<Project[]> {
    return of(this.projects);
  }

  getProject(id: string): Observable<Project | undefined> {
    return of(this.projects.find(p => p.id === id));
  }

  // admin creates a time-limited view-only link
  createViewOnlyLink(projectId: string, expiresInMinutes = 60): Observable<{ url: string; token: ViewToken }> {
    const token = uuidv4();
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
    const vt: ViewToken = { token, projectId, expiresAt, readonly: true };
    this.tokens.push(vt);

    const url = `${window.location.origin}/view/${token}`;
    return of({ url, token: vt });
  }

  // validate token and return associated project if valid
  validateToken(token: string): Observable<{ valid: boolean; project?: Project; reason?: string }> {
    const t = this.tokens.find(x => x.token === token);
    if (!t) return of({ valid: false, reason: 'Invalid link' });

    if (Date.now() > t.expiresAt) {
      return of({ valid: false, reason: 'Link expired' });
    }

    const proj = this.projects.find(p => p.id === t.projectId);
    if (!proj) return of({ valid: false, reason: 'Project not found' });

    return of({ valid: true, project: proj });
  }

  // Admin-only: (demo) add project
  addProject(p: Partial<Project>): Observable<Project> {
    const proj: Project = {
      id: 'p' + (this.projects.length + 1),
      name: p.name || 'New Project',
      location: p.location || '',
      summary: p.summary || '',
      costEstimate: p.costEstimate || 0,
      createdAt: new Date().toISOString()
    };
    this.projects.push(proj);
    return of(proj);
  }
}
