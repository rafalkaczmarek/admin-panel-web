import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FavouriteProduct } from '@admin-panel-web/features/favourites/types/favourite-product.interface';

type StarState = 'full' | 'half' | 'empty';

const TOTAL_STARS = 5;
const COLOR_NAME_BY_HEX: Record<string, string> = {
  '#333333': 'Black',
  '#4880ff': 'Blue',
  '#00b69b': 'Green',
  '#f93c65': 'Red',
  '#ff9f43': 'Orange',
  '#ffffff': 'White',
};

@Component({
  selector: 'app-favourite-product-card',
  imports: [CurrencyPipe, MatButtonModule, MatIconModule],
  templateUrl: './favourite-product-card.html',
  styleUrl: './favourite-product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavouriteProductCard {
  public readonly product = input.required<FavouriteProduct>();

  public readonly toggleFavourite = output<string>();
  public readonly addToCart = output<string>();

  protected readonly cardHeadingId = computed(() => `favourite-${this.product().id}-heading`);

  protected readonly stars = computed<StarState[]>(() => {
    const rating = Math.max(0, Math.min(TOTAL_STARS, this.product().rating));
    const states: StarState[] = [];
    for (let index = 1; index <= TOTAL_STARS; index += 1) {
      if (rating >= index) {
        states.push('full');
      } else if (rating >= index - 0.5) {
        states.push('half');
      } else {
        states.push('empty');
      }
    }
    return states;
  });

  protected readonly ratingAriaLabel = computed(
    () =>
      `${this.product().rating} out of ${TOTAL_STARS} stars, ${this.product().reviewCount} reviews`,
  );

  protected readonly hasDiscount = computed(() => {
    const product = this.product();
    return product.originalPrice !== null && product.originalPrice > product.price;
  });

  protected readonly favouriteAriaLabel = computed(() =>
    this.product().isFavorite
      ? `Remove ${this.product().name} from favourites`
      : `Add ${this.product().name} to favourites`,
  );

  protected readonly colorsAriaLabel = computed(
    () =>
      `Available colors: ${this.product()
        .availableColors.map((color) => this.colorName(color))
        .join(', ')}`,
  );

  protected onToggleFavourite(): void {
    this.toggleFavourite.emit(this.product().id);
  }

  protected onAddToCart(): void {
    this.addToCart.emit(this.product().id);
  }

  protected starIconClass(state: StarState): string {
    if (state === 'full') {
      return 'las la-star';
    }
    if (state === 'half') {
      return 'las la-star-half-alt';
    }
    return 'lar la-star';
  }

  private colorName(hex: string): string {
    return COLOR_NAME_BY_HEX[hex.toLowerCase()] ?? hex;
  }
}
