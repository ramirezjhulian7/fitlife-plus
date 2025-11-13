import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DatabaseService, User } from './database.service';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false
  });

  public authState$ = this.authState.asObservable();

  constructor(private dbService: DatabaseService) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    // Check if user session is stored in localStorage and not expired
    const storedSession = localStorage.getItem('fitlife-session');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        if (session.expiresAt > Date.now()) {
          this.authState.next({
            isAuthenticated: true,
            user: session.user,
            loading: false
          });
        } else {
          // Session expired, remove it
          localStorage.removeItem('fitlife-session');
        }
      } catch (error) {
        console.error('Error parsing stored session:', error);
        localStorage.removeItem('fitlife-session');
      }
    }
  }

  async register(email: string, password: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
    // Validation
    if (!email || !password || !confirmPassword) {
      return { success: false, message: 'Todos los campos son obligatorios' };
    }

    if (!this.isValidEmail(email)) {
      return { success: false, message: 'El formato del correo no es válido' };
    }

    if (password.length < 8) {
      return { success: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Las contraseñas no coinciden' };
    }

    this.setLoading(true);

    try {
      const result = await this.dbService.registerUser(email, password);
      
      if (result.success && result.userId) {
        // Auto-login after successful registration
        const loginResult = await this.dbService.loginUser(email, password);
        if (loginResult.success && loginResult.user) {
          this.setAuthenticatedUser(loginResult.user);
          return { success: true, message: 'Cuenta creada exitosamente' };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Error durante el registro' };
    } finally {
      this.setLoading(false);
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    // Validation
    if (!email || !password) {
      return { success: false, message: 'Correo y contraseña son obligatorios' };
    }

    if (!this.isValidEmail(email)) {
      return { success: false, message: 'El formato del correo no es válido' };
    }

    this.setLoading(true);

    try {
      const result = await this.dbService.loginUser(email, password);
      
      if (result.success && result.user) {
        this.setAuthenticatedUser(result.user);
        return { success: true, message: 'Login exitoso' };
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Error durante el login' };
    } finally {
      this.setLoading(false);
    }
  }

  logout(): void {
    localStorage.removeItem('fitlife-session');
    this.authState.next({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  }

  private setAuthenticatedUser(user: User): void {
    const expiresAt = Date.now() + (3 * 24 * 60 * 60 * 1000); // 3 days in milliseconds
    const session = { user, expiresAt };
    localStorage.setItem('fitlife-session', JSON.stringify(session));
    this.authState.next({
      isAuthenticated: true,
      user: user,
      loading: false
    });
  }

  private setLoading(loading: boolean): void {
    const currentState = this.authState.value;
    this.authState.next({
      ...currentState,
      loading
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Getters for easy access
  get isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  get currentUser(): User | null {
    return this.authState.value.user;
  }

  get isLoading(): boolean {
    return this.authState.value.loading;
  }
}