import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CostCategory, CostCategoryInput } from '../interfaces/expense.interface';

@Injectable({ providedIn: 'root' })
export class CostCategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/cost-categories`;

  getAll(): Observable<CostCategory[]> {
    return this.http.get<CostCategory[]>(this.baseUrl);
  }

  create(category: CostCategoryInput): Observable<CostCategory> {
    return this.http.post<CostCategory>(this.baseUrl, category);
  }

  update(id: string, category: Partial<CostCategoryInput>): Observable<CostCategory> {
    return this.http.put<CostCategory>(`${this.baseUrl}/${id}`, category);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
