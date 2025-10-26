import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  user: string;
  isAdmin: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient) {
    const raw = localStorage.getItem('currentUser');
    if (raw) this.currentUser.next(JSON.parse(raw));
  }

  login(email: string, password: string) {
    return this.http
      .post<any>(`${environment.apiBase}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          if (res && res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('currentUser', JSON.stringify(res.isAdmin));
            this.currentUser.next(res);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUser.next(null);
  }

  getToken() {
    return localStorage.getItem('token');
  }
  get current() {
    return this.currentUser.value;
  }
}
