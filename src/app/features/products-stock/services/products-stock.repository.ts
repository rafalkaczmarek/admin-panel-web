import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ProductStock } from '@admin-panel-web/features/products-stock/types/product-stock.interface';
import { ProductStockUpsert } from '@admin-panel-web/features/products-stock/types/product-stock-upsert.interface';
import { APP_ENVIRONMENT } from '@admin-panel-web/tokens/app-environment.token';

import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductsStockRepository {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);
  private readonly baseUrl = `${this.env.apiBaseUrl}/products`;

  public getProducts(): Observable<ProductStock[]> {
    return this.http.get<ProductStock[]>(this.baseUrl);
  }

  public getProduct(id: string): Observable<ProductStock> {
    return this.http.get<ProductStock>(`${this.baseUrl}/${id}`);
  }

  public createProduct(body: ProductStockUpsert): Observable<ProductStock> {
    return this.http.post<ProductStock>(this.baseUrl, body);
  }

  public updateProduct(id: string, body: ProductStockUpsert): Observable<ProductStock> {
    return this.http.put<ProductStock>(`${this.baseUrl}/${id}`, body);
  }

  public deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
