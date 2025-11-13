import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

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

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.loadCurrentPreferences();
  }

  loadCurrentPreferences() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        this.selectedPreferences = userData.preferences || [];
      } catch (error) {
        console.error('Error loading nutrition preferences from localStorage:', error);
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
      // Get current userData from localStorage
      const userDataString = localStorage.getItem('userData');
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
      localStorage.setItem('userData', JSON.stringify(updatedData));

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
