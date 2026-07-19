import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PortalProject,
  PortalProjectDetail,
  PortalSummary,
} from '../interfaces/portal.interface';

/**
 * The shareholder's own view of their investments.
 *
 * Every endpoint here is scoped server-side to the signed-in shareholder —
 * there is no project id or shareholder id to pass, because the server derives
 * access from the session rather than trusting the client to ask nicely.
 */
@Injectable({ providedIn: 'root' })
export class PortalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/me`;

  getSummary(): Observable<PortalSummary> {
    return this.http.get<PortalSummary>(`${this.baseUrl}/summary`);
  }

  getProjects(): Observable<PortalProject[]> {
    return this.http.get<PortalProject[]>(`${this.baseUrl}/projects`);
  }

  getProject(projectId: string): Observable<PortalProjectDetail> {
    return this.http.get<PortalProjectDetail>(`${this.baseUrl}/projects/${projectId}`);
  }
}
