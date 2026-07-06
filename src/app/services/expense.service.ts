import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Expense, ExpenseInput } from '../interfaces/expense.interface';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly expensesUrl = `${environment.apiBase}/expenses`;

  getByProject(projectId: string): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.expensesUrl, { params: { projectId } });
  }

  create(expense: ExpenseInput): Observable<{ expense: Expense }> {
    return this.http.post<{ expense: Expense }>(this.expensesUrl, expense);
  }

  update(id: string, expense: Partial<ExpenseInput>): Observable<{ expense: Expense }> {
    return this.http.put<{ expense: Expense }>(`${this.expensesUrl}/${id}`, expense);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.expensesUrl}/${id}`);
  }
}
