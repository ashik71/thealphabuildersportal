import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Invitation,
  InvitationCreated,
  InvitationPreview,
  InviteExpiryHours,
} from '../interfaces/invitation.interface';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/invitations`;

  getAll(shareholderId?: string): Observable<Invitation[]> {
    const query = shareholderId ? `?shareholderId=${shareholderId}` : '';
    return this.http.get<Invitation[]>(`${this.baseUrl}${query}`);
  }

  create(shareholderId: string, expiryHours: InviteExpiryHours): Observable<InvitationCreated> {
    return this.http.post<InvitationCreated>(this.baseUrl, { shareholderId, expiryHours });
  }

  revoke(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${id}/revoke`, {});
  }

  // --- Public endpoints: called before the invitee has an account ---

  preview(token: string): Observable<InvitationPreview> {
    return this.http.get<InvitationPreview>(`${this.baseUrl}/token/${token}`);
  }

  accept(token: string, name: string, password: string): Observable<{ message: string; email: string }> {
    return this.http.post<{ message: string; email: string }>(
      `${this.baseUrl}/token/${token}/accept`,
      { name, password }
    );
  }
}
