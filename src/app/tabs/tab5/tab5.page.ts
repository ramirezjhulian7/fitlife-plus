import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ProgressService } from '../../services/progress.service';
import { AuthService } from '../../services/auth.service';
import { DatabaseService, UserProfile } from '../../services/database.service';
import { Router } from '@angular/router';
import { EditProfileModalComponent } from '../../components/edit-profile-modal/edit-profile-modal.component';
import { WorkoutPreferencesModalComponent } from '../../components/workout-preferences-modal/workout-preferences-modal.component';
import { NutritionPreferencesModalComponent } from '../../components/nutrition-preferences-modal/nutrition-preferences-modal.component';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab5Page implements OnInit {
  userName: string = 'Usuario';
  userEmail: string = '';
  userProfile: UserProfile | null = null;
  isLoading: boolean = true;

  workoutReminder: boolean = true;
  mealReminder: boolean = true;
  waterReminder: boolean = false;

  constructor(
    private progressService: ProgressService,
    private authService: AuthService,
    private databaseService: DatabaseService,
    private router: Router,
    private modalController: ModalController,
    private toastController: ToastController,
    private notificationService: NotificationService
  ) {}

  // Helper methods for user-specific localStorage
  private getUserDataKey(): string {
    const userId = this.authService.currentUser?.id;
    return userId ? `userData_${userId}` : 'userData';
  }

  private getUserData(): any {
    const key = this.getUserDataKey();
    const userDataString = localStorage.getItem(key);
    return userDataString ? JSON.parse(userDataString) : {};
  }

  private saveUserData(data: any): void {
    const key = this.getUserDataKey();
    localStorage.setItem(key, JSON.stringify(data));
  }

  private getWeightHistoryKey(): string {
    const userId = this.authService.currentUser?.id;
    return userId ? `weightHistory_${userId}` : 'weightHistory';
  }

  private getWeightHistory(): any[] {
    const key = this.getWeightHistoryKey();
    const weightHistoryString = localStorage.getItem(key);
    if (weightHistoryString) {
      try {
        return JSON.parse(weightHistoryString);
      } catch (error) {
        console.error('Error parsing weight history:', error);
        return [];
      }
    }
    return [];
  }

  private getNutritionPreferencesKey(): string {
    const userId = this.authService.currentUser?.id;
    return userId ? `nutritionMeals_${userId}` : 'nutritionMeals';
  }

  private getNutritionData(): any {
    const key = this.getNutritionPreferencesKey();
    const nutritionDataString = localStorage.getItem(key);
    if (nutritionDataString) {
      return JSON.parse(nutritionDataString);
    }
    
    // If no user-specific nutrition data, try to load from onboarding
    const onboardingData = this.getOnboardingData();
    if (onboardingData && onboardingData.preferences) {
      // Create nutrition data from onboarding preferences
      const nutritionData = {
        preferences: onboardingData.preferences,
        meals: {},
        created_at: new Date().toISOString()
      };
      
      // Save it to user-specific localStorage
      localStorage.setItem(key, JSON.stringify(nutritionData));
      return nutritionData;
    }
    
    return {};
  }

  private getOnboardingData(): any {
    const onboardingDataString = localStorage.getItem('onboardingData');
    return onboardingDataString ? JSON.parse(onboardingDataString) : null;
  }

  async ngOnInit() {
    await this.loadUserProfile();
    // Initialize notifications after loading profile
    await this.initializeNotifications();
  }

  async loadUserProfile() {
    this.isLoading = true;

    try {
      const currentUser = this.authService.currentUser;
      
      if (currentUser && currentUser.id) {
        // Set user email from authenticated user
        this.userEmail = currentUser.email;
        
        // Try to load profile from database first
        const dbProfile = await this.databaseService.getUserProfile(currentUser.id);
        
        if (dbProfile) {
          // Use database profile data
          this.userProfile = dbProfile;
          this.userName = dbProfile.name;
          
          // Set reminder preferences from database
          this.workoutReminder = dbProfile.workout_reminder;
          this.mealReminder = dbProfile.meal_reminder;
          this.waterReminder = dbProfile.water_reminder;
          
          // Update localStorage to keep it in sync
          const userData = this.getUserData();
          userData.name = dbProfile.name;
          userData.age = dbProfile.age;
          userData.height = dbProfile.height;
          userData.weight = dbProfile.weight;
          userData.goal = dbProfile.goal;
          userData.workoutFrequency = dbProfile.workout_frequency;
          userData.reminders = {
            workoutReminder: this.workoutReminder,
            mealReminder: this.mealReminder,
            waterReminder: this.waterReminder
          };
          this.saveUserData(userData);
          
          // Initialize nutrition preferences from onboarding if not already set
          this.initializeNutritionPreferencesFromOnboarding();
        } else {
          // No database profile, create one from localStorage data
          await this.createProfileIfNeeded(currentUser.id);
          
          // Load from localStorage as fallback
          const userData = this.getUserData();
          this.userName = userData.name || 'Usuario';
          
          // Create profile object from localStorage data
          this.userProfile = {
            id: 1,
            user_id: currentUser.id,
            name: this.userName,
            age: userData.age || 28,
            height: userData.height || 170,
            weight: this.getCurrentWeight(),
            goal: this.mapGoalToDatabase(userData.goal || 'lose_weight'),
            workout_frequency: userData.workoutFrequency || 3,
            workout_reminder: this.workoutReminder,
            meal_reminder: this.mealReminder,
            water_reminder: this.waterReminder,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Load reminder preferences from localStorage
          if (userData.reminders) {
            this.workoutReminder = userData.reminders.workoutReminder ?? true;
            this.mealReminder = userData.reminders.mealReminder ?? true;
            this.waterReminder = userData.reminders.waterReminder ?? false;
          }
        }
      } else {
        // No authenticated user, load from localStorage only
        const userData = this.getUserData();
        this.userName = userData.name || 'Usuario';
        this.userEmail = userData.email || 'usuario@email.com';
        
        // Create profile object from localStorage data
        this.userProfile = {
          id: 1,
          user_id: 1,
          name: this.userName,
          age: userData.age || 28,
          height: userData.height || 170,
          weight: this.getCurrentWeight(),
          goal: this.mapGoalToDatabase(userData.goal || 'lose_weight'),
          workout_frequency: userData.workoutFrequency || 3,
          workout_reminder: this.workoutReminder,
          meal_reminder: this.mealReminder,
          water_reminder: this.waterReminder,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Load reminder preferences from localStorage
        if (userData.reminders) {
          this.workoutReminder = userData.reminders.workoutReminder ?? true;
          this.mealReminder = userData.reminders.mealReminder ?? true;
          this.waterReminder = userData.reminders.waterReminder ?? false;
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async initializeNotifications() {
    try {
      // Request notification permissions on app start
      const hasPermission = await this.notificationService.checkPermissions();
      if (!hasPermission) {
        await this.notificationService.requestPermissions();
      }

      // Update notifications based on current preferences
      await this.notificationService.updateReminders();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private async createProfileIfNeeded(userId: number) {
    try {
      // Get user data from localStorage
      const userData = this.getUserData();
      
      // Get current user email
      const currentUser = this.authService.currentUser;
      const userEmail = currentUser?.email || userData.email || 'usuario@email.com';

      // Create profile with current data
      const profileData = {
        user_id: userId,
        name: userData.name || 'Usuario',
        age: userData.age || 28,
        height: userData.height || 170,
        weight: this.getCurrentWeight(),
        goal: this.mapGoalToDatabase(userData.goal || 'lose_weight'),
        workout_frequency: userData.workoutFrequency || 3,
        workout_reminder: this.workoutReminder,
        meal_reminder: this.mealReminder,
        water_reminder: this.waterReminder
      };

      const result = await this.databaseService.createUserProfile(profileData);
      if (result.success) {
        console.log('Profile created successfully for user:', userId);
        // Update userProfile with the created profile data
        if (this.userProfile) {
          this.userProfile.user_id = userId;
          this.userProfile.name = profileData.name;
          this.userProfile.age = profileData.age;
          this.userProfile.height = profileData.height;
          this.userProfile.weight = profileData.weight;
          this.userProfile.goal = profileData.goal;
          this.userProfile.workout_frequency = profileData.workout_frequency;
        }
        // Update userName and userEmail
        this.userName = profileData.name;
        this.userEmail = userEmail;
        
        // Initialize nutrition preferences from onboarding if available
        this.initializeNutritionPreferencesFromOnboarding();
      } else {
        console.error('Error creating profile:', result.message);
      }
    } catch (error) {
      console.error('Error creating profile if needed:', error);
    }
  }

  private initializeNutritionPreferencesFromOnboarding() {
    try {
      const onboardingData = this.getOnboardingData();
      if (onboardingData && onboardingData.preferences && onboardingData.preferences.length > 0) {
        const nutritionKey = this.getNutritionPreferencesKey();
        const existingNutritionData = localStorage.getItem(nutritionKey);
        
        // Only initialize if no nutrition data exists for this user
        if (!existingNutritionData) {
          const nutritionData = {
            preferences: onboardingData.preferences,
            meals: {},
            created_at: new Date().toISOString()
          };
          
          localStorage.setItem(nutritionKey, JSON.stringify(nutritionData));
          console.log('Nutrition preferences initialized from onboarding for user');
        }
      }
    } catch (error) {
      console.error('Error initializing nutrition preferences from onboarding:', error);
    }
  }

  private mapGoalToDatabase(goal: string): string {
    const goalMap: { [key: string]: string } = {
      'lose_weight': 'lose_weight',
      'gain_weight': 'gain_weight',
      'maintain_weight': 'maintain_weight',
      'Bajar de peso': 'lose_weight',
      'Subir de peso': 'gain_weight',
      'Mantener peso': 'maintain_weight'
    };
    return goalMap[goal] || 'lose_weight';
  }

  async editProfile() {
    const modal = await this.modalController.create({
      component: EditProfileModalComponent,
      componentProps: {}
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'saved') {
        // Reload profile data after successful edit
        this.loadUserProfile();
      }
    });

    return await modal.present();
  }

  async navigateToChallenges() {
    const toast = await this.toastController.create({
      message: 'No disponible en versión offline',
      duration: 2000,
      position: 'bottom',
      color: 'warning'
    });
    await toast.present();
  }

  async navigateToWorkoutPreferences() {
    const modal = await this.modalController.create({
      component: WorkoutPreferencesModalComponent,
      componentProps: {}
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'saved') {
        // Reload profile data after successful save
        this.loadUserProfile();
      }
    });

    return await modal.present();
  }

  async navigateToNutritionPreferences() {
    const modal = await this.modalController.create({
      component: NutritionPreferencesModalComponent,
      componentProps: {}
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'saved') {
        // Reload profile data after successful save
        this.loadUserProfile();
      }
    });

    return await modal.present();
  }

  async onReminderChange() {
    const currentUser = this.authService.currentUser;
    if (!currentUser || !currentUser.id) return;

    try {
      const result = await this.databaseService.updateProfilePreferences(
        currentUser.id,
        {
          workout_reminder: this.workoutReminder,
          meal_reminder: this.mealReminder,
          water_reminder: this.waterReminder
        }
      );

      if (!result.success) {
        console.error('Error updating preferences:', result.message);
        return;
      }

      // Update userProfile with new reminder preferences
      if (this.userProfile) {
        this.userProfile.workout_reminder = this.workoutReminder;
        this.userProfile.meal_reminder = this.mealReminder;
        this.userProfile.water_reminder = this.waterReminder;
      }

      // Also save reminder preferences to localStorage
      const userData = this.getUserData();
      userData.reminders = {
        workoutReminder: this.workoutReminder,
        mealReminder: this.mealReminder,
        waterReminder: this.waterReminder
      };
      this.saveUserData(userData);

      // Request notification permissions if not already granted
      const hasPermission = await this.notificationService.checkPermissions();
      if (!hasPermission) {
        const granted = await this.notificationService.requestPermissions();
        if (!granted) {
          const toast = await this.toastController.create({
            message: 'Permisos de notificación denegados. Las notificaciones no funcionarán.',
            duration: 3000,
            position: 'bottom',
            color: 'warning'
          });
          await toast.present();
          return;
        }
      }

      // Update notifications based on new preferences
      await this.notificationService.updateReminders();

      const toast = await this.toastController.create({
        message: 'Preferencias de recordatorios actualizadas',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error updating reminder preferences:', error);
      const toast = await this.toastController.create({
        message: 'Error al actualizar recordatorios',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  async testWorkoutNotification() {
    try {
      await this.notificationService.sendTestNotification('workout');

      const toast = await this.toastController.create({
        message: 'Notificación de entrenamiento enviada',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error testing workout notification:', error);
      const toast = await this.toastController.create({
        message: 'Error al enviar notificación de prueba',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  async testMealNotification() {
    try {
      await this.notificationService.sendTestNotification('meal');

      const toast = await this.toastController.create({
        message: 'Notificación de comida enviada',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error testing meal notification:', error);
      const toast = await this.toastController.create({
        message: 'Error al enviar notificación de prueba',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  async testWaterNotification() {
    try {
      await this.notificationService.sendTestNotification('water');

      const toast = await this.toastController.create({
        message: 'Notificación de hidratación enviada',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error testing water notification:', error);
      const toast = await this.toastController.create({
        message: 'Error al enviar notificación de prueba',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  async testDelayedNotification() {
    try {
      await this.notificationService.sendDelayedTestNotification(5);

      const toast = await this.toastController.create({
        message: 'Notificación retardada programada para 5 segundos',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error testing delayed notification:', error);
      const toast = await this.toastController.create({
        message: 'Error al programar notificación retardada',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserEmail(): string {
    return this.userEmail || 'usuario@email.com';
  }

  getGoalText(): string {
    if (!this.userProfile) return 'Bajar de peso';
    
    const goalMap: { [key: string]: string } = {
      'lose_weight': 'Bajar de peso',
      'gain_weight': 'Subir de peso',
      'maintain_weight': 'Mantener peso'
    };
    
    return goalMap[this.userProfile.goal] || 'Bajar de peso';
  }

  getWorkoutFrequencyText(): string {
    // Get workout frequency from user-specific localStorage first
    const userId = this.authService.currentUser?.id;
    if (userId) {
      const userDataString = localStorage.getItem(`userData_${userId}`);
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          if (userData.workoutFrequency) {
            const frequencyMap: { [key: number]: string } = {
              1: '1 vez por semana',
              2: '2 veces por semana',
              3: '3 veces por semana',
              4: '4 veces por semana',
              5: '5 veces por semana',
              6: '6 veces por semana',
              7: 'Todos los días'
            };
            return frequencyMap[userData.workoutFrequency] || '3 veces por semana';
          }
        } catch (error) {
          console.error('Error parsing workout frequency:', error);
        }
      }
    }

    // Fallback to profile data
    if (!this.userProfile || !this.userProfile.workout_frequency) return '3 veces por semana';

    const frequencyMap: { [key: number]: string } = {
      1: '1 vez por semana',
      2: '2 veces por semana',
      3: '3 veces por semana',
      4: '4 veces por semana',
      5: '5 veces por semana',
      6: '6 veces por semana',
      7: 'Todos los días'
    };

    return frequencyMap[this.userProfile.workout_frequency] || '3 veces por semana';
  }

  getNutritionPreferencesText(): string {
    // Get nutrition preferences from user-specific localStorage first
    const userId = this.authService.currentUser?.id;
    if (userId) {
      const userDataString = localStorage.getItem(`userData_${userId}`);
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          const preferences = userData.preferences || [];
          
          if (preferences.length === 0) {
            return 'Sin preferencias';
          }
          if (preferences.length === 1) {
            return preferences[0];
          }
          return `${preferences.length} preferencias`;
        } catch (error) {
          console.error('Error parsing nutrition preferences:', error);
        }
      }
    }
    
    // Fallback to nutrition data from database
    const nutritionData = this.getNutritionData();
    const preferences = nutritionData.preferences || [];

    if (preferences.length === 0) {
      return 'Sin preferencias';
    }
    if (preferences.length === 1) {
      return preferences[0];
    }
    return `${preferences.length} preferencias`;
  }

  getCurrentWeight(): number {
    // Get current weight from the last entry in weightHistory
    const weightHistory = this.getWeightHistory();
    if (weightHistory && weightHistory.length > 0) {
      // Return the most recent weight entry
      const sortedHistory = weightHistory.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return sortedHistory[0].weight;
    }

    // Fallback to userData weight or default
    const userData = this.getUserData();
    return userData.weight || 73.2;
  }
}
