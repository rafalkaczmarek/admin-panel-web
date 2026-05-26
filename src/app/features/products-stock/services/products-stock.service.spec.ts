import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ProductStock } from '@admin-panel-web/features/products-stock/types/product-stock.interface';
import { ProductStockUpsert } from '@admin-panel-web/features/products-stock/types/product-stock-upsert.interface';
import { ProductsStockRepository } from '@admin-panel-web/features/products-stock/services/products-stock.repository';
import { ProductsStockService } from '@admin-panel-web/features/products-stock/services/products-stock.service';

import { of, throwError } from 'rxjs';

const MOCK_PRODUCTS: ProductStock[] = [
  { id: 'p1', image: '', name: 'Apple Watch', category: 'Electronic', price: 690, piece: 63, availableColors: ['#333'], status: 'in-stock' },
  { id: 'p2', image: '', name: 'Samsung Phone', category: 'Mobile', price: 400, piece: 0, availableColors: ['#333'], status: 'out-of-stock' },
  { id: 'p3', image: '', name: 'Women Dress', category: 'Fashion', price: 120, piece: 50, availableColors: ['#f93c65'], status: 'in-stock' },
];

const UPSERT_BODY: ProductStockUpsert = {
  image: 'https://example.com/img.png',
  name: 'New Item',
  category: 'Electronic',
  price: 50,
  piece: 5,
  availableColors: ['#333333'],
};

function createMockRepository(overrides: Partial<ProductsStockRepository> = {}): Partial<ProductsStockRepository> {
  return {
    getProducts: () => of(MOCK_PRODUCTS),
    getProduct: (id: string) => of(MOCK_PRODUCTS.find((p) => p.id === id)!),
    createProduct: () => of({ ...MOCK_PRODUCTS[0], id: 'p-new', name: UPSERT_BODY.name }),
    updateProduct: (id: string) =>
      of({ ...MOCK_PRODUCTS.find((p) => p.id === id)!, name: UPSERT_BODY.name }),
    deleteProduct: () => of(undefined),
    ...overrides,
  };
}

describe('ProductsStockService', () => {
  let service: ProductsStockService;
  let repository: Partial<ProductsStockRepository>;

  function setup(overrides: Partial<ProductsStockRepository> = {}): void {
    repository = createMockRepository(overrides);

    TestBed.configureTestingModule({
      providers: [{ provide: ProductsStockRepository, useValue: repository }],
    });
    service = TestBed.inject(ProductsStockService);
  }

  it('should be created', () => {
    setup();
    expect(service).toBeTruthy();
  });

  it('should start with empty state', () => {
    setup();
    expect(service.paginatedProducts()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.isEmpty()).toBe(true);
  });

  it('should populate products after loading', () => {
    setup();
    service.loadProducts();

    expect(service.paginatedProducts().length).toBe(3);
    expect(service.totalCount()).toBe(3);
    expect(service.loading()).toBe(false);
    expect(service.isEmpty()).toBe(false);
  });

  it('should set error on repository failure', () => {
    setup({
      getProducts: () => throwError(() => new Error('Network error')),
    });

    service.loadProducts();

    expect(service.error()).toBe('Network error');
    expect(service.loading()).toBe(false);
  });

  it('should set fallback error message for non-Error throws', () => {
    setup({
      getProducts: () => throwError(() => 'unknown'),
    });

    service.loadProducts();

    expect(service.error()).toBe('Failed to load products.');
  });

  it('should use API error message from HttpErrorResponse', () => {
    setup({
      getProducts: () =>
        throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              error: { code: 'INVALID_SESSION', message: 'Missing access token.' },
            }),
        ),
    });

    service.loadProducts();

    expect(service.error()).toBe('Missing access token.');
  });

  it('should filter products by name', () => {
    setup();
    service.loadProducts();
    service.search('apple');

    expect(service.filteredProducts().length).toBe(1);
    expect(service.filteredProducts()[0].name).toBe('Apple Watch');
  });

  it('should filter products by category', () => {
    setup();
    service.loadProducts();
    service.search('fashion');

    expect(service.filteredProducts().length).toBe(1);
    expect(service.filteredProducts()[0].category).toBe('Fashion');
  });

  it('should reset page index on search', () => {
    setup();
    service.loadProducts();
    service.changePage(1, 1);
    service.search('apple');

    expect(service.pageIndex()).toBe(0);
  });

  it('should paginate products correctly', () => {
    setup();
    service.loadProducts();
    service.changePage(0, 2);

    expect(service.paginatedProducts().length).toBe(2);

    service.changePage(1, 2);

    expect(service.paginatedProducts().length).toBe(1);
  });

  it('should sort filtered products by name ascending', () => {
    setup();
    service.loadProducts();
    service.changeSort({ active: 'name', direction: 'asc' });

    const names = service.paginatedProducts().map((p) => p.name);
    expect(names).toEqual(['Apple Watch', 'Samsung Phone', "Women Dress"]);
  });

  it('should sort filtered products by price descending', () => {
    setup();
    service.loadProducts();
    service.changeSort({ active: 'price', direction: 'desc' });

    expect(service.paginatedProducts().map((p) => p.price)).toEqual([690, 400, 120]);
  });

  it('should reset page index when sort changes', () => {
    setup();
    service.loadProducts();
    service.changePage(1, 1);
    expect(service.pageIndex()).toBe(1);

    service.changeSort({ active: 'name', direction: 'asc' });

    expect(service.pageIndex()).toBe(0);
  });

  it('should append product after createProduct', () => {
    setup();
    service.loadProducts();
    service.createProduct(UPSERT_BODY);

    expect(service.totalCount()).toBe(4);
    expect(service.paginatedProducts().some((p) => p.name === UPSERT_BODY.name)).toBe(true);
  });

  it('should update product after updateProduct', () => {
    setup();
    service.loadProducts();
    service.updateProduct('p1', UPSERT_BODY);

    const updated = service.paginatedProducts().find((p) => p.id === 'p1');
    expect(updated?.name).toBe(UPSERT_BODY.name);
  });

  it('should remove product after deleteProduct', () => {
    setup();
    service.loadProducts();
    service.deleteProduct('p1');

    expect(service.totalCount()).toBe(2);
    expect(service.paginatedProducts().every((p) => p.id !== 'p1')).toBe(true);
  });

  it('should clear previous error on retry', () => {
    setup({
      getProducts: () => throwError(() => new Error('fail')),
    });

    service.loadProducts();
    expect(service.error()).toBeTruthy();

    repository.getProducts = () => of(MOCK_PRODUCTS);
    service.loadProducts();

    expect(service.error()).toBeNull();
    expect(service.paginatedProducts().length).toBe(3);
  });
});
