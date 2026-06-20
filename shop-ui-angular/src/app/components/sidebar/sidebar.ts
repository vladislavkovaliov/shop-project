import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  path: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [MatIcon, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  protected readonly menuItems: MenuItem[] = [
    { icon: 'inventory_2', label: 'Products', path: '/products' },
    { icon: 'shopping_cart', label: 'Orders', path: '/orders' },
    { icon: 'category', label: 'Categories', path: '/categories' },
    { icon: 'group', label: 'Users', path: '/users' },
  ];

}
