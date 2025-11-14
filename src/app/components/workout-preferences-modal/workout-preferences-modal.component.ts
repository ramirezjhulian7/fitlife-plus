import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-workout-preferences-modal',
  templateUrl: './workout-preferences-modal.component.html',
  styleUrls: ['./workout-preferences-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class WorkoutPreferencesModalComponent implements OnInit {
  preferencesForm: FormGroup;
  workoutFrequencies = [
    { value: 1, label: '1 vez por semana' },
    { value: 2, label: '2 veces por semana' },
    { value: 3, label: '3 veces por semana' },
    { value: 4, label: '4 veces por semana' },
    { value: 5, label: '5 veces por semana' },
    { value: 6, label: '6 veces por semana' },
    { value: 7, label: 'Todos los días' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private authService: AuthService,
    private databaseService: DatabaseService
  ) {
    this.preferencesForm = this.formBuilder.group({
      workoutFrequency: [3, [Validators.required, Validators.min(1), Validators.max(7)]]
    });
  }

  async ngOnInit() {
    await this.loadCurrentPreferences();
  }

  async loadCurrentPreferences() {
    const userId = this.authService.currentUser?.id;
    if (userId) {
      const userDataString = localStorage.getItem(`userData_${userId}`);
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          this.preferencesForm.patchValue({
            workoutFrequency: userData.workoutFrequency || 3
          });
        } catch (error) {
          console.error('Error loading workout preferences from localStorage:', error);
        }
      }
    }
  }

  async savePreferences() {
    if (this.preferencesForm.valid) {
      try {
        const userId = this.authService.currentUser?.id;
        if (!userId) return;

        const workoutFrequency = this.preferencesForm.value.workoutFrequency;

        // Get current userData from localStorage
        const userDataString = localStorage.getItem(`userData_${userId}`);
        let userData = {};

        if (userDataString) {
          userData = JSON.parse(userDataString);
        }

        // Update with workout frequency
        const updatedData = {
          ...userData,
          workoutFrequency: workoutFrequency,
          onboardingCompleted: true
        };

        // Save to localStorage
        localStorage.setItem(`userData_${userId}`, JSON.stringify(updatedData));

        // Update database with the new workout frequency
        const dbResult = await this.databaseService.updateUserProfile(userId, {
          workout_frequency: workoutFrequency
        });

        if (!dbResult.success) {
          console.error('Error updating database:', dbResult.message);
        }

        await this.modalController.dismiss({ saved: true, workoutFrequency }, 'saved');
      } catch (error) {
        console.error('Error saving workout preferences to localStorage:', error);
      }
    } else {
      // Mark field as touched to show validation errors
      this.preferencesForm.get('workoutFrequency')?.markAsTouched();
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  getErrorMessage(): string {
    const field = this.preferencesForm.get('workoutFrequency');
    if (field?.hasError('required')) {
      return 'Debes seleccionar una frecuencia de entrenamiento';
    }
    if (field?.hasError('min') || field?.hasError('max')) {
      return 'La frecuencia debe estar entre 1 y 7 veces por semana';
    }
    return '';
  }
}
