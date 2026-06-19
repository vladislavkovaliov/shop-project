import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '@components/sidebar/sidebar';
import { AuthService } from '@app/services/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private authService = inject(AuthService);

  readonly isLoggedIn = computed(() => !!this.authService.session());

  ngOnInit() {
    this.authService.init();
  }
}
