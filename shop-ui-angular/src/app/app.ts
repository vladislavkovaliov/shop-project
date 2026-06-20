import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { SidebarComponent } from '@components/sidebar/sidebar';
import { AuthService } from '@app/services/auth/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);

  protected isLoginRoute = signal(this.location.path() === '/login');

  constructor() {
     this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => this.isLoginRoute.set(e.urlAfterRedirects === '/login'));
  }


  ngOnInit() {
    this.authService.init();
  }
}
