import { Component } from '@angular/core';
import { IonContent, IonButton, IonInput, IonItem, IonLabel, IonRadioGroup, IonRadio, IonCheckbox, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SimpleDbService } from '../../services/simple-db.service';
import { ProgressService } from '../../services/progress.service';
import { heart } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-onboarding',
  template: `
    <ion-content fullscreen class="onboarding-bg">
      <div class="onboarding-container">
        <div class="step-header">
          <p class="step-subtitle">{{ currentStep.subtitle }}</p>
          <h2 class="step-title">{{ currentStep.title }}</h2>
        </div>

        <div class="step-content">
          <!-- Paso 0: Bienvenida -->
          <div *ngIf="step === 0" class="welcome-step">
            <div class="icon-container">
              <ion-icon [icon]="heartIcon" class="welcome-icon"></ion-icon>
            </div>
            <div class="text-center">
              <h1 class="app-title">FitLife+</h1>
              <p class="welcome-text">Rutinas personalizadas, nutrición inteligente y motivación diaria</p>
            </div>
          </div>

          <!-- Paso 1: Datos personales -->
          <div *ngIf="step === 1" class="form-step">
            <form [formGroup]="personalForm" class="onboarding-form">
              <div class="field">
                <ion-label>Nombre <span class="required">*</span></ion-label>
                <ion-item class="form-field" [class.error]="personalForm.get('name')?.invalid && personalForm.get('name')?.touched">
                  <ion-input placeholder="Tu nombre" formControlName="name"></ion-input>
                </ion-item>
                <div class="error-message" *ngIf="personalForm.get('name')?.invalid && personalForm.get('name')?.touched">
                  El nombre es obligatorio
                </div>
              </div>
              <div class="field">
                <ion-label>Edad <span class="required">*</span></ion-label>
                <ion-item class="form-field" [class.error]="personalForm.get('age')?.invalid && personalForm.get('age')?.touched">
                  <ion-input type="number" placeholder="25" formControlName="age"></ion-input>
                </ion-item>
                <div class="error-message" *ngIf="personalForm.get('age')?.invalid && personalForm.get('age')?.touched">
                  <span *ngIf="personalForm.get('age')?.errors?.['required']">La edad es obligatoria</span>
                  <span *ngIf="personalForm.get('age')?.errors?.['min']">La edad debe ser mayor a 0</span>
                </div>
              </div>
              <div class="grid-fields">
                <div class="field">
                  <ion-label>Peso (kg) <span class="required">*</span></ion-label>
                  <ion-item class="form-field" [class.error]="personalForm.get('weight')?.invalid && personalForm.get('weight')?.touched">
                    <ion-input type="number" placeholder="70" formControlName="weight"></ion-input>
                  </ion-item>
                  <div class="error-message" *ngIf="personalForm.get('weight')?.invalid && personalForm.get('weight')?.touched">
                    <span *ngIf="personalForm.get('weight')?.errors?.['required']">El peso es obligatorio</span>
                    <span *ngIf="personalForm.get('weight')?.errors?.['min']">El peso debe ser mayor a 0</span>
                  </div>
                </div>
                <div class="field">
                  <ion-label>Altura (cm) <span class="required">*</span></ion-label>
                  <ion-item class="form-field" [class.error]="personalForm.get('height')?.invalid && personalForm.get('height')?.touched">
                    <ion-input type="number" placeholder="170" formControlName="height"></ion-input>
                  </ion-item>
                  <div class="error-message" *ngIf="personalForm.get('height')?.invalid && personalForm.get('height')?.touched">
                    <span *ngIf="personalForm.get('height')?.errors?.['required']">La altura es obligatoria</span>
                    <span *ngIf="personalForm.get('height')?.errors?.['min']">La altura debe ser mayor a 0</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Paso 2: Objetivo -->
          <div *ngIf="step === 2" class="form-step">
            <div class="goal-section">
              <p class="goal-instruction">Selecciona tu objetivo principal <span class="required">*</span></p>
              <ion-radio-group [value]="goal" (ionChange)="goal = $event.detail.value" class="radio-group">
                <ion-item class="radio-item" [class.selected]="goal === 'lose'">
                  <ion-radio value="lose" slot="start"></ion-radio>
                  <ion-label>Bajar de peso</ion-label>
                </ion-item>
                <ion-item class="radio-item" [class.selected]="goal === 'maintain'">
                  <ion-radio value="maintain" slot="start"></ion-radio>
                  <ion-label>Mantener peso actual</ion-label>
                </ion-item>
                <ion-item class="radio-item" [class.selected]="goal === 'gain'">
                  <ion-radio value="gain" slot="start"></ion-radio>
                  <ion-label>Ganar masa muscular</ion-label>
                </ion-item>
              </ion-radio-group>
            </div>
          </div>

          <!-- Paso 3: Preferencias -->
          <div *ngIf="step === 3" class="form-step">
            <div class="checkbox-group">
              <ion-item class="checkbox-item" *ngFor="let pref of preferencesOptions">
                <ion-checkbox [checked]="isSelected(pref)" (ionChange)="onPreferenceChange(pref, $event)" slot="start"></ion-checkbox>
                <ion-label>{{ pref }}</ion-label>
              </ion-item>
            </div>
          </div>

          <!-- Paso 4: Final -->
          <div *ngIf="step === 4" class="final-step">
            <div class="icon-container animate-pulse">
              <ion-icon [icon]="heartIcon" class="final-icon"></ion-icon>
            </div>
            <div class="text-center">
              <p class="final-text">Hemos creado un plan personalizado basado en tus objetivos</p>
            </div>
          </div>
        </div>

        <div class="step-footer">
          <ion-button
            expand="block"
            (click)="nextStep()"
            class="next-btn"
            [disabled]="isNextButtonDisabled()">
            {{ getButtonText() }}
            <ion-icon name="arrow-forward" slot="end"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  imports: [IonContent, IonButton, IonInput, IonItem, IonLabel, IonRadioGroup, IonRadio, IonCheckbox, IonIcon, ReactiveFormsModule, CommonModule],
  styles: [`
    :host {
      --fitlife-green: #16a34a;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-400: #9ca3af;
      --gray-500: #6b7280;
      --gray-600: #4b5563;
      --gray-700: #374151;
      --border: #e5e7eb;
      --color-accent: rgba(22, 163, 74, 0.1);
    }
    .onboarding-bg { --background: #ffffff; }
    .onboarding-container { height: 100vh; display: flex; flex-direction: column; padding: 24px; box-sizing: border-box; }
    .step-header { margin-bottom: 24px; }
    .step-subtitle { color: var(--gray-500); font-size: 14px; margin-bottom: 8px; }
    .step-title { color: var(--fitlife-green); font-size: 24px; font-weight: 700; }
    .step-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
    .welcome-step { display: flex; flex-direction: column; align-items: center; gap: 32px; }
    .icon-container { width: 96px; height: 96px; background: var(--color-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .welcome-icon { font-size: 56px; color: #000; }
    .app-title { color: var(--fitlife-green); font-size: 28px; font-weight: 700; }
    .welcome-text { color: var(--gray-600); text-align: center; }
    .form-step { }
    .onboarding-form { display: flex; flex-direction: column; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .form-field { --background: var(--gray-100); --border-radius: 8px; --padding-start: 12px; --inner-padding-end: 12px; }
    .form-field.error { --border-color: #ef4444; --background: #fef2f2; }
    .required { color: #ef4444; font-weight: 600; }
    .error-message { color: #ef4444; font-size: 12px; margin-top: 4px; }
    .goal-section { }
    .goal-instruction { color: var(--gray-700); font-size: 16px; margin-bottom: 16px; text-align: center; }
    .radio-item.selected { --background: rgba(22, 163, 74, 0.1); --border-color: var(--fitlife-green); }
    .next-btn:disabled { --background: var(--gray-400); --color: var(--gray-200); opacity: 0.6; }
    .final-step { display: flex; flex-direction: column; align-items: center; gap: 32px; }
    .final-icon { font-size: 48px; color: #000; }
    .final-text { color: var(--gray-600); text-align: center; }
    .step-footer { margin-top: 24px; }
    .next-btn { --background: var(--fitlife-green); --color: #ffffff; --border-radius: 8px; }
    .animate-pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  `],
})
export class OnboardingPage {
  step = 0;
  personalForm: FormGroup;
  goal = '';
  selectedPreferences: string[] = [];
  preferencesOptions = ['Vegetariano', 'Vegano', 'Sin gluten', 'Sin lactosa', 'Ninguna restricción'];
  heartIcon = heart;

  steps = [
    { title: '¡Bienvenido a FitLife+!', subtitle: 'Tu bienestar comienza aquí' },
    { title: 'Datos personales', subtitle: 'Paso 1 de 4' },
    { title: 'Tu objetivo', subtitle: 'Paso 2 de 4' },
    { title: 'Preferencias alimentarias', subtitle: 'Paso 3 de 4' },
    { title: '¡Tu plan está listo!', subtitle: 'Comencemos tu viaje hacia el bienestar' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dbService: SimpleDbService,
    private progressService: ProgressService
  ) {
    this.personalForm = this.formBuilder.group({
      name: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1)]],
      weight: ['', [Validators.required, Validators.min(1)]],
      height: ['', [Validators.required, Validators.min(1)]],
    });
  }

  get currentStep() {
    return this.steps[this.step];
  }

  getButtonText() {
    if (this.step === 0) return 'Comenzar';
    if (this.step === this.steps.length - 1) return 'Ir al Dashboard';
    return 'Siguiente';
  }

  isNextButtonDisabled(): boolean {
    return !this.canProceedToNextStep();
  }

  nextStep() {
    // Validar el paso actual antes de continuar
    if (!this.canProceedToNextStep()) {
      return; // No continuar si la validación falla
    }

    if (this.step < this.steps.length - 1) {
      this.step++;
    } else {
      this.completeOnboarding();
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.step) {
      case 0:
        // Paso de bienvenida - siempre puede continuar
        return true;

      case 1:
        // Paso de datos personales - validar formulario
        if (this.personalForm.invalid) {
          // Marcar todos los campos como tocados para mostrar errores
          Object.keys(this.personalForm.controls).forEach(key => {
            this.personalForm.get(key)?.markAsTouched();
          });
          return false;
        }
        return true;

      case 2:
        // Paso de objetivo - debe seleccionar uno
        if (!this.goal) {
          return false;
        }
        return true;

      case 3:
        // Paso de preferencias - siempre puede continuar (incluye "ninguna restricción")
        return true;

      case 4:
        // Paso final - siempre puede continuar
        return true;

      default:
        return false;
    }
  }

  async completeOnboarding() {
    const personalData = this.personalForm.value;
    const preferences = this.selectedPreferences;
    const registrationDate = new Date().toISOString();

    const userData = {
      ...personalData,
      goal: this.goal,
      preferences,
      onboardingCompleted: true,
      registrationDate: registrationDate,
    };

    // Guardar en localStorage
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('registrationDate', registrationDate);

    // Agregar el peso inicial al historial de progreso con la fecha actual
    const initialWeight = personalData.weight;
    const onboardingDate = new Date().toISOString().split('T')[0];
    this.progressService.addWeightEntry(initialWeight, `Peso inicial - ${onboardingDate}`);

    // Opcional: guardar en DB
    // await this.dbService.saveUserData(userData);

    this.router.navigate(['/tabs/dashboard']);
  }

  isSelected(pref: string): boolean {
    return this.selectedPreferences.includes(pref);
  }

  onPreferenceChange(pref: string, event: any) {
    if (event.detail.checked) {
      this.selectedPreferences.push(pref);
    } else {
      this.selectedPreferences = this.selectedPreferences.filter(p => p !== pref);
    }
  }
}