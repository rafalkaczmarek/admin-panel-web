import { FavouriteProduct } from '@admin-panel-web/features/favourites/types/favourite-product.interface';
import {
  type FavouriteProductSortableColumn,
  isFavouriteProductSortableColumn,
} from '@admin-panel-web/features/favourites/types/favourite-product-sortable-column.type';

const SORT_VALUE_BY_COLUMN: Record<
  FavouriteProductSortableColumn,
  (row: FavouriteProduct) => string | number
> = {
  name: (row) => row.name,
  price: (row) => row.price,
  rating: (row) => row.rating,
  reviewCount: (row) => row.reviewCount,
};

export function getFavouriteProductSortValue(
  row: FavouriteProduct,
  active: string,
): string | number {
  if (!isFavouriteProductSortableColumn(active)) {
    return '';
  }
  return SORT_VALUE_BY_COLUMN[active](row);
}
