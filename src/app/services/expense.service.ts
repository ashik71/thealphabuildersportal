import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CostCategory, Expense, ExpenseInput } from '../interfaces/expense.interface';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly expensesUrl = `${environment.apiBase}/expenses`;
  private readonly categoriesUrl = `${environment.apiBase}/cost-categories`;

  create(expense: ExpenseInput): Observable<{ expense: Expense }> {
    return this.http.post<{ expense: Expense }>(this.expensesUrl, expense);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.expensesUrl}/${id}`);
  }

  getAllCategories(): Observable<CostCategory[]> {
    return this.http.get<CostCategory[]>(this.categoriesUrl);
  }
}
