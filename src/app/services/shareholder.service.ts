import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Shareholder, ShareholderInput } from '../interfaces/shareholder.interface';

@Injectable({ providedIn: 'root' })
export class ShareholderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/shareholders`;

  getAll(): Observable<Shareholder[]> {
    return this.http.get<Shareholder[]>(this.baseUrl);
  }

  create(shareholder: ShareholderInput): Observable<Shareholder> {
    return this.http.post<Shareholder>(this.baseUrl, shareholder);
  }

  update(id: string, shareholder: Partial<ShareholderInput>): Observable<Shareholder> {
    return this.http.put<Shareholder>(`${this.baseUrl}/${id}`, shareholder);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
