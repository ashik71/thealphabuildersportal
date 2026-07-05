import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../interfaces/user.interface';

const STORAGE_KEY = 'currentUser';
const TOKEN_KEY = 'token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly currentUserSignal = signal<User | null>(this.readStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.isAdmin ?? false);

  login(email: string, password: string) {
    return this.http.post<User>(`${environment.apiBase}/auth/login`, { email, password }).pipe(
      tap((user) => {
        localStorage.setItem(TOKEN_KEY, user.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
      })
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    this.currentUserSignal.set(null);
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  get current() {
    return this.currentUserSignal();
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
