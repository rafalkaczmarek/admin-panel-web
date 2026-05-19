import { Routes } from '@angular/router';

import { authGuard } from '@admin-panel-web/features/auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    loadChildren: () =>
      import('@admin-panel-web/features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'logout',
    pathMatch: 'full',
    loadComponent: () =>
      import('@admin-panel-web/features/auth/pages/logout-page/logout-page').then(
        (m) => m.LogoutPage,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@admin-panel-web/features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },
  {
    path: 'products-stock',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@admin-panel-web/features/products-stock/products-stock.routes').then(
        (m) => m.productsStockRoutes,
      ),
  },
  {
    path: 'favourites',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@admin-panel-web/features/favourites/favourites.routes').then(
        (m) => m.favouritesRoutes,
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];
