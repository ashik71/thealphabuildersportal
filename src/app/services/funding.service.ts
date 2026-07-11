import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Commitment,
  CommitmentInput,
  Payment,
  PaymentInput,
  ShareholderView,
  ShareholderViewLinkResponse,
} from '../interfaces/funding.interface';

@Injectable({ providedIn: 'root' })
export class FundingService {
  private readonly http = inject(HttpClient);
  private readonly commitmentsUrl = `${environment.apiBase}/commitments`;
  private readonly paymentsUrl = `${environment.apiBase}/payments`;

  getCommitmentsByProject(projectId: string): Observable<Commitment[]> {
    return this.http.get<Commitment[]>(this.commitmentsUrl, { params: { projectId } });
  }

  createCommitment(commitment: CommitmentInput): Observable<Commitment> {
    return this.http.post<Commitment>(this.commitmentsUrl, commitment);
  }

  updateCommitment(id: string, commitment: Partial<CommitmentInput>): Observable<Commitment> {
    return this.http.put<Commitment>(`${this.commitmentsUrl}/${id}`, commitment);
  }

  deleteCommitment(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.commitmentsUrl}/${id}`);
  }

  getPaymentsByProject(projectId: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.paymentsUrl}/${projectId}`);
  }

  createPayment(payment: PaymentInput): Observable<Payment> {
    return this.http.post<Payment>(this.paymentsUrl, payment);
  }

  deletePayment(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.paymentsUrl}/${id}`);
  }

  generateShareholderViewLink(commitmentId: string): Observable<ShareholderViewLinkResponse> {
    return this.http.post<ShareholderViewLinkResponse>(`${this.commitmentsUrl}/${commitmentId}/view-link`, {});
  }

  getByShareholderViewToken(token: string): Observable<ShareholderView> {
    return this.http.get<ShareholderView>(`${this.commitmentsUrl}/view/${token}`);
  }

  downloadShareholderReport(token: string): Observable<Blob> {
    return this.http.get(`${this.commitmentsUrl}/view/${token}/report`, { responseType: 'blob' });
  }
}
