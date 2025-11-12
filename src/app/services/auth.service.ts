import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SimpleDbService, User } from './simple-db.service';

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

  constructor(private dbService: SimpleDbService) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('fitlife-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.authState.next({
          isAuthenticated: true,
          user: user,
          loading: false
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('fitlife-user');
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
    localStorage.removeItem('fitlife-user');
    this.authState.next({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  }

  private setAuthenticatedUser(user: User): void {
    localStorage.setItem('fitlife-user', JSON.stringify(user));
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