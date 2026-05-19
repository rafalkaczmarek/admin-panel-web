import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavouriteProduct } from '@admin-panel-web/features/favourites/types/favourite-product.interface';
import { FavouriteProductCard } from '@admin-panel-web/features/favourites/components/favourite-product-card/favourite-product-card';

const MOCK_PRODUCT: FavouriteProduct = {
  id: 'fav-1',
  image: 'https://placehold.co/240x240',
  name: 'Apple Watch Series 7',
  description: 'GPS, 41mm aluminium case with sport band, retina display.',
  category: 'Electronic',
  rating: 4.5,
  reviewCount: 320,
  price: 399,
  originalPrice: 459,
  availableColors: ['#333333', '#4880ff'],
  isFavorite: true,
};

function setProduct(
  fixture: ComponentFixture<FavouriteProductCard>,
  overrides: Partial<FavouriteProduct> = {},
): void {
  fixture.componentRef.setInput('product', { ...MOCK_PRODUCT, ...overrides });
  fixture.detectChanges();
}

describe('FavouriteProductCard', () => {
  let component: FavouriteProductCard;
  let fixture: ComponentFixture<FavouriteProductCard>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavouriteProductCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FavouriteProductCard);
    component = fixture.componentInstance;
    setProduct(fixture);
    el = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render product name, description and category', () => {
    expect(el.querySelector('.name')?.textContent).toContain('Apple Watch Series 7');
    expect(el.querySelector('.description')?.textContent).toContain(
      'GPS, 41mm aluminium case',
    );
    expect(el.querySelector('.category')?.textContent).toContain('Electronic');
  });

  it('should render current and discounted price when originalPrice is greater than price', () => {
    const current = el.querySelector('.current-price')?.textContent ?? '';
    const original = el.querySelector('.original-price')?.textContent ?? '';
    expect(current).toContain('$399');
    expect(original).toContain('$459');
  });

  it('should hide original price when there is no discount', () => {
    setProduct(fixture, { originalPrice: null });
    expect(el.querySelector('.original-price')).toBeNull();
  });

  it('should render 5 star icons reflecting half-star rating', () => {
    const stars = el.querySelectorAll('.stars i');
    expect(stars.length).toBe(5);

    setProduct(fixture, { rating: 3.5 });
    const refreshed = el.querySelectorAll('.stars i');
    const filled = el.querySelectorAll('.stars .star-filled');
    expect(refreshed.length).toBe(5);
    expect(filled.length).toBe(4);
  });

  it('should expose accessible rating label', () => {
    const rating = el.querySelector('.rating');
    expect(rating?.getAttribute('role')).toBe('img');
    expect(rating?.getAttribute('aria-label')).toContain('4.5 out of 5 stars');
    expect(rating?.getAttribute('aria-label')).toContain('320 reviews');
  });

  it('should render color swatches with accessible label', () => {
    const colors = el.querySelector('.colors');
    expect(colors?.getAttribute('aria-label')).toBe('Available colors: Black, Blue');
    expect(el.querySelectorAll('.color-dot').length).toBe(2);
  });

  it('should render heart toggle with aria-pressed reflecting state', () => {
    const heart = el.querySelector('.favourite-toggle') as HTMLButtonElement;
    expect(heart.getAttribute('aria-pressed')).toBe('true');
    expect(heart.getAttribute('aria-label')).toBe(
      'Remove Apple Watch Series 7 from favourites',
    );

    setProduct(fixture, { isFavorite: false });
    const updated = el.querySelector('.favourite-toggle') as HTMLButtonElement;
    expect(updated.getAttribute('aria-pressed')).toBe('false');
    expect(updated.getAttribute('aria-label')).toBe(
      'Add Apple Watch Series 7 to favourites',
    );
  });

  it('should emit toggleFavourite with product id', () => {
    const spy = vi.fn();
    component.toggleFavourite.subscribe(spy);

    (el.querySelector('.favourite-toggle') as HTMLButtonElement).click();

    expect(spy).toHaveBeenCalledWith('fav-1');
  });

  it('should emit addToCart with product id', () => {
    const spy = vi.fn();
    component.addToCart.subscribe(spy);

    (el.querySelector('.add-to-cart') as HTMLButtonElement).click();

    expect(spy).toHaveBeenCalledWith('fav-1');
  });

  it('should label add-to-cart button with product name', () => {
    const button = el.querySelector('.add-to-cart');
    expect(button?.getAttribute('aria-label')).toBe('Add Apple Watch Series 7 to cart');
  });

  it('should associate article heading via aria-labelledby', () => {
    const article = el.querySelector('article');
    const heading = el.querySelector('.name');
    expect(article?.getAttribute('aria-labelledby')).toBe('favourite-fav-1-heading');
    expect(heading?.id).toBe('favourite-fav-1-heading');
  });
});
