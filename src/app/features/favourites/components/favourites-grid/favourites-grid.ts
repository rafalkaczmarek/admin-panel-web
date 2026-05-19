import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { FavouriteProduct } from '@admin-panel-web/features/favourites/types/favourite-product.interface';
import { FavouriteProductCard } from '@admin-panel-web/features/favourites/components/favourite-product-card/favourite-product-card';

@Component({
  selector: 'app-favourites-grid',
  imports: [FavouriteProductCard],
  templateUrl: './favourites-grid.html',
  styleUrl: './favourites-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavouritesGrid {
  public readonly products = input.required<FavouriteProduct[]>();

  public readonly toggleFavourite = output<string>();
  public readonly addToCart = output<string>();
}
