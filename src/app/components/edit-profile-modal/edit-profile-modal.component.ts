import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class EditProfileModalComponent implements OnInit {
  profileForm: FormGroup;
  goals = [
    { value: 'lose_weight', label: 'Bajar de peso' },
    { value: 'maintain_weight', label: 'Mantener peso actual' },
    { value: 'gain_weight', label: 'Ganar masa muscular' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private authService: AuthService
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      height: ['', [Validators.required, Validators.min(50), Validators.max(250)]],
      goal: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadCurrentProfile();
  }

  loadCurrentProfile() {
    const userId = this.authService.currentUser?.id;
    if (userId) {
      const userDataString = localStorage.getItem(`userData_${userId}`);
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          this.profileForm.patchValue({
            name: userData.name || '',
            age: userData.age || '',
            height: userData.height || '',
            goal: userData.goal || 'lose_weight'
          });
        } catch (error) {
          console.error('Error loading profile data:', error);
        }
      }
    }
  }

  async saveProfile() {
    if (this.profileForm.valid) {
      try {
        const userId = this.authService.currentUser?.id;
        if (!userId) return;

        // Get current userData
        const userDataString = localStorage.getItem(`userData_${userId}`);
        let userData = {};

        if (userDataString) {
          userData = JSON.parse(userDataString);
        }

        // Update with new values
        const updatedData = {
          ...userData,
          ...this.profileForm.value,
          onboardingCompleted: true
        };

        // Save to localStorage
        localStorage.setItem(`userData_${userId}`, JSON.stringify(updatedData));

        // Close modal with success
        await this.modalController.dismiss(updatedData, 'saved');
      } catch (error) {
        console.error('Error saving profile:', error);
        // You could show a toast here
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('minlength')) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (field?.hasError('min')) {
      switch (fieldName) {
        case 'age': return 'La edad debe ser mayor a 0';
        case 'height': return 'La altura debe ser mayor a 50 cm';
        default: return 'Valor demasiado pequeño';
      }
    }
    if (field?.hasError('max')) {
      switch (fieldName) {
        case 'age': return 'La edad debe ser menor a 120';
        case 'height': return 'La altura debe ser menor a 250 cm';
        default: return 'Valor demasiado grande';
      }
    }
    return '';
  }
}
