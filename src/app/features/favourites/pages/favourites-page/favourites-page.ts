import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { PageContent } from '@admin-panel-web/shared/components/page-content/page-content';
import { PageHero } from '@admin-panel-web/shared/components/page-hero/page-hero';
import { FavouritesService } from '@admin-panel-web/features/favourites/services/favourites.service';
import {
  FavouritesSortChange,
  FavouritesToolbar,
} from '@admin-panel-web/features/favourites/components/favourites-toolbar/favourites-toolbar';
import { FavouritesGrid } from '@admin-panel-web/features/favourites/components/favourites-grid/favourites-grid';

@Component({
  selector: 'app-favourites-page',
  imports: [
    MatProgressSpinnerModule,
    MatButtonModule,
    MatPaginatorModule,
    PageContent,
    PageHero,
    FavouritesToolbar,
    FavouritesGrid,
  ],
  templateUrl: './favourites-page.html',
  styleUrl: './favourites-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavouritesPage implements OnInit {
  protected readonly favouritesService = inject(FavouritesService);

  public ngOnInit(): void {
    this.favouritesService.loadFavourites();
  }

  protected retry(): void {
    this.favouritesService.loadFavourites();
  }

  protected onSearch(query: string): void {
    this.favouritesService.search(query);
  }

  protected onSortChange(change: FavouritesSortChange): void {
    this.favouritesService.changeSort(change.active, change.direction);
  }

  protected onCategoryChange(category: string): void {
    this.favouritesService.changeCategory(category === 'all' ? null : category);
  }

  protected onPageChange(event: PageEvent): void {
    this.favouritesService.changePage(event.pageIndex, event.pageSize);
  }

  protected onToggleFavourite(id: string): void {
    this.favouritesService.toggleFavourite(id);
  }

  protected onAddToCart(id: string): void {
    console.log('Add favourite to cart:', id);
  }
}
