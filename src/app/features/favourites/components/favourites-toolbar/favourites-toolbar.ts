import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { SortDirection } from '@angular/material/sort';

import {
  FAVOURITE_PRODUCT_SORTABLE_COLUMNS,
  FavouriteProductSortableColumn,
  isFavouriteProductSortableColumn,
} from '@admin-panel-web/features/favourites/types/favourite-product-sortable-column.type';

export interface FavouritesSortChange {
  readonly active: FavouriteProductSortableColumn | '';
  readonly direction: SortDirection;
}

interface SortOption {
  readonly value: string;
  readonly label: string;
  readonly column: FavouriteProductSortableColumn | '';
  readonly direction: SortDirection;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'default', label: 'Default order', column: '', direction: '' },
  { value: 'name-asc', label: 'Name (A-Z)', column: 'name', direction: 'asc' },
  { value: 'name-desc', label: 'Name (Z-A)', column: 'name', direction: 'desc' },
  { value: 'price-asc', label: 'Price (low to high)', column: 'price', direction: 'asc' },
  { value: 'price-desc', label: 'Price (high to low)', column: 'price', direction: 'desc' },
  { value: 'rating-desc', label: 'Highest rated', column: 'rating', direction: 'desc' },
  { value: 'reviewCount-desc', label: 'Most reviewed', column: 'reviewCount', direction: 'desc' },
];

const ALL_CATEGORIES_VALUE = 'all';

@Component({
  selector: 'app-favourites-toolbar',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './favourites-toolbar.html',
  styleUrl: './favourites-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavouritesToolbar {
  public readonly categories = input.required<string[]>();
  public readonly selectedCategory = input<string>(ALL_CATEGORIES_VALUE);
  public readonly selectedSort = input<string>('default');

  public readonly searchChange = output<string>();
  public readonly sortChange = output<FavouritesSortChange>();
  public readonly categoryChange = output<string>();

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly allCategoriesValue = ALL_CATEGORIES_VALUE;
  protected readonly sortableColumns = FAVOURITE_PRODUCT_SORTABLE_COLUMNS;

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  protected onSortChange(event: MatSelectChange): void {
    const selected = this.sortOptions.find((option) => option.value === event.value);
    if (!selected) {
      return;
    }
    const active =
      selected.column !== '' && isFavouriteProductSortableColumn(selected.column)
        ? selected.column
        : '';
    this.sortChange.emit({ active, direction: selected.direction });
  }

  protected onCategoryChange(event: MatSelectChange): void {
    this.categoryChange.emit(event.value as string);
  }
}
