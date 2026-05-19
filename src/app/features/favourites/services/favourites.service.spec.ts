import { TestBed } from '@angular/core/testing';

import { FavouriteProduct } from '@admin-panel-web/features/favourites/types/favourite-product.interface';
import { FavouritesRepository } from '@admin-panel-web/features/favourites/services/favourites.repository';
import { FavouritesService } from '@admin-panel-web/features/favourites/services/favourites.service';

import { of, throwError } from 'rxjs';

const MOCK_PRODUCTS: FavouriteProduct[] = [
  {
    id: 'f1',
    image: '',
    name: 'Apple Watch',
    description: 'Smart watch with retina display.',
    category: 'Electronic',
    rating: 4.5,
    reviewCount: 320,
    price: 399,
    originalPrice: 459,
    availableColors: ['#333333'],
    isFavorite: true,
  },
  {
    id: 'f2',
    image: '',
    name: 'Samsung Phone',
    description: 'Mobile phone with FHD display.',
    category: 'Mobile',
    rating: 4.0,
    reviewCount: 180,
    price: 299,
    originalPrice: null,
    availableColors: ['#4880ff'],
    isFavorite: true,
  },
  {
    id: 'f3',
    image: '',
    name: 'Cotton Dress',
    description: 'Casual cotton dress.',
    category: 'Fashion',
    rating: 4.7,
    reviewCount: 512,
    price: 89,
    originalPrice: null,
    availableColors: ['#f93c65'],
    isFavorite: true,
  },
];

function createMockRepository(
  overrides: Partial<FavouritesRepository> = {},
): Partial<FavouritesRepository> {
  return {
    getFavourites: () => of(MOCK_PRODUCTS),
    ...overrides,
  };
}

describe('FavouritesService', () => {
  let service: FavouritesService;
  let repository: Partial<FavouritesRepository>;

  function setup(overrides: Partial<FavouritesRepository> = {}): void {
    window.localStorage.clear();
    repository = createMockRepository(overrides);

    TestBed.configureTestingModule({
      providers: [{ provide: FavouritesRepository, useValue: repository }],
    });
    service = TestBed.inject(FavouritesService);
  }

  afterEach(() => {
    window.localStorage.clear();
  });

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
    service.loadFavourites();

    expect(service.totalCount()).toBe(3);
    expect(service.loading()).toBe(false);
    expect(service.isEmpty()).toBe(false);
  });

  it('should expose unique sorted categories', () => {
    setup();
    service.loadFavourites();

    expect(service.categories()).toEqual(['Electronic', 'Fashion', 'Mobile']);
  });

  it('should set error on repository failure', () => {
    setup({ getFavourites: () => throwError(() => new Error('Network down')) });
    service.loadFavourites();

    expect(service.error()).toBe('Network down');
    expect(service.loading()).toBe(false);
  });

  it('should set fallback error message for non-Error throws', () => {
    setup({ getFavourites: () => throwError(() => 'oops') });
    service.loadFavourites();

    expect(service.error()).toBe('Failed to load favourites.');
  });

  it.each([
    { query: 'apple', expectedIds: ['f1'] },
    { query: 'phone', expectedIds: ['f2'] },
    { query: 'cotton', expectedIds: ['f3'] },
    { query: 'fashion', expectedIds: ['f3'] },
  ])('should filter products by search query "$query"', ({ query, expectedIds }) => {
    setup();
    service.loadFavourites();
    service.search(query);

    expect(service.filteredProducts().map((p) => p.id)).toEqual(expectedIds);
  });

  it('should filter products by category', () => {
    setup();
    service.loadFavourites();
    service.changeCategory('Mobile');

    expect(service.filteredProducts().map((p) => p.id)).toEqual(['f2']);
  });

  it('should reset category filter when changed to null', () => {
    setup();
    service.loadFavourites();
    service.changeCategory('Mobile');
    service.changeCategory(null);

    expect(service.totalCount()).toBe(3);
  });

  it('should reset page index when search changes', () => {
    setup();
    service.loadFavourites();
    service.changePage(1, 1);
    service.search('apple');

    expect(service.pageIndex()).toBe(0);
  });

  it('should reset page index when category changes', () => {
    setup();
    service.loadFavourites();
    service.changePage(1, 1);
    service.changeCategory('Mobile');

    expect(service.pageIndex()).toBe(0);
  });

  it('should paginate products correctly', () => {
    setup();
    service.loadFavourites();
    service.changePage(0, 2);

    expect(service.paginatedProducts().length).toBe(2);

    service.changePage(1, 2);

    expect(service.paginatedProducts().length).toBe(1);
  });

  it.each([
    { column: 'name', direction: 'asc' as const, expectedFirst: 'Apple Watch' },
    { column: 'name', direction: 'desc' as const, expectedFirst: 'Samsung Phone' },
    { column: 'price', direction: 'asc' as const, expectedFirst: 'Cotton Dress' },
    { column: 'price', direction: 'desc' as const, expectedFirst: 'Apple Watch' },
    { column: 'rating', direction: 'desc' as const, expectedFirst: 'Cotton Dress' },
    { column: 'reviewCount', direction: 'desc' as const, expectedFirst: 'Cotton Dress' },
  ])(
    'should sort by $column $direction',
    ({ column, direction, expectedFirst }) => {
      setup();
      service.loadFavourites();
      service.changeSort(column, direction);

      expect(service.paginatedProducts()[0].name).toBe(expectedFirst);
    },
  );

  it('should reset page index when sort changes', () => {
    setup();
    service.loadFavourites();
    service.changePage(1, 1);
    service.changeSort('name', 'asc');

    expect(service.pageIndex()).toBe(0);
  });

  it('should clear sort active when direction is empty', () => {
    setup();
    service.loadFavourites();
    service.changeSort('name', 'asc');
    service.changeSort('name', '');

    expect(service.sortActive()).toBe('');
    expect(service.sortDirection()).toBe('');
  });

  it('should toggle favourite flag immutably', () => {
    setup();
    service.loadFavourites();
    const originalRefs = service.products();

    service.toggleFavourite('f1');

    const updated = service.products().find((p) => p.id === 'f1');
    const untouched = service.products().find((p) => p.id === 'f2');
    expect(updated?.isFavorite).toBe(false);
    expect(untouched?.isFavorite).toBe(true);
    expect(service.products()).not.toBe(originalRefs);
  });

  it('should exclude unfavourited products from filteredProducts and totalCount', () => {
    setup();
    service.loadFavourites();
    expect(service.totalCount()).toBe(3);

    service.toggleFavourite('f1');

    expect(service.totalCount()).toBe(2);
    expect(service.filteredProducts().some((p) => p.id === 'f1')).toBe(false);
  });

  it('should mark isEmpty when all products are unfavourited', () => {
    setup();
    service.loadFavourites();
    service.toggleFavourite('f1');
    service.toggleFavourite('f2');
    service.toggleFavourite('f3');

    expect(service.isEmpty()).toBe(true);
  });

  it('should persist removed favourites to localStorage', () => {
    setup();
    service.loadFavourites();
    service.toggleFavourite('f1');
    TestBed.flushEffects();

    const stored = window.localStorage.getItem('app-favourites-removed');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored ?? '[]')).toContain('f1');
  });

  it('should restore removed favourites from localStorage on next load', () => {
    window.localStorage.setItem('app-favourites-removed', JSON.stringify(['f2']));
    repository = createMockRepository();

    TestBed.configureTestingModule({
      providers: [{ provide: FavouritesRepository, useValue: repository }],
    });
    service = TestBed.inject(FavouritesService);
    service.loadFavourites();

    const restored = service.products().find((p) => p.id === 'f2');
    expect(restored?.isFavorite).toBe(false);
    expect(service.totalCount()).toBe(2);
  });

  it('should clear previous error on retry', () => {
    setup({ getFavourites: () => throwError(() => new Error('fail')) });
    service.loadFavourites();
    expect(service.error()).toBeTruthy();

    repository.getFavourites = () => of(MOCK_PRODUCTS);
    service.loadFavourites();

    expect(service.error()).toBeNull();
    expect(service.totalCount()).toBe(3);
  });
});
