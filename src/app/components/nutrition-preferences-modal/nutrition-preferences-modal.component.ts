import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-nutrition-preferences-modal',
  templateUrl: './nutrition-preferences-modal.component.html',
  styleUrls: ['./nutrition-preferences-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class NutritionPreferencesModalComponent implements OnInit {
  selectedPreferences: string[] = [];
  preferencesOptions = [
    'Vegetariano',
    'Vegano',
    'Sin gluten',
    'Sin lactosa',
    'Ninguna restricción'
  ];

  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private databaseService: DatabaseService
  ) {}

  ngOnInit() {
    this.loadCurrentPreferences();
  }

  loadCurrentPreferences() {
    const userId = this.authService.currentUser?.id;
    if (userId) {
      const userDataString = localStorage.getItem(`userData_${userId}`);
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          this.selectedPreferences = userData.preferences || [];
        } catch (error) {
          console.error('Error loading nutrition preferences from localStorage:', error);
        }
      }
    }
  }

  isSelected(preference: string): boolean {
    return this.selectedPreferences.includes(preference);
  }

  onPreferenceChange(preference: string, event: any) {
    if (event.detail.checked) {
      // Si selecciona "Ninguna restricción", deseleccionar las demás
      if (preference === 'Ninguna restricción') {
        this.selectedPreferences = ['Ninguna restricción'];
      } else {
        // Si selecciona otra opción, quitar "Ninguna restricción" si estaba seleccionada
        this.selectedPreferences = this.selectedPreferences.filter(p => p !== 'Ninguna restricción');
        if (!this.selectedPreferences.includes(preference)) {
          this.selectedPreferences.push(preference);
        }
      }
    } else {
      this.selectedPreferences = this.selectedPreferences.filter(p => p !== preference);
    }
  }

  async savePreferences() {
    try {
      const userId = this.authService.currentUser?.id;
      if (!userId) return;

      // Get current userData from localStorage
      const userDataString = localStorage.getItem(`userData_${userId}`);
      let userData = {};

      if (userDataString) {
        userData = JSON.parse(userDataString);
      }

      // Update with nutrition preferences
      const updatedData = {
        ...userData,
        preferences: this.selectedPreferences,
        onboardingCompleted: true
      };

      // Save to localStorage
      localStorage.setItem(`userData_${userId}`, JSON.stringify(updatedData));

      // Update database - store preferences as a string or in an appropriate format
      // Note: The database may need to store this in a separate table or field
      const dbResult = await this.databaseService.updateUserProfile(userId, {
        goal: (userData as any).goal || 'lose_weight' // Keep existing goal, we're just ensuring it's updated
      });

      if (!dbResult.success) {
        console.error('Error updating database:', dbResult.message);
      }

      await this.modalController.dismiss({ saved: true, preferences: this.selectedPreferences }, 'saved');
    } catch (error) {
      console.error('Error saving nutrition preferences to localStorage:', error);
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  getSelectedPreferencesText(): string {
    if (this.selectedPreferences.length === 0) {
      return 'Sin preferencias';
    }
    if (this.selectedPreferences.length === 1) {
      return this.selectedPreferences[0];
    }
    return `${this.selectedPreferences.length} preferencias`;
  }
}
