import { Injectable, signal } from '@angular/core';
import { authClient } from '../../../lib/auth-client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sessionSignal = signal<{ user: AuthUser } | null | undefined>(undefined);

  readonly session = this.sessionSignal.asReadonly();

  async init() {
    try {
      const { data } = await authClient.getSession();
      this.sessionSignal.set(data);
    } catch {
      this.sessionSignal.set(null);
    }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await authClient.signIn.email({ email, password });
    if (data) {
      this.sessionSignal.set({ user: data.user });
    }
    return { data, error };
  }

  async signUp(name: string, email: string, password: string) {
    const { data, error } = await authClient.signUp.email({ name, email, password });
    if (data) {
      this.sessionSignal.set({ user: data.user });
    }
    return { data, error };
  }

  async signOut() {
    await authClient.signOut();
    this.sessionSignal.set(null);
  }
}
