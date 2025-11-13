import { Component } from '@angular/core';
import { IonContent, IonButton, IonInput, IonItem, IonLabel, IonRadioGroup, IonRadio, IonCheckbox, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SimpleDbService } from '../../services/simple-db.service';

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
              <ion-icon name="heart" class="welcome-icon"></ion-icon>
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
                <ion-label>Nombre</ion-label>
                <ion-item class="form-field">
                  <ion-input placeholder="Tu nombre" formControlName="name"></ion-input>
                </ion-item>
              </div>
              <div class="field">
                <ion-label>Edad</ion-label>
                <ion-item class="form-field">
                  <ion-input type="number" placeholder="25" formControlName="age"></ion-input>
                </ion-item>
              </div>
              <div class="grid-fields">
                <div class="field">
                  <ion-label>Peso (kg)</ion-label>
                  <ion-item class="form-field">
                    <ion-input type="number" placeholder="70" formControlName="weight"></ion-input>
                  </ion-item>
                </div>
                <div class="field">
                  <ion-label>Altura (cm)</ion-label>
                  <ion-item class="form-field">
                    <ion-input type="number" placeholder="170" formControlName="height"></ion-input>
                  </ion-item>
                </div>
              </div>
            </form>
          </div>

          <!-- Paso 2: Objetivo -->
          <div *ngIf="step === 2" class="form-step">
            <ion-radio-group [value]="goal" (ionChange)="goal = $event.detail.value" class="radio-group">
              <ion-item class="radio-item">
                <ion-radio value="lose" slot="start"></ion-radio>
                <ion-label>Bajar de peso</ion-label>
              </ion-item>
              <ion-item class="radio-item">
                <ion-radio value="maintain" slot="start"></ion-radio>
                <ion-label>Mantener peso actual</ion-label>
              </ion-item>
              <ion-item class="radio-item">
                <ion-radio value="gain" slot="start"></ion-radio>
                <ion-label>Ganar masa muscular</ion-label>
              </ion-item>
            </ion-radio-group>
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
              <ion-icon name="heart" class="final-icon"></ion-icon>
            </div>
            <div class="text-center">
              <p class="final-text">Hemos creado un plan personalizado basado en tus objetivos</p>
            </div>
          </div>
        </div>

        <div class="step-footer">
          <ion-button expand="block" (click)="nextStep()" class="next-btn">
            {{ getButtonText() }}
            <ion-icon name="arrow-forward" slot="end"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  imports: [IonContent, IonButton, IonInput, IonItem, IonLabel, IonRadioGroup, IonRadio, IonCheckbox, IonIcon, ReactiveFormsModule, CommonModule],
  styles: [`
    .onboarding-bg { --background: #ffffff; }
    .onboarding-container { height: 100vh; display: flex; flex-direction: column; padding: 24px; box-sizing: border-box; }
    .step-header { margin-bottom: 24px; }
    .step-subtitle { color: var(--gray-500); font-size: 14px; margin-bottom: 8px; }
    .step-title { color: var(--fitlife-green); font-size: 24px; font-weight: 700; }
    .step-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
    .welcome-step { display: flex; flex-direction: column; align-items: center; gap: 32px; }
    .icon-container { width: 96px; height: 96px; background: var(--color-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .welcome-icon { font-size: 48px; color: var(--fitlife-green); }
    .app-title { color: var(--fitlife-green); font-size: 28px; font-weight: 700; }
    .welcome-text { color: var(--gray-600); text-align: center; }
    .form-step { }
    .onboarding-form { display: flex; flex-direction: column; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .form-field { --background: var(--gray-100); --border-radius: 8px; --padding-start: 12px; --inner-padding-end: 12px; }
    .grid-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .radio-group { display: flex; flex-direction: column; gap: 12px; }
    .radio-item { --background: #ffffff; --border-radius: 8px; --border-color: var(--border); --border-width: 1px; --padding-start: 16px; --padding-end: 16px; }
    .checkbox-group { display: flex; flex-direction: column; gap: 12px; }
    .checkbox-item { --background: #ffffff; --border-radius: 8px; --border-color: var(--border); --border-width: 1px; --padding-start: 16px; --padding-end: 16px; }
    .final-step { display: flex; flex-direction: column; align-items: center; gap: 32px; }
    .final-icon { font-size: 48px; color: var(--fitlife-green); }
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
    private dbService: SimpleDbService
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

  nextStep() {
    if (this.step < this.steps.length - 1) {
      this.step++;
    } else {
      this.completeOnboarding();
    }
  }

  async completeOnboarding() {
    const personalData = this.personalForm.value;
    const preferences = this.selectedPreferences;

    const userData = {
      ...personalData,
      goal: this.goal,
      preferences,
      onboardingCompleted: true,
    };

    // Guardar en localStorage o DB
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));

    // Opcional: guardar en DB
    // await this.dbService.saveUserData(userData);

    this.router.navigate(['/tabs/tab1']);
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