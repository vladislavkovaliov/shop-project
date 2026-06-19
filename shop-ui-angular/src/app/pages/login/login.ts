import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [FormsModule, RouterModule],
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  name = '';
  isRegister = false;
  error = '';

  async submit() {
    this.error = '';

    try {
      if (this.isRegister) {
        const { error } = await this.authService.signUp(this.name, this.email, this.password);
        if (error) {
          this.error = error.message || 'Registration failed';
          return;
        }
      } else {
        const { error } = await this.authService.signIn(this.email, this.password);
        if (error) {
          this.error = error.message || 'Invalid credentials';
          return;
        }
      }

      await this.router.navigate(['/']);
    } catch {
      this.error = 'An unexpected error occurred';
    }
  }
}
