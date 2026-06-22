import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  path: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [MatIcon, MatMenuModule, RouterLink, RouterLinkActive],
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

  private authService = inject(AuthService);
  private router = inject(Router);

  protected user = this.authService.session;

  protected async signOut() {
    await this.authService.signOut();
    await this.router.navigate(['/login']);
  }
}
