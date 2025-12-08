import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface ViewToken {
  token: string;
  projectId: string;
  expiresAt: number; // epoch ms
  readonly: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private baseUrl = `${environment.apiBase}/projects`; // <-- update if your backend uses different prefix

  constructor(private http: HttpClient) {}

  // GET all projects
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  // GET single project by ID
  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // CREATE new project (optional, only if needed)
  create(project: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, project);
  }

  // UPDATE project by ID
  update(id: string, project: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, project);
  }

  // DELETE project by ID
  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  // GET project details (if you have a special endpoint)
  getDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/details`);
  }

  getProjectReport(projectId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${projectId}/report`);
  }
}
