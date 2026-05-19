import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { FavouritesService } from '@admin-panel-web/features/favourites/services/favourites.service';
import { FavouritesPage } from '@admin-panel-web/features/favourites/pages/favourites-page/favourites-page';
import { FavouriteProduct } from '@admin-panel-web/features/favourites/types/favourite-product.interface';

const MOCK_PRODUCTS: FavouriteProduct[] = [
  {
    id: 'fav-1',
    image: '',
    name: 'Apple Watch',
    description: 'Test product',
    category: 'Electronic',
    rating: 4.5,
    reviewCount: 100,
    price: 100,
    originalPrice: null,
    availableColors: ['#333333'],
    isFavorite: true,
  },
];

function createMockFavouritesService() {
  return {
    products: signal<FavouriteProduct[]>([]),
    paginatedProducts: signal<FavouriteProduct[]>([]),
    categories: signal<string[]>([]),
    category: signal<string>('all'),
    loading: signal(false),
    error: signal<string | null>(null),
    isEmpty: signal(true),
    pageIndex: signal(0),
    pageSize: signal(8),
    totalCount: signal(0),
    loadFavourites: vi.fn(),
    search: vi.fn(),
    changeSort: vi.fn(),
    changeCategory: vi.fn(),
    changePage: vi.fn(),
    toggleFavourite: vi.fn(),
  };
}

describe('FavouritesPage', () => {
  let component: FavouritesPage;
  let fixture: ComponentFixture<FavouritesPage>;
  let el: HTMLElement;
  let mockService: ReturnType<typeof createMockFavouritesService>;

  beforeEach(async () => {
    mockService = createMockFavouritesService();

    await TestBed.configureTestingModule({
      imports: [FavouritesPage],
      providers: [{ provide: FavouritesService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FavouritesPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call loadFavourites on init', () => {
    fixture.detectChanges();
    expect(mockService.loadFavourites).toHaveBeenCalled();
  });

  it('should render page hero with Favourites title', () => {
    fixture.detectChanges();
    el = fixture.nativeElement;

    expect(el.querySelector('app-page-hero')).not.toBeNull();
  });

  it('should show spinner when loading', () => {
    mockService.loading.set(true);
    mockService.isEmpty.set(false);
    fixture.detectChanges();
    el = fixture.nativeElement;

    expect(el.querySelector('mat-spinner')).not.toBeNull();
    expect(el.querySelector('[role="status"]')).not.toBeNull();
  });

  it('should show error state with retry button', () => {
    mockService.error.set('Something went wrong');
    mockService.isEmpty.set(false);
    fixture.detectChanges();
    el = fixture.nativeElement;

    expect(el.querySelector('[role="alert"]')).not.toBeNull();
    expect(el.textContent).toContain('Something went wrong');

    const retryBtn = el.querySelector('[role="alert"] button') as HTMLButtonElement;
    expect(retryBtn).not.toBeNull();
    expect(retryBtn.textContent).toContain('Retry');
  });

  it('should call loadFavourites when retry is clicked', () => {
    mockService.error.set('fail');
    mockService.isEmpty.set(false);
    fixture.detectChanges();
    el = fixture.nativeElement;

    mockService.loadFavourites.mockClear();
    const retryBtn = el.querySelector('[role="alert"] button') as HTMLButtonElement;
    retryBtn.click();

    expect(mockService.loadFavourites).toHaveBeenCalled();
  });

  it('should show empty state when no favourites available', () => {
    mockService.isEmpty.set(true);
    fixture.detectChanges();
    el = fixture.nativeElement;

    expect(el.textContent).toContain("You haven't saved any favourites yet");
  });

  it('should render grid and paginator when data is loaded', () => {
    mockService.isEmpty.set(false);
    mockService.paginatedProducts.set(MOCK_PRODUCTS);
    mockService.totalCount.set(1);
    fixture.detectChanges();
    el = fixture.nativeElement;

    expect(el.querySelector('app-favourites-grid')).not.toBeNull();
    expect(el.querySelector('app-favourites-toolbar')).not.toBeNull();
    expect(el.querySelector('mat-paginator')).not.toBeNull();
  });

  it('should forward search input to service.search', () => {
    component['onSearch']('apple');
    expect(mockService.search).toHaveBeenCalledWith('apple');
  });

  it('should forward sort change to service.changeSort', () => {
    component['onSortChange']({ active: 'price', direction: 'desc' });
    expect(mockService.changeSort).toHaveBeenCalledWith('price', 'desc');
  });

  it('should forward category "all" as null to service.changeCategory', () => {
    component['onCategoryChange']('all');
    expect(mockService.changeCategory).toHaveBeenCalledWith(null);
  });

  it('should forward concrete category to service.changeCategory', () => {
    component['onCategoryChange']('Electronic');
    expect(mockService.changeCategory).toHaveBeenCalledWith('Electronic');
  });

  it('should forward page change to service.changePage', () => {
    component['onPageChange']({ pageIndex: 2, pageSize: 12 } as PageEvent);
    expect(mockService.changePage).toHaveBeenCalledWith(2, 12);
  });

  it('should forward toggle favourite to service.toggleFavourite', () => {
    component['onToggleFavourite']('fav-1');
    expect(mockService.toggleFavourite).toHaveBeenCalledWith('fav-1');
  });
});
