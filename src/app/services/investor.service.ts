import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Investor,
  InvestorInput,
  InvestorProject,
  InvestorProjectInput,
  InvestorPaymentInput,
} from '../interfaces/investor.interface';

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
  getProjects(investorId: string): Observable<InvestorProject[]> {
    return this.http.get<InvestorProject[]>(`${this.baseUrl}/${investorId}/projects`);
  }
  createProject(investorId: string, assignment: InvestorProjectInput): Observable<InvestorProject> {
    return this.http.post<InvestorProject>(`${this.baseUrl}/${investorId}/projects`, assignment);
  }
  updateProject(
    investorId: string,
    assignmentId: string,
    assignment: Partial<InvestorProjectInput>
  ): Observable<InvestorProject> {
    return this.http.put<InvestorProject>(`${this.baseUrl}/${investorId}/projects/${assignmentId}`, assignment);
  }
  deleteProject(investorId: string, assignmentId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${investorId}/projects/${assignmentId}`);
  }
  createPayment(
    investorId: string,
    assignmentId: string,
    payment: InvestorPaymentInput
  ): Observable<InvestorPaymentInput> {
    return this.http.post<InvestorPaymentInput>(
      `${this.baseUrl}/${investorId}/projects/${assignmentId}/payments`,
      payment
    );
  }
}
