import { FavouriteProduct } from '@admin-panel-web/features/favourites/types/favourite-product.interface';
import { getFavouriteProductSortValue } from '@admin-panel-web/features/favourites/utils/favourite-product-sort-value.util';

const ROW: FavouriteProduct = {
  id: 'f1',
  image: '',
  name: 'Alpha',
  description: 'Sample description.',
  category: 'Gadgets',
  rating: 4.2,
  reviewCount: 100,
  price: 42.5,
  originalPrice: 60,
  availableColors: ['#333333'],
  isFavorite: true,
};

describe('getFavouriteProductSortValue', () => {
  it('should return name for active name', () => {
    expect(getFavouriteProductSortValue(ROW, 'name')).toBe('Alpha');
  });

  it('should return price for active price', () => {
    expect(getFavouriteProductSortValue(ROW, 'price')).toBe(42.5);
  });

  it('should return rating for active rating', () => {
    expect(getFavouriteProductSortValue(ROW, 'rating')).toBe(4.2);
  });

  it('should return reviewCount for active reviewCount', () => {
    expect(getFavouriteProductSortValue(ROW, 'reviewCount')).toBe(100);
  });

  it('should return empty string for unknown active key', () => {
    expect(getFavouriteProductSortValue(ROW, 'unknown')).toBe('');
  });
});
