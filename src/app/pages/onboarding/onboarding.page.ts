import { Component, AfterViewInit } from '@angular/core';
import { IonContent, IonButton, IonInput, IonItem, IonLabel, IonRadioGroup, IonRadio, IonCheckbox, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { ProgressService } from '../../services/progress.service';
import { heart } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-onboarding',
  template: `
    <ion-content class="onboarding-bg" [scrollY]="true">
      <div class="onboarding-container" [class.android]="isAndroid()">
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
            <form class="onboarding-form" novalidate>
              <div class="field">
                <ion-label>Nombre <span class="required">*</span></ion-label>
                <ion-item class="form-field" [class.error]="nameError">
                  <ion-input
                    placeholder="Tu nombre"
                    [(ngModel)]="personalData.name"
                    name="name"
                    type="text"
                    clear-input="false"
                    (ionInput)="validateForm()">
                  </ion-input>
                </ion-item>
                <div class="error-message" *ngIf="nameError">
                  El nombre es obligatorio
                </div>
              </div>
              <div class="field">
                <ion-label>Edad <span class="required">*</span></ion-label>
                <ion-item class="form-field" [class.error]="ageError">
                  <ion-input
                    type="number"
                    placeholder="25"
                    [(ngModel)]="personalData.age"
                    name="age"
                    inputmode="numeric"
                    clear-input="false"
                    (ionInput)="validateForm()">
                  </ion-input>
                </ion-item>
                <div class="error-message" *ngIf="ageError">
                  <span *ngIf="!personalData.age">La edad es obligatoria</span>
                  <span *ngIf="personalData.age && personalData.age <= 0">La edad debe ser mayor a 0</span>
                </div>
              </div>
              <div class="grid-fields">
                <div class="field">
                  <ion-label>Peso (kg) <span class="required">*</span></ion-label>
                  <ion-item class="form-field" [class.error]="weightError">
                    <ion-input
                      type="number"
                      placeholder="70"
                      [(ngModel)]="personalData.weight"
                      name="weight"
                      inputmode="numeric"
                      clear-input="false"
                      (ionInput)="validateForm()">
                    </ion-input>
                  </ion-item>
                  <div class="error-message" *ngIf="weightError">
                    <span *ngIf="!personalData.weight">El peso es obligatorio</span>
                    <span *ngIf="personalData.weight && personalData.weight <= 0">El peso debe ser mayor a 0</span>
                  </div>
                </div>
                <div class="field">
                  <ion-label>Altura (cm) <span class="required">*</span></ion-label>
                  <ion-item class="form-field" [class.error]="heightError">
                    <ion-input
                      type="number"
                      placeholder="170"
                      [(ngModel)]="personalData.height"
                      name="height"
                      inputmode="numeric"
                      clear-input="false"
                      (ionInput)="validateForm()">
                    </ion-input>
                  </ion-item>
                  <div class="error-message" *ngIf="heightError">
                    <span *ngIf="!personalData.height">La altura es obligatoria</span>
                    <span *ngIf="personalData.height && personalData.height <= 0">La altura debe ser mayor a 0</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Paso 2: Objetivo -->
          <div *ngIf="step === 2" class="form-step">
            <div class="goal-section">
              <p class="goal-instruction">Selecciona tu objetivo principal <span class="required">*</span></p>
              <ion-radio-group [value]="goal" (ionChange)="goal = $event.detail.value; validateForm()" class="radio-group">
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

        <div class="step-footer sticky">
          <ion-button
            expand="block"
            (click)="nextStep()"
            class="next-btn"
            [disabled]="!canProceed">
            {{ getButtonText() }}
            <ion-icon name="arrow-forward" slot="end"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  imports: [IonContent, IonButton, IonInput, IonItem, IonLabel, IonRadioGroup, IonRadio, IonCheckbox, IonIcon, FormsModule, CommonModule],
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
    .onboarding-container { 
      min-height: 100vh;
      display: flex; 
      flex-direction: column; 
      padding: 24px; 
      padding-bottom: 24px;
      box-sizing: border-box;
    }
    .step-header { margin-bottom: 24px; flex-shrink: 0; }
    .step-subtitle { color: var(--gray-500); font-size: 14px; margin-bottom: 8px; }
    .step-title { color: var(--fitlife-green); font-size: 24px; font-weight: 700; }
    .step-content { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      justify-content: center;
      padding-bottom: 100px;
    }
    .welcome-step { display: flex; flex-direction: column; align-items: center; gap: 32px; }
    .icon-container { width: 96px; height: 96px; background: var(--color-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .welcome-icon { font-size: 56px; color: #000; }
    .app-title { color: var(--fitlife-green); font-size: 28px; font-weight: 700; }
    .welcome-text { color: var(--gray-600); text-align: center; }
    .form-step { width: 100%; }
    .onboarding-form { display: flex; flex-direction: column; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .grid-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-field { 
      --background: var(--gray-100); 
      --border-radius: 8px; 
      --padding-start: 12px; 
      --inner-padding-end: 12px; 
      --min-height: 56px;
      --highlight-height: 0;
      touch-action: manipulation;
    }
    .form-field.error { --border-color: #ef4444; --background: #fef2f2; }
    .form-field ion-input { 
      --placeholder-color: var(--gray-400); 
      --color: var(--gray-700); 
      font-size: 16px;
      min-height: 56px;
      touch-action: manipulation;
    }
    .form-field ion-input::part(native) { 
      font-size: 16px !important;
      min-height: 40px;
      padding: 12px 0;
    }
    .required { color: #ef4444; font-weight: 600; }
    .error-message { color: #ef4444; font-size: 12px; margin-top: 4px; }
    .goal-section { width: 100%; }
    .goal-instruction { color: var(--gray-700); font-size: 16px; margin-bottom: 16px; text-align: center; }
    .radio-group { display: flex; flex-direction: column; gap: 8px; }
    .radio-item { --background: #fff; --border-width: 1px; --border-style: solid; --border-color: var(--border); border-radius: 8px; margin-bottom: 8px; }
    .radio-item.selected { --background: rgba(22, 163, 74, 0.1); --border-color: var(--fitlife-green); }
    .checkbox-group { display: flex; flex-direction: column; gap: 8px; }
    .checkbox-item { --background: #fff; --border-width: 1px; --border-style: solid; --border-color: var(--border); border-radius: 8px; margin-bottom: 8px; }
    .final-step { display: flex; flex-direction: column; align-items: center; gap: 32px; }
    .final-icon { font-size: 48px; color: #000; }
    .final-text { color: var(--gray-600); text-align: center; }
    .text-center { text-align: center; }
    .step-footer.sticky { 
      position: fixed; 
      bottom: 0; 
      left: 0;
      right: 0;
      background: #fff; 
      padding: 16px 24px;
      padding-bottom: max(24px, env(safe-area-inset-bottom)); 
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      z-index: 10;
    }
    .next-btn { --background: var(--fitlife-green); --color: #ffffff; --border-radius: 8px; height: 48px; font-weight: 600; }
    .next-btn:disabled { --background: var(--gray-400); --color: var(--gray-200); opacity: 0.6; }
    .animate-pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  `],
})
export class OnboardingPage implements AfterViewInit {
  step = 0;
  personalData = {
    name: '',
    age: null as number | null,
    weight: null as number | null,
    height: null as number | null
  };
  goal = '';
  selectedPreferences: string[] = [];
  preferencesOptions = ['Vegetariano', 'Vegano', 'Sin gluten', 'Sin lactosa', 'Ninguna restricción'];
  heartIcon = heart;

  // Validation flags
  nameError = false;
  ageError = false;
  weightError = false;
  heightError = false;
  canProceed = false;

  steps = [
    { title: '¡Bienvenido a FitLife+!', subtitle: 'Tu bienestar comienza aquí' },
    { title: 'Datos personales', subtitle: 'Paso 1 de 4' },
    { title: 'Tu objetivo', subtitle: 'Paso 2 de 4' },
    { title: 'Preferencias alimentarias', subtitle: 'Paso 3 de 4' },
    { title: '¡Tu plan está listo!', subtitle: 'Comencemos tu viaje hacia el bienestar' },
  ];

  constructor(
    private router: Router,
    private databaseService: DatabaseService,
    private authService: AuthService,
    private progressService: ProgressService
  ) {
    this.validateForm(); // Validar el paso inicial
  }

  isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  ngAfterViewInit() {
    // Minimal Android compatibility without blocking operations
  }

  get currentStep() {
    return this.steps[this.step];
  }

  getButtonText() {
    if (this.step === 0) return 'Comenzar';
    if (this.step === this.steps.length - 1) return 'Ir al Dashboard';
    return 'Siguiente';
  }

  validateForm() {
    switch (this.step) {
      case 0:
        this.canProceed = true;
        break;
      case 1:
        this.nameError = !this.personalData.name || this.personalData.name.trim() === '';
        this.ageError = !this.personalData.age || this.personalData.age <= 0;
        this.weightError = !this.personalData.weight || this.personalData.weight <= 0;
        this.heightError = !this.personalData.height || this.personalData.height <= 0;
        this.canProceed = !this.nameError && !this.ageError && !this.weightError && !this.heightError;
        break;
      case 2:
        this.canProceed = this.goal !== '';
        break;
      case 3:
        this.canProceed = true;
        break;
      case 4:
        this.canProceed = true;
        break;
      default:
        this.canProceed = false;
    }
  }

  nextStep() {
    if (!this.canProceed) {
      return;
    }

    if (this.step < this.steps.length - 1) {
      this.step++;
      this.validateForm();
    } else {
      this.completeOnboarding();
    }
  }

  async completeOnboarding() {
    const preferences = this.selectedPreferences;
    const registrationDate = new Date().toISOString();

    const userData = {
      ...this.personalData,
      goal: this.goal,
      preferences,
      onboardingCompleted: true,
      registrationDate: registrationDate,
    };

    // Guardar en localStorage (para compatibilidad)
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('onboardingData', JSON.stringify(userData));
    localStorage.setItem('registrationDate', registrationDate);

    // Agregar el peso inicial al historial de progreso con la fecha actual
    const initialWeight = this.personalData.weight!;
    const onboardingDate = new Date().toISOString().split('T')[0];
    this.progressService.addWeightEntry(initialWeight, `Peso inicial - ${onboardingDate}`);

    // Guardar perfil en la base de datos si el usuario está autenticado
    const currentUser = this.authService.currentUser;
    if (currentUser && currentUser.id) {
      try {
        const profileData = {
          user_id: currentUser.id,
          name: this.personalData.name,
          age: this.personalData.age!,
          height: this.personalData.height!,
          weight: this.personalData.weight!,
          goal: this.mapGoalToDatabase(this.goal),
          workout_reminder: true,
          meal_reminder: true,
          water_reminder: false
        };

        const result = await this.databaseService.createUserProfile(profileData);
        if (result.success) {
          console.log('Perfil guardado en la base de datos');
        } else {
          console.error('Error al guardar perfil:', result.message);
        }
      } catch (error) {
        console.error('Error guardando perfil en BD:', error);
      }
    }

    this.router.navigate(['/tabs/dashboard']);
  }

  private mapGoalToDatabase(goal: string): string {
    const goalMap: { [key: string]: string } = {
      'lose': 'lose_weight',
      'maintain': 'maintain_weight',
      'gain': 'gain_weight'
    };
    return goalMap[goal] || 'lose_weight';
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