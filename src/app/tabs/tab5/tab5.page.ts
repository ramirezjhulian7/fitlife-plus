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
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.loadUserProfile();
  }

  async loadUserProfile() {
    this.isLoading = true;

    try {
      // Get user data from localStorage (userData key)
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        this.userName = userData.name || 'Usuario';

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
          water_reminder: this.waterReminder
        };
      }

      // Load reminder preferences from database if user is authenticated
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
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async createProfileFromOnboarding(userId: number) {
    // Get onboarding data from localStorage as fallback
    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      try {
        const data = JSON.parse(onboardingData);
        
        const profileData = {
          user_id: userId,
          name: data.name || 'Usuario',
          age: data.age || 28,
          height: data.height || 170,
          weight: data.weight || 73.2,
          goal: this.mapGoalToDatabase(data.goal),
          workout_frequency: data.workoutFrequency || 3, // Include workout frequency
          workout_reminder: true,
          meal_reminder: true,
          water_reminder: false
        };

        const result = await this.databaseService.createUserProfile(profileData);
        if (result.success) {
          await this.loadUserProfile(); // Reload to get the created profile
        }
      } catch (error) {
        console.error('Error creating profile from onboarding data:', error);
      }
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
      }
    } catch (error) {
      console.error('Error updating reminder preferences:', error);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserEmail(): string {
    // Get user name from userData in localStorage
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        const userName = userData.name || 'usuario';
        return `${userName.toLowerCase().replace(/\s+/g, '')}@email.com`;
      } catch (error) {
        console.error('Error parsing user data for email:', error);
      }
    }

    return 'usuario@email.com';
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
    const userDataString = localStorage.getItem('userData');
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

    return 'Sin preferencias';
  }

  getCurrentWeight(): number {
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
}
