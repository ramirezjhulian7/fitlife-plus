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
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab5Page implements OnInit {
  userName: string = 'Usuario';
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

  async ngOnInit() {
    await this.loadUserProfile();
    // Initialize notifications after loading profile
    await this.initializeNotifications();
  }

  async loadUserProfile() {
    this.isLoading = true;

    try {
      // Get user data from localStorage (user-specific key)
      const userData = this.getUserData();
      this.userName = userData.name || 'Usuario';

      // Load reminder preferences from localStorage first
      if (userData.reminders) {
        this.workoutReminder = userData.reminders.workoutReminder ?? true;
        this.mealReminder = userData.reminders.mealReminder ?? true;
        this.waterReminder = userData.reminders.waterReminder ?? false;
      }

      // Create a profile-like object from userData
      this.userProfile = {
        id: 1, // dummy id since we're not using DB for basic data
        user_id: 1, // dummy user_id
        name: userData.name || 'Usuario',
        age: userData.age || 28,
        height: userData.height || 170,
        weight: this.getCurrentWeight(), // Get from weightHistory
        goal: this.mapGoalToDatabase(userData.goal || 'lose_weight'),
        workout_frequency: userData.workoutFrequency || 3, // Load from localStorage
        workout_reminder: this.workoutReminder,
        meal_reminder: this.mealReminder,
        water_reminder: this.waterReminder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Load reminder preferences from database if user is authenticated (override localStorage if available)
      const currentUser = this.authService.currentUser;
      if (currentUser && currentUser.id) {
        const dbProfile = await this.databaseService.getUserProfile(currentUser.id);
        if (dbProfile) {
          this.workoutReminder = dbProfile.workout_reminder;
          this.mealReminder = dbProfile.meal_reminder;
          this.waterReminder = dbProfile.water_reminder;
          // Update userProfile with correct user_id for preferences
          if (this.userProfile) {
            this.userProfile.user_id = currentUser.id;
            this.userProfile.workout_reminder = this.workoutReminder;
            this.userProfile.meal_reminder = this.mealReminder;
            this.userProfile.water_reminder = this.waterReminder;
          }

          // Also update localStorage to keep it in sync
          const updatedUserData = this.getUserData();
          updatedUserData.reminders = {
            workoutReminder: this.workoutReminder,
            mealReminder: this.mealReminder,
            waterReminder: this.waterReminder
          };
          this.saveUserData(updatedUserData);
        } else {
          // If no profile exists in database, create one from localStorage data
          await this.createProfileIfNeeded(currentUser.id);
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

      // Create profile with current reminder preferences
      const profileData = {
        user_id: userId,
        name: userData.name || 'Usuario',
        age: userData.age || 28,
        height: userData.height || 170,
        weight: userData.weight || this.getCurrentWeight(),
        goal: this.mapGoalToDatabase(userData.goal || 'lose_weight'),
        workout_frequency: userData.workoutFrequency || 3,
        workout_reminder: this.workoutReminder,
        meal_reminder: this.mealReminder,
        water_reminder: this.waterReminder
      };

      const result = await this.databaseService.createUserProfile(profileData);
      if (result.success) {
        console.log('Profile created successfully for user:', userId);
        // Update userProfile with correct user_id
        if (this.userProfile) {
          this.userProfile.user_id = userId;
        }
      } else {
        console.error('Error creating profile:', result.message);
      }
    } catch (error) {
      console.error('Error creating profile if needed:', error);
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
      await LocalNotifications.schedule({
        notifications: [{
          id: 999,
          title: '¡Prueba de Notificación!',
          body: 'Esta es una notificación de prueba para recordatorios de entrenamiento.',
          schedule: { at: new Date(Date.now() + 1000) }, // Show in 1 second
          actionTypeId: 'workout',
          extra: { type: 'test' }
        }]
      });

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
      await LocalNotifications.schedule({
        notifications: [{
          id: 1000,
          title: '¡Prueba de Notificación!',
          body: 'Esta es una notificación de prueba para recordatorios de comidas.',
          schedule: { at: new Date(Date.now() + 1000) }, // Show in 1 second
          actionTypeId: 'meal',
          extra: { type: 'test' }
        }]
      });

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
      await LocalNotifications.schedule({
        notifications: [{
          id: 1001,
          title: '¡Prueba de Notificación!',
          body: 'Esta es una notificación de prueba para recordatorios de hidratación.',
          schedule: { at: new Date(Date.now() + 1000) }, // Show in 1 second
          actionTypeId: 'water',
          extra: { type: 'test' }
        }]
      });

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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserEmail(): string {
    // Get user name from userData in localStorage
    const userData = this.getUserData();
    const userName = userData.name || 'usuario';
    return `${userName.toLowerCase().replace(/\s+/g, '')}@email.com`;
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
    const userData = this.getUserData();
    const preferences = userData.preferences || [];

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
    const userId = this.authService.currentUser?.id;
    const weightHistoryKey = userId ? `weightHistory_${userId}` : 'weightHistory';
    const weightHistoryString = localStorage.getItem(weightHistoryKey);
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
    const userData = this.getUserData();
    return userData.weight || 73.2;
  }
}
