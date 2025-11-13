import { Injectable } from '@angular/core';

export interface User {
  id: number;
  email: string;
  password: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
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
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly USERS_KEY = 'fitlife_users';
  private readonly PROFILES_KEY = 'fitlife_profiles';
  private nextUserId = 1;
  private nextProfileId = 1;

  constructor() {
    this.initializeIds();
  }

  private initializeIds(): void {
    // Initialize next IDs from localStorage
    const users = this.getUsersFromStorage();
    if (users.length > 0) {
      this.nextUserId = Math.max(...users.map((u: User) => u.id)) + 1;
    }

    const profiles = this.getAllProfiles();
    if (profiles.length > 0) {
      this.nextProfileId = Math.max(...profiles.map((p: UserProfile) => p.id)) + 1;
    }
  }

  private getUsersFromStorage(): User[] {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveAllUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private getAllProfiles(): UserProfile[] {
    const profilesJson = localStorage.getItem(this.PROFILES_KEY);
    return profilesJson ? JSON.parse(profilesJson) : [];
  }

  private saveAllProfiles(profiles: UserProfile[]): void {
    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
  }

  async registerUser(email: string, password: string): Promise<{ success: boolean; message: string; userId?: number }> {
    try {
      const users = this.getUsersFromStorage();

      // Check if user already exists
      const existingUser = users.find((u: User) => u.email === email);
      if (existingUser) {
        return { success: false, message: 'El correo ya está registrado' };
      }

      // Hash password (in production, use proper hashing like bcrypt)
      const hashedPassword = await this.hashPassword(password);

      // Create new user
      const newUser: User = {
        id: this.nextUserId++,
        email,
        password: hashedPassword,
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      this.saveAllUsers(users);

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        userId: newUser.id
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, message: 'Error en el registro' };
    }
  }

  async loginUser(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = this.getUsersFromStorage();
      const user = users.find((u: User) => u.email === email);

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

  // User Profile methods
  async createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; message: string; profileId?: number }> {
    try {
      const profiles = this.getAllProfiles();

      // Check if profile already exists for this user
      const existingProfile = profiles.find(p => p.user_id === profile.user_id);
      if (existingProfile) {
        return { success: false, message: 'El perfil ya existe para este usuario' };
      }

      const now = new Date().toISOString();
      const newProfile: UserProfile = {
        id: this.nextProfileId++,
        ...profile,
        workout_frequency: profile.workout_frequency || 3,
        created_at: now,
        updated_at: now
      };

      profiles.push(newProfile);
      this.saveAllProfiles(profiles);

      return {
        success: true,
        message: 'Perfil creado exitosamente',
        profileId: newProfile.id
      };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { success: false, message: 'Error al crear perfil' };
    }
  }

  async getUserProfile(userId: number): Promise<UserProfile | null> {
    try {
      const profiles = this.getAllProfiles();
      const profile = profiles.find(p => p.user_id === userId);

      return profile || null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: number, updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at'>>): Promise<{ success: boolean; message: string }> {
    try {
      const profiles = this.getAllProfiles();
      const profileIndex = profiles.findIndex(p => p.user_id === userId);

      if (profileIndex === -1) {
        return { success: false, message: 'Perfil no encontrado' };
      }

      // Update the profile
      profiles[profileIndex] = {
        ...profiles[profileIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      this.saveAllProfiles(profiles);

      return { success: true, message: 'Perfil actualizado exitosamente' };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, message: 'Error al actualizar perfil' };
    }
  }

  async updateProfilePreferences(userId: number, preferences: { workout_reminder?: boolean; meal_reminder?: boolean; water_reminder?: boolean }): Promise<{ success: boolean; message: string }> {
    try {
      // First check if profile exists
      const existingProfile = await this.getUserProfile(userId);

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);

          const profileData = {
            user_id: userId,
            name: userData.name || 'Usuario',
            age: userData.age || 28,
            height: userData.height || 170,
            weight: userData.weight || this.getCurrentWeight(),
            goal: userData.goal || 'lose_weight',
            workout_frequency: userData.workoutFrequency || 3,
            workout_reminder: preferences.workout_reminder ?? true,
            meal_reminder: preferences.meal_reminder ?? true,
            water_reminder: preferences.water_reminder ?? false
          };

          const createResult = await this.createUserProfile(profileData);
          if (createResult.success) {
            return { success: true, message: 'Perfil creado y preferencias actualizadas exitosamente' };
          } else {
            return { success: false, message: 'Error al crear perfil' };
          }
        } else {
          return { success: false, message: 'No se encontraron datos de usuario para crear perfil' };
        }
      } else {
        // Update existing profile
        return this.updateUserProfile(userId, preferences);
      }
    } catch (error) {
      console.error('Error updating profile preferences:', error);
      return { success: false, message: 'Error al actualizar preferencias' };
    }
  }

  private getCurrentWeight(): number {
    // Get current weight from the last entry in weightHistory
    const weightHistoryString = localStorage.getItem('weightHistory');
    if (weightHistoryString) {
      try {
        const weightHistory = JSON.parse(weightHistoryString);
        if (weightHistory && weightHistory.length > 0) {
          // Return the most recent weight entry
          const sortedHistory = weightHistory.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          return sortedHistory[0].weight;
        }
      } catch (error) {
        console.error('Error parsing weight history:', error);
      }
    }

    // Fallback to userData weight or default
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        return userData.weight || 73.2;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    return 73.2; // Default weight
  }

  async updateWorkoutPreferences(userId: number, workoutFrequency: number): Promise<{ success: boolean; message: string }> {
    try {
      // First check if profile exists
      const existingProfile = await this.getUserProfile(userId);

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);

          const profileData = {
            user_id: userId,
            name: userData.name || 'Usuario',
            age: userData.age || 28,
            height: userData.height || 170,
            weight: userData.weight || this.getCurrentWeight(),
            goal: userData.goal || 'lose_weight',
            workout_frequency: workoutFrequency,
            workout_reminder: true,
            meal_reminder: true,
            water_reminder: false
          };

          const createResult = await this.createUserProfile(profileData);
          if (createResult.success) {
            return { success: true, message: 'Perfil creado y frecuencia de entrenamiento actualizada exitosamente' };
          } else {
            return { success: false, message: 'Error al crear perfil' };
          }
        } else {
          return { success: false, message: 'No se encontraron datos de usuario para crear perfil' };
        }
      } else {
        // Update existing profile
        return this.updateUserProfile(userId, { workout_frequency: workoutFrequency });
      }
    } catch (error) {
      console.error('Error updating workout preferences:', error);
      return { success: false, message: 'Error al actualizar frecuencia de entrenamiento' };
    }
  }

  // Legacy methods for compatibility
  async getAllUsers(): Promise<User[]> {
    return Promise.resolve(this.getUsersFromStorage());
  }

  async closeDatabase(): Promise<void> {
    // No-op for localStorage implementation
  }
}