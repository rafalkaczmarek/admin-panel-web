import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Sort, SortDirection } from '@angular/material/sort';

import { ProductStock } from '@admin-panel-web/features/products-stock/types/product-stock.interface';
import { ProductStockUpsert } from '@admin-panel-web/features/products-stock/types/product-stock-upsert.interface';
import { ProductsStockRepository } from '@admin-panel-web/features/products-stock/services/products-stock.repository';
import { getProductStockSortValue } from '@admin-panel-web/features/products-stock/utils/product-stock-sort-value.util';
import { sortByColumn } from '@admin-panel-web/shared/utils/sort-by-column.util';

import { catchError, EMPTY, finalize, of, tap, type Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductsStockService {
  private readonly repository = inject(ProductsStockRepository);

  private readonly _products = signal<ProductStock[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchQuery = signal('');
  private readonly _pageIndex = signal(0);
  private readonly _pageSize = signal(10);
  private readonly _sortActive = signal<string>('');
  private readonly _sortDirection = signal<SortDirection>('');

  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly sortActive = this._sortActive.asReadonly();
  public readonly sortDirection = this._sortDirection.asReadonly();

  public readonly filteredProducts = computed(() => {
    const query = this._searchQuery().toLowerCase().trim();
    const products = this._products();
    if (!query) {
      return products;
    }
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  });

  public readonly sortedFilteredProducts = computed(() =>
    sortByColumn(
      this.filteredProducts(),
      this._sortActive(),
      this._sortDirection(),
      getProductStockSortValue
    )
  );

  public readonly totalCount = computed(() => this.sortedFilteredProducts().length);

  public readonly paginatedProducts = computed(() => {
    const sorted = this.sortedFilteredProducts();
    const start = this._pageIndex() * this._pageSize();
    return sorted.slice(start, start + this._pageSize());
  });

  public readonly pageIndex = this._pageIndex.asReadonly();
  public readonly pageSize = this._pageSize.asReadonly();

  public readonly isEmpty = computed(
    () =>
      !this._loading() &&
      !this._error() &&
      this._products().length === 0
  );

  public loadProducts(): void {
    this._loading.set(true);
    this._error.set(null);

    this.repository
      .getProducts()
      .pipe(
        catchError((err: unknown) => {
          this._error.set(toProductsErrorMessage(err, 'Failed to load products.'));
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      )
      .subscribe((result) => {
        if (result) {
          this._products.set(result);
        }
      });
  }

  public search(query: string): void {
    this._searchQuery.set(query);
    this._pageIndex.set(0);
  }

  public changePage(pageIndex: number, pageSize: number): void {
    this._pageIndex.set(pageIndex);
    this._pageSize.set(pageSize);
  }

  public changeSort(sort: Sort): void {
    this._sortActive.set(sort.direction === '' ? '' : sort.active);
    this._sortDirection.set(sort.direction);
    this._pageIndex.set(0);
  }

  public createProduct(body: ProductStockUpsert): void {
    this.runMutation(
      this.repository.createProduct(body),
      'Failed to create product.',
      (created) => this._products.update((list) => [...list, created]),
    );
  }

  public updateProduct(id: string, body: ProductStockUpsert): void {
    this.runMutation(
      this.repository.updateProduct(id, body),
      'Failed to update product.',
      (updated) =>
        this._products.update((list) =>
          list.map((product) => (product.id === id ? updated : product)),
        ),
    );
  }

  public deleteProduct(id: string): void {
    this.runMutation(
      this.repository.deleteProduct(id),
      'Failed to delete product.',
      () => this._products.update((list) => list.filter((product) => product.id !== id)),
    );
  }

  private runMutation<T>(
    request$: Observable<T>,
    fallbackMessage: string,
    onSuccess: (result: T) => void,
  ): void {
    this._loading.set(true);
    this._error.set(null);

    request$
      .pipe(
        tap((result) => onSuccess(result)),
        catchError((err: unknown) => {
          this._error.set(toProductsErrorMessage(err, fallbackMessage));
          return EMPTY;
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }
}

function toProductsErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { message?: string } | null;
    if (body?.message) {
      return body.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
