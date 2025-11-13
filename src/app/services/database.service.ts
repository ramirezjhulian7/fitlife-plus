import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface User {
  id?: number;
  email: string;
  password: string;
  created_at?: string;
}

export interface UserProfile {
  id?: number;
  user_id: number;
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  goal: string; // 'lose_weight', 'gain_weight', 'maintain_weight'
  workout_frequency?: number; // times per week
  workout_reminder: boolean;
  meal_reminder: boolean;
  water_reminder: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Don't initialize here, do it lazily
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = this.initializeDatabase();
    return this.initPromise;
  }

  private async initializeDatabase(): Promise<void> {
    if (this.isInitialized) return;

    // Set a timeout for the entire initialization
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database initialization timeout')), 10000);
    });

    const initPromise = this.doInitializeDatabase();
    
    try {
      await Promise.race([initPromise, timeoutPromise]);
    } catch (error) {
      console.error('Database initialization failed or timed out:', error);
      // Reset the promise so it can be retried
      this.initPromise = null;
      throw error;
    }
  }

  private async doInitializeDatabase(): Promise<void> {
    console.log('Starting database initialization...');
    
    // For web platform, ensure jeep-sqlite is loaded
    if (Capacitor.getPlatform() === 'web') {
      await this.ensureJeepSqliteLoaded();
    }

    console.log('Creating database connection...');
    // Create database connection
    this.db = await this.sqlite.createConnection(
      'fitlife_db',
      false,
      'no-encryption',
      1,
      false
    );

    console.log('Opening database...');
    // Open database
    await this.db.open();

    console.log('Creating tables...');
    // Create users table
    await this.createTables();
    
    this.isInitialized = true;
    console.log('Database initialized successfully');
  }

  private async ensureJeepSqliteLoaded(): Promise<void> {
    console.log('Ensuring jeep-sqlite is loaded...');
    
    // Set a timeout for the entire process
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('jeep-sqlite loading timeout')), 5000);
    });

    const loadPromise = this.doLoadJeepSqlite();
    
    try {
      await Promise.race([loadPromise, timeoutPromise]);
    } catch (error) {
      console.warn('jeep-sqlite loading failed or timed out:', error);
      // Continue anyway
    }
  }

  private async doLoadJeepSqlite(): Promise<void> {
    // Check if jeep-sqlite element exists
    let jeepElement = document.querySelector('jeep-sqlite');
    if (!jeepElement) {
      console.log('Adding jeep-sqlite element to DOM');
      jeepElement = document.createElement('jeep-sqlite');
      document.body.appendChild(jeepElement);
    }

    // Try to initialize web store directly - sometimes it works without explicit loader
    try {
      console.log('Initializing web store...');
      await CapacitorSQLite.initWebStore();
      console.log('Web store initialized');
      return;
    } catch (error) {
      console.warn('Failed to init web store without loader:', error);
    }

    // If that failed, try importing the loader
    if (!customElements.get('jeep-sqlite')) {
      console.log('jeep-sqlite not defined, importing loader...');
      try {
        await import('jeep-sqlite/loader');
        console.log('jeep-sqlite loader imported');
        // Wait a bit for it to register
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Waited for jeep-sqlite registration');
      } catch (importError) {
        console.warn('Failed to load jeep-sqlite loader:', importError);
        // Continue anyway, might work without it
      }
    } else {
      console.log('jeep-sqlite already defined');
    }

    // Try initializing web store again
    try {
      console.log('Initializing web store again...');
      await CapacitorSQLite.initWebStore();
      console.log('Web store initialized');
    } catch (error) {
      console.warn('Failed to init web store:', error);
      // Continue anyway - some operations might work
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
      );
    `;

    const createUserProfilesTable = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        height REAL NOT NULL,
        weight REAL NOT NULL,
        goal TEXT NOT NULL,
        workout_frequency INTEGER DEFAULT 3,
        workout_reminder BOOLEAN DEFAULT 1,
        meal_reminder BOOLEAN DEFAULT 1,
        water_reminder BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id)
      );
    `;

    try {
      await this.db.execute(createUsersTable);
      console.log('Users table created successfully');
      
      await this.db.execute(createUserProfilesTable);
      console.log('User profiles table created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  async registerUser(email: string, password: string): Promise<{ success: boolean; message: string; userId?: number }> {
    await this.ensureInitialized();

    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        return { success: false, message: 'El correo ya está registrado' };
      }

      // Hash password (in production, use proper hashing like bcrypt)
      const hashedPassword = await this.hashPassword(password);

      // Insert new user
      const result = await this.db!.run(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword]
      );

      if (result.changes && result.changes.lastId) {
        return { 
          success: true, 
          message: 'Usuario registrado exitosamente',
          userId: result.changes.lastId 
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
      const user = await this.getUserByEmail(email);
      if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return { success: false, message: 'Contraseña incorrecta' };
      }

      // Remove password from returned user object
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        success: true,
        message: 'Login exitoso',
        user: userWithoutPassword as User
      };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, message: 'Error en el login' };
    }
  }

  private async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) return null;

    try {
      const result = await this.db.query('SELECT * FROM users WHERE email = ?', [email]);
      
      if (result.values && result.values.length > 0) {
        return result.values[0] as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    // Simple hash for demo - in production use proper hashing library
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
      const result = await this.db!.query('SELECT id, email, created_at FROM users');
      return result.values || [];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  // User Profile methods
  async createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; message: string; profileId?: number }> {
    await this.ensureInitialized();

    try {
      const result = await this.db!.run(
        `INSERT INTO user_profiles (user_id, name, age, height, weight, goal, workout_frequency, workout_reminder, meal_reminder, water_reminder)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profile.user_id,
          profile.name,
          profile.age,
          profile.height,
          profile.weight,
          profile.goal,
          profile.workout_frequency || 3,
          profile.workout_reminder ? 1 : 0,
          profile.meal_reminder ? 1 : 0,
          profile.water_reminder ? 1 : 0
        ]
      );

      if (result.changes && result.changes.lastId) {
        return {
          success: true,
          message: 'Perfil creado exitosamente',
          profileId: result.changes.lastId
        };
      } else {
        return { success: false, message: 'Error al crear perfil' };
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { success: false, message: 'Error al crear perfil' };
    }
  }

  async getUserProfile(userId: number): Promise<UserProfile | null> {
    await this.ensureInitialized();

    try {
      const result = await this.db!.query(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [userId]
      );

      if (result.values && result.values.length > 0) {
        const profile = result.values[0] as any;
        return {
          ...profile,
          workout_reminder: Boolean(profile.workout_reminder),
          meal_reminder: Boolean(profile.meal_reminder),
          water_reminder: Boolean(profile.water_reminder)
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: number, updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at'>>): Promise<{ success: boolean; message: string }> {
    await this.ensureInitialized();

    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          values.push(typeof value === 'boolean' ? (value ? 1 : 0) : value);
        }
      });

      if (updateFields.length === 0) {
        return { success: false, message: 'No hay campos para actualizar' };
      }

      // Always update the updated_at timestamp
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId);

      const query = `UPDATE user_profiles SET ${updateFields.join(', ')} WHERE user_id = ?`;

      const result = await this.db!.run(query, values);

      if (result.changes && result.changes.changes && result.changes.changes > 0) {
        return { success: true, message: 'Perfil actualizado exitosamente' };
      } else {
        return { success: false, message: 'Perfil no encontrado o no se pudo actualizar' };
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, message: 'Error al actualizar perfil' };
    }
  }

  async updateProfilePreferences(userId: number, preferences: { workout_reminder?: boolean; meal_reminder?: boolean; water_reminder?: boolean }): Promise<{ success: boolean; message: string }> {
    return this.updateUserProfile(userId, preferences);
  }

  async updateWorkoutPreferences(userId: number, workoutFrequency: number): Promise<{ success: boolean; message: string }> {
    return this.updateUserProfile(userId, { workout_frequency: workoutFrequency });
  }
}