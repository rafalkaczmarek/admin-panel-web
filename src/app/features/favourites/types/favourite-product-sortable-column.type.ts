export const FAVOURITE_PRODUCT_SORTABLE_COLUMNS = [
  'name',
  'price',
  'rating',
  'reviewCount',
] as const;

export type FavouriteProductSortableColumn = (typeof FAVOURITE_PRODUCT_SORTABLE_COLUMNS)[number];

export function isFavouriteProductSortableColumn(
  value: string,
): value is FavouriteProductSortableColumn {
  return (FAVOURITE_PRODUCT_SORTABLE_COLUMNS as readonly string[]).includes(value);
}
