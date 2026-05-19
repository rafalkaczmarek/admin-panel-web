import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SortDirection } from '@angular/material/sort';

import { FavouriteProduct } from '@admin-panel-web/features/favourites/types/favourite-product.interface';
import { FavouritesRepository } from '@admin-panel-web/features/favourites/services/favourites.repository';
import { getFavouriteProductSortValue } from '@admin-panel-web/features/favourites/utils/favourite-product-sort-value.util';
import { sortByColumn } from '@admin-panel-web/shared/utils/sort-by-column.util';

import { catchError, finalize, of } from 'rxjs';

const REMOVED_IDS_STORAGE_KEY = 'app-favourites-removed';
const ALL_CATEGORIES = 'all';

@Injectable({ providedIn: 'root' })
export class FavouritesService {
  private readonly repository = inject(FavouritesRepository);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _products = signal<FavouriteProduct[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchQuery = signal('');
  private readonly _category = signal<string>(ALL_CATEGORIES);
  private readonly _sortActive = signal<string>('');
  private readonly _sortDirection = signal<SortDirection>('');
  private readonly _pageIndex = signal(0);
  private readonly _pageSize = signal(8);

  public readonly products = this._products.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly searchQuery = this._searchQuery.asReadonly();
  public readonly category = this._category.asReadonly();
  public readonly sortActive = this._sortActive.asReadonly();
  public readonly sortDirection = this._sortDirection.asReadonly();
  public readonly pageIndex = this._pageIndex.asReadonly();
  public readonly pageSize = this._pageSize.asReadonly();

  public readonly categories = computed(() => {
    const unique = new Set<string>();
    for (const product of this._products()) {
      unique.add(product.category);
    }
    return [...unique].sort((a, b) => a.localeCompare(b));
  });

  public readonly filteredProducts = computed(() => {
    const query = this._searchQuery().toLowerCase().trim();
    const category = this._category();
    const products = this._products().filter((product) => product.isFavorite);

    const byCategory =
      category === ALL_CATEGORIES
        ? products
        : products.filter((product) => product.category === category);

    if (!query) {
      return byCategory;
    }

    return byCategory.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query),
    );
  });

  public readonly sortedFilteredProducts = computed(() =>
    sortByColumn(
      this.filteredProducts(),
      this._sortActive(),
      this._sortDirection(),
      getFavouriteProductSortValue,
    ),
  );

  public readonly totalCount = computed(() => this.sortedFilteredProducts().length);

  public readonly paginatedProducts = computed(() => {
    const sorted = this.sortedFilteredProducts();
    const start = this._pageIndex() * this._pageSize();
    return sorted.slice(start, start + this._pageSize());
  });

  public readonly isEmpty = computed(
    () =>
      !this._loading() &&
      !this._error() &&
      this._products().filter((product) => product.isFavorite).length === 0,
  );

  public constructor() {
    effect(() => {
      if (!this.isBrowser) {
        return;
      }
      const removedIds = this._products()
        .filter((product) => !product.isFavorite)
        .map((product) => product.id);
      window.localStorage.setItem(REMOVED_IDS_STORAGE_KEY, JSON.stringify(removedIds));
    });
  }

  public loadFavourites(): void {
    this._loading.set(true);
    this._error.set(null);

    this.repository
      .getFavourites()
      .pipe(
        catchError((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Failed to load favourites.';
          this._error.set(message);
          return of(null);
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe((result) => {
        if (result) {
          this._products.set(this.applyStoredRemovals(result));
        }
      });
  }

  public search(query: string): void {
    this._searchQuery.set(query);
    this._pageIndex.set(0);
  }

  public changeCategory(category: string | null): void {
    this._category.set(category ?? ALL_CATEGORIES);
    this._pageIndex.set(0);
  }

  public changeSort(active: string, direction: SortDirection): void {
    this._sortActive.set(direction === '' ? '' : active);
    this._sortDirection.set(direction);
    this._pageIndex.set(0);
  }

  public changePage(pageIndex: number, pageSize: number): void {
    this._pageIndex.set(pageIndex);
    this._pageSize.set(pageSize);
  }

  public toggleFavourite(id: string): void {
    this._products.update((products) =>
      products.map((product) =>
        product.id === id ? { ...product, isFavorite: !product.isFavorite } : product,
      ),
    );
  }

  private applyStoredRemovals(products: FavouriteProduct[]): FavouriteProduct[] {
    const removedIds = this.readRemovedIds();
    if (removedIds.size === 0) {
      return products;
    }
    return products.map((product) =>
      removedIds.has(product.id) ? { ...product, isFavorite: false } : product,
    );
  }

  private readRemovedIds(): Set<string> {
    if (!this.isBrowser) {
      return new Set();
    }
    const raw = window.localStorage.getItem(REMOVED_IDS_STORAGE_KEY);
    if (!raw) {
      return new Set();
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.filter((value): value is string => typeof value === 'string'));
      }
      return new Set();
    } catch {
      window.localStorage.removeItem(REMOVED_IDS_STORAGE_KEY);
      return new Set();
    }
  }
}
