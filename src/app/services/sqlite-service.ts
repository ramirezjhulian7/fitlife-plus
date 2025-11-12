import { Injectable } from '@angular/core';

declare var initSqlJs: any;

export interface User {
  id?: number;
  email: string;
  password: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  private db: any = null;
  private sqlPromise: Promise<any> | null = null;
  private isReady = false;

  constructor() {}

  async initialize(): Promise<void> {
    if (this.isReady) return;
    
    try {
      console.log('Initializing sql.js...');
      
      // Load sql.js from CDN
      const script = document.createElement('script');
      script.src = 'https://sql.js.org/dist/sql-wasm.js';
      script.async = true;
      
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load sql.js from CDN'));
        document.head.appendChild(script);
      });

      // Initialize SQL.js
      const SQL = await (window as any).initSqlJs();
      
      // Try to load existing database from localStorage
      const savedData = localStorage.getItem('fitlife-db');
      if (savedData) {
        console.log('Loading database from localStorage');
        const buffer = new Uint8Array(JSON.parse(savedData));
        this.db = new SQL.Database(buffer);
      } else {
        console.log('Creating new database');
        this.db = new SQL.Database();
      }

      // Create users table if it doesn't exist
      await this.createTables();
      
      this.isReady = true;
      console.log('sql.js initialized successfully');
    } catch (error) {
      console.error('Error initializing sql.js:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      this.db.run(createUsersTable);
      this.saveDatabase();
      console.log('Users table created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  private saveDatabase(): void {
    if (!this.db) return;
    
    try {
      // Save database to localStorage
      const data = this.db.export();
      const buffer = Array.from(data);
      localStorage.setItem('fitlife-db', JSON.stringify(buffer));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  async registerUser(email: string, password: string): Promise<{ success: boolean; message: string; userId?: number }> {
    await this.ensureInitialized();

    try {
      console.log('Registering user:', email);

      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        return { success: false, message: 'El correo ya está registrado' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Insert new user
      const insertQuery = `INSERT INTO users (email, password) VALUES (?, ?)`;
      this.db!.run(insertQuery, [email, hashedPassword]);
      
      // Get the inserted user ID
      const result = this.db!.exec(`SELECT last_insert_rowid() as id`);
      const userId = result[0]?.values[0]?.[0] as number;

      this.saveDatabase();

      if (userId) {
        console.log('User registered successfully with ID:', userId);
        return {
          success: true,
          message: 'Usuario registrado exitosamente',
          userId
        };
      } else {
        return { success: false, message: 'Error al registrar usuario' };
      }
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, message: 'Error en el registro' };
    }
  }

  async loginUser(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    await this.ensureInitialized();

    try {
      console.log('Logging in user:', email);

      const user = await this.getUserByEmail(email);
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

  private async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) return null;

    try {
      const result = this.db.exec('SELECT * FROM users WHERE email = ?', [email]);
      
      if (result.length > 0 && result[0].values.length > 0) {
        const [id, userEmail, password, created_at] = result[0].values[0];
        return {
          id: id as number,
          email: userEmail as string,
          password: password as string,
          created_at: created_at as string
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
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

  async getAllUsers(): Promise<User[]> {
    await this.ensureInitialized();

    try {
      const result = this.db!.exec('SELECT id, email, created_at FROM users');
      
      if (result.length === 0) return [];

      return result[0].values.map(([id, email, created_at]: any[]) => ({
        id: id as number,
        email: email as string,
        password: '',
        created_at: created_at as string
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isReady) return;
    await this.initialize();
  }
}
