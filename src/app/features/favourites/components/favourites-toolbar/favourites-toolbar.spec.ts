import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  FavouritesSortChange,
  FavouritesToolbar,
} from '@admin-panel-web/features/favourites/components/favourites-toolbar/favourites-toolbar';

describe('FavouritesToolbar', () => {
  let component: FavouritesToolbar;
  let fixture: ComponentFixture<FavouritesToolbar>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavouritesToolbar],
    }).compileComponents();

    fixture = TestBed.createComponent(FavouritesToolbar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categories', ['Electronic', 'Fashion']);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit searchChange on input', () => {
    const spy = vi.fn();
    component.searchChange.subscribe(spy);

    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'apple';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith('apple');
  });

  it('should emit sortChange with mapped active column and direction', () => {
    const events: FavouritesSortChange[] = [];
    component.sortChange.subscribe((event) => events.push(event));

    component['onSortChange']({ value: 'price-desc' } as never);
    component['onSortChange']({ value: 'name-asc' } as never);
    component['onSortChange']({ value: 'default' } as never);

    expect(events).toEqual([
      { active: 'price', direction: 'desc' },
      { active: 'name', direction: 'asc' },
      { active: '', direction: '' },
    ]);
  });

  it('should emit categoryChange with the selected value', () => {
    const spy = vi.fn();
    component.categoryChange.subscribe(spy);

    component['onCategoryChange']({ value: 'Electronic' } as never);
    component['onCategoryChange']({ value: 'all' } as never);

    expect(spy).toHaveBeenNthCalledWith(1, 'Electronic');
    expect(spy).toHaveBeenNthCalledWith(2, 'all');
  });

  it('should ignore unknown sort values', () => {
    const spy = vi.fn();
    component.sortChange.subscribe(spy);

    component['onSortChange']({ value: 'totally-unknown' } as never);

    expect(spy).not.toHaveBeenCalled();
  });
});
