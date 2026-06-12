import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import { Orders } from './pages/orders/orders';
import { Categories } from './pages/categories/categories';
import { Users } from './pages/users/users';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', component: Products },
  { path: 'orders', component: Orders },
  { path: 'categories', component: Categories },
  { path: 'users', component: Users },
];
