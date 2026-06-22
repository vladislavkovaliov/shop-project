import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home), canActivate: [authGuard] },
  { path: 'products', loadComponent: () => import('./pages/products/products').then(m => m.Products), canActivate: [authGuard] },
  { path: 'orders', loadComponent: () => import('./pages/orders/orders').then(m => m.Orders), canActivate: [authGuard] },
  { path: 'categories', loadComponent: () => import('./pages/categories/categories').then(m => m.Categories), canActivate: [authGuard] },
  { path: 'users', loadComponent: () => import('./pages/users/users').then(m => m.Users), canActivate: [authGuard] },
  { path: 'login', component: Login },
];
