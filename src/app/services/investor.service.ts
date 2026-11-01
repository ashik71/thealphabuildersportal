import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Investor, InvestorInput } from '../interfaces/investor.interface';

@Injectable({ providedIn: 'root' })
export class InvestorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/investors`;

  getAll(): Observable<Investor[]> {
    return this.http.get<Investor[]>(this.baseUrl);
  }
  create(investor: InvestorInput): Observable<Investor> {
    return this.http.post<Investor>(this.baseUrl, investor);
  }
  update(id: string, investor: Partial<InvestorInput>): Observable<Investor> {
    return this.http.put<Investor>(`${this.baseUrl}/${id}`, investor);
  }
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
