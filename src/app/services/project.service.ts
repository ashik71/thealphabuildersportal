import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Project,
  ProjectCostReport,
  ProjectInput,
  ProjectPublicView,
  ViewLinkResponse,
} from '../interfaces/project.interface';
import { ProjectFunding } from '../interfaces/funding.interface';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/projects`;

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

  getById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }

  create(project: ProjectInput): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, project);
  }

  update(id: string, project: Partial<ProjectInput>): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/${id}`, project);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  getProjectReport(projectId: string): Observable<ProjectCostReport> {
    return this.http.get<ProjectCostReport>(`${this.baseUrl}/${projectId}/report`);
  }

  getProjectFunding(projectId: string): Observable<ProjectFunding> {
    return this.http.get<ProjectFunding>(`${this.baseUrl}/${projectId}/funding`);
  }

  exportReport(projectId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${projectId}/report/export`, { responseType: 'blob' });
  }

  generateViewLink(projectId: string): Observable<ViewLinkResponse> {
    return this.http.post<ViewLinkResponse>(`${this.baseUrl}/${projectId}/view-link`, {});
  }

  getByViewToken(token: string): Observable<ProjectPublicView> {
    return this.http.get<ProjectPublicView>(`${this.baseUrl}/view/${token}`);
  }
}
