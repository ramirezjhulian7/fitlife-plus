import { Component, OnInit } from '@angular/core';
import { IonContent, IonButton, IonInput, IonCheckbox, IonItem, IonLabel, IonToast } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-register',
  template: `
    <ion-content class="register-bg" fullscreen>
      <div class="container">
        <header>
          <nav aria-label="Volver">
            <button class="back-link" (click)="onBack()" id="btn-back-register">← Volver</button>
          </nav>
        </header>

        <main>
          <section aria-labelledby="register-title">
            <h1 id="register-title" class="h-title">Crear cuenta</h1>
            <p id="register-subtitle" class="h-sub">Regístrate con tu correo electrónico</p>
          </section>

          <section aria-label="Formulario de registro">
            <form id="form-register" class="form" [formGroup]="registerForm" (submit)="onSubmit($event)" novalidate>
              <div class="field">
                <label class="field-label" for="reg-email">Correo electrónico</label>
                <ion-item class="form-field" [class.error]="emailError">
                  <ion-input id="reg-email" placeholder="tu@email.com" type="email" formControlName="email"></ion-input>
                </ion-item>
                <small class="error-text" *ngIf="emailError">{{ emailError }}</small>
              </div>

              <div class="field">
                <label class="field-label" for="reg-password">Contraseña</label>
                <ion-item class="form-field" [class.error]="passwordError">
                  <ion-input id="reg-password" placeholder="Mínimo 8 caracteres" type="password" formControlName="password"></ion-input>
                </ion-item>
                <small class="error-text" *ngIf="passwordError">{{ passwordError }}</small>
                <small class="assistive help-text" *ngIf="!passwordError">Mínimo 8 caracteres</small>
              </div>

              <div class="field">
                <label class="field-label" for="reg-password2">Confirmar contraseña</label>
                <ion-item class="form-field" [class.error]="confirmPasswordError">
                  <ion-input id="reg-password2" placeholder="Repite tu contraseña" type="password" formControlName="confirmPassword"></ion-input>
                </ion-item>
                <small class="error-text" *ngIf="confirmPasswordError">{{ confirmPasswordError }}</small>
              </div>

              <div class="legal checkbox-row">
                <input id="chk-terms" class="native-check" name="terms" type="checkbox" formControlName="acceptTerms" />
                <label for="chk-terms" class="terms">Acepto los <a id="link-terms">términos y condiciones</a> y la <a id="link-privacy">política de privacidad</a></label>
              </div>

              <div class="actions">
                <ion-button 
                  class="primary-btn no-uppercase" 
                  type="submit" 
                  id="btn-create"
                  [disabled]="registerForm.invalid || isSubmitting">
                  {{ isSubmitting ? 'Creando cuenta...' : 'Crear cuenta' }}
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
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  showToast = false;
  toastMessage = '';
  isSubmitting = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  onBack() { 
    this.router.navigate(['/']); 
  }

  async onSubmit(event?: Event) {
    if (event) event.preventDefault();
    
    if (this.registerForm.invalid) {
      this.showToastMessage('Por favor completa todos los campos correctamente');
      return;
    }

    const formData = this.registerForm.value;
    this.isSubmitting = true;

    try {
      const result = await this.authService.register(
        formData.email,
        formData.password,
        formData.confirmPassword
      );

      this.showToastMessage(result.message);
      
      if (result.success) {
        // Navigate to home/dashboard after successful registration
        setTimeout(() => {
          this.router.navigate(['/tabs/tab1']);
        }, 1500);
      }
    } catch (error) {
      this.showToastMessage('Error durante el registro');
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
    const emailControl = this.registerForm.get('email');
    if (emailControl?.errors && emailControl.touched) {
      if (emailControl.errors['required']) return 'El correo es obligatorio';
      if (emailControl.errors['email']) return 'Formato de correo inválido';
    }
    return null;
  }

  get passwordError() {
    const passwordControl = this.registerForm.get('password');
    if (passwordControl?.errors && passwordControl.touched) {
      if (passwordControl.errors['required']) return 'La contraseña es obligatoria';
      if (passwordControl.errors['minlength']) return 'Mínimo 8 caracteres';
    }
    return null;
  }

  get confirmPasswordError() {
    const confirmControl = this.registerForm.get('confirmPassword');
    const passwordControl = this.registerForm.get('password');
    if (confirmControl?.errors && confirmControl.touched) {
      if (confirmControl.errors['required']) return 'Confirma tu contraseña';
    }
    if (confirmControl?.value && passwordControl?.value && confirmControl.value !== passwordControl.value) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  }
}
 
