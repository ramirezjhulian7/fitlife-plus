import { Injectable } from '@angular/core';

export interface User {
  id?: number;
  email: string;
  password: string;
  created_at?: string;
}

interface StoredDatabase {
  users: User[];
}

@Injectable({
  providedIn: 'root'
})
export class SimpleDbService {
  private db: StoredDatabase | null = null;
  private readonly DB_KEY = 'fitlife-db';
  private isReady = false;

  constructor() {}

  async initialize(): Promise<void> {
    if (this.isReady) return;

    try {
      console.log('Initializing simple database...');
      
      // Load from localStorage or create new
      const saved = localStorage.getItem(this.DB_KEY);
      if (saved) {
        console.log('Loading database from localStorage');
        this.db = JSON.parse(saved);
      } else {
        console.log('Creating new database');
        this.db = {
          users: []
        };
        this.save();
      }

      this.isReady = true;
      console.log('Simple database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private save(): void {
    if (!this.db) return;
    try {
      localStorage.setItem(this.DB_KEY, JSON.stringify(this.db));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  async registerUser(email: string, password: string): Promise<{ success: boolean; message: string; userId?: number }> {
    await this.ensureInitialized();

    try {
      console.log('Registering user:', email);

      // Check if user already exists
      const existingUser = this.db!.users.find(u => u.email === email);
      if (existingUser) {
        return { success: false, message: 'El correo ya está registrado' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create new user
      const userId = this.db!.users.length > 0 
        ? Math.max(...this.db!.users.map(u => u.id || 0)) + 1 
        : 1;

      const newUser: User = {
        id: userId,
        email,
        password: hashedPassword,
        created_at: new Date().toISOString()
      };

      this.db!.users.push(newUser);
      this.save();

      console.log('User registered successfully with ID:', userId);
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        userId
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, message: 'Error en el registro' };
    }
  }

  async loginUser(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    await this.ensureInitialized();

    try {
      console.log('Logging in user:', email);

      const user = this.db!.users.find(u => u.email === email);
      if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return { success: false, message: 'Contraseña incorrecta' };
      }

      console.log('User logged in successfully');
      return {
        success: true,
        message: 'Login exitoso',
        user: { id: user.id, email: user.email, password: user.password, created_at: user.created_at }
      };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, message: 'Error en el login' };
    }
  }

  async getAllUsers(): Promise<User[]> {
    await this.ensureInitialized();

    try {
      return this.db!.users.map(u => ({
        id: u.id,
        email: u.email,
        password: '',
        created_at: u.created_at
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hashedPassword;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isReady) return;
    await this.initialize();
  }
}
