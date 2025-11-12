import { Component, OnInit } from '@angular/core';
import { IonContent, IonButton, IonInput, IonItem, IonLabel, IonToast } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login',
  template: `
    <ion-content class="register-bg" fullscreen>
      <div class="container">
        <header>
          <nav aria-label="Volver">
            <button class="back-link" (click)="onBack()">← Volver</button>
          </nav>
        </header>

        <main>
          <section aria-labelledby="login-title">
            <h1 id="login-title" class="h-title">Iniciar sesión</h1>
            <p id="login-subtitle" class="h-sub">Accede con tu correo electrónico</p>
          </section>

          <section aria-label="Formulario de inicio de sesión">
            <form class="form" [formGroup]="loginForm" (submit)="onLogin($event)" novalidate>
              <div class="field">
                <label class="field-label" for="login-email">Correo electrónico</label>
                <ion-item class="form-field" [class.error]="emailError">
                  <ion-input id="login-email" placeholder="tu@email.com" type="email" formControlName="email"></ion-input>
                </ion-item>
                <small class="error-text" *ngIf="emailError">{{ emailError }}</small>
              </div>

              <div class="field">
                <label class="field-label" for="login-password">Contraseña</label>
                <ion-item class="form-field" [class.error]="passwordError">
                  <ion-input id="login-password" placeholder="Contraseña" type="password" formControlName="password"></ion-input>
                </ion-item>
                <small class="error-text" *ngIf="passwordError">{{ passwordError }}</small>
              </div>

              <a class="forgot-link" role="button">¿Olvidaste tu contraseña?</a>

              <div class="actions" style="width:100%;">
                <ion-button 
                  class="primary-btn no-uppercase" 
                  type="submit"
                  [disabled]="loginForm.invalid || isSubmitting">
                  {{ isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión' }}
                </ion-button>
              </div>
            </form>
            
            <ion-toast
              [isOpen]="showToast"
              [message]="toastMessage"
              [duration]="3000"
              (didDismiss)="onToastDismiss()">
            </ion-toast>
          </section>
        </main>
      </div>
    </ion-content>
  `,
  imports: [IonContent, IonButton, IonInput, IonItem, IonToast, ReactiveFormsModule, CommonModule],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  showToast = false;
  toastMessage = '';
  isSubmitting = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onBack() { 
    this.router.navigate(['/']); 
  }

  async onLogin(event?: Event) {
    if (event) event.preventDefault();
    
    if (this.loginForm.invalid) {
      this.showToastMessage('Por favor completa todos los campos');
      return;
    }

    const formData = this.loginForm.value;
    this.isSubmitting = true;

    try {
      const result = await this.authService.login(formData.email, formData.password);
      
      this.showToastMessage(result.message);
      
      if (result.success) {
        // Navigate to dashboard after successful login
        setTimeout(() => {
          this.router.navigate(['/tabs/tab1']);
        }, 1500);
      }
    } catch (error) {
      this.showToastMessage('Error durante el login');
    } finally {
      this.isSubmitting = false;
    }
  }

  private showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
  }

  onToastDismiss() {
    this.showToast = false;
  }

  get emailError() {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.errors && emailControl.touched) {
      if (emailControl.errors['required']) return 'El correo es obligatorio';
      if (emailControl.errors['email']) return 'Formato de correo inválido';
    }
    return null;
  }

  get passwordError() {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.errors && passwordControl.touched) {
      if (passwordControl.errors['required']) return 'La contraseña es obligatoria';
    }
    return null;
  }
}
