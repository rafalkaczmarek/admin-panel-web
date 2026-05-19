export interface FavouriteProduct {
  readonly id: string;
  readonly image: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly price: number;
  readonly originalPrice: number | null;
  readonly availableColors: string[];
  readonly isFavorite: boolean;
}
