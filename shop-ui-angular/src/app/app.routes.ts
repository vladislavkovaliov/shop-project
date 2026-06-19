import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import { Orders } from './pages/orders/orders';
import { Categories } from './pages/categories/categories';
import { Users } from './pages/users/users';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', component: Products },
  { path: 'orders', component: Orders, canActivate: [authGuard] },
  { path: 'categories', component: Categories },
  { path: 'users', component: Users, canActivate: [authGuard] },
  { path: 'login', component: Login },
];
