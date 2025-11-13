import { Component } from '@angular/core';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { heart, logoGoogle, logoApple, mail } from 'ionicons/icons';
import { UiService } from '../../services/ui.service';

@Component({
  standalone: true,
  selector: 'app-home',
  template: `
  <ion-content class="home-bg" fullscreen>
    <div class="content-wrapper fade-in">
      <div class="hero">
        <ion-icon [icon]="heartIcon" class="hero-icon" aria-hidden="true"></ion-icon>
        <h1 class="app-title">FitLife+</h1>
        <p class="subtitle">Tu bienestar comienza aquí</p>
      </div>

      <div class="actions">
      <ion-button class="alt-btn" expand="block" fill="clear" (click)="onRegister()" aria-label="Registrarse con email">
        <ion-icon slot="start" [icon]="mailIcon"></ion-icon>
        Registro con email
      </ion-button>
      <ion-button class="alt-btn" expand="block" fill="clear" (click)="onUnavailable('Google')" aria-label="Continuar con Google">
        <ion-icon slot="start" [icon]="googleIcon"></ion-icon>
        Continuar con Google
      </ion-button>
      <ion-button class="alt-btn" expand="block" fill="clear" (click)="onUnavailable('Apple')" aria-label="Continuar con Apple">
        <ion-icon slot="start" [icon]="appleIcon"></ion-icon>
        Continuar con Apple
      </ion-button>

        <div class="or">o</div>

  <div class="signin"><a role="button" tabindex="0" (click)="onLogin()" aria-label="Iniciar sesión">Ya tengo cuenta → Iniciar sesión</a></div>
      </div>
    </div>

  <div class="legal"><span>Al continuar, aceptas nuestros <a>Términos de Servicio</a> y <a>Política de Privacidad</a>.</span></div>
  </ion-content>
  `,
    imports: [IonContent, IonIcon, IonButton],
  styles: [`
  :host { display: block; height: 100%; }
  .home-bg { --background: var(--ion-color-primary); color: #fff; }
  .content-wrapper { height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 20px; padding: 28px 16px; box-sizing: border-box; padding-bottom: calc(28px + env(safe-area-inset-bottom, 0px) + 56px); }
  .hero { text-align: center; padding: 8px 8px; }
    .hero-icon { font-size: 56px; color: #fff; }
    .app-title { margin: 8px 0 0; font-size: 28px; font-weight: 700; color: #fff; }
    .subtitle { margin: 6px 0 18px; opacity: 0.95; color: #fff; }
    .actions { padding: 0 16px; }
    ion-button { margin-top: 10px; }
    .or { text-align: center; margin: 14px 0; color: rgba(255,255,255,0.9); }
  .signin { text-align: center; margin-top: 6px; }
  .signin a { color: #ffffff; text-decoration: underline; font-weight: 600; cursor: pointer; transition: transform 140ms ease, opacity 140ms ease; display: inline-block; }
  .signin a:hover { transform: translateY(-3px); }
  .signin a:focus { outline: 2px solid rgba(255,255,255,0.18); border-radius: 4px; }
  .legal { position: absolute; bottom: calc(12px + env(safe-area-inset-bottom, 0px) + 56px); left: 12px; right: 12px; font-size: 12px; text-align: center; color: #ffffff; display: flex; justify-content: center; z-index: 5; }
  .legal > span { background: rgba(0,0,0,0.12); padding: 8px 12px; border-radius: 8px; display: inline-block; }
  .legal a { color: #ffffff; text-decoration: underline; }
    .alt-btn {
      --background: #ffffff;
      --border-radius: 12px;
      color: var(--ion-color-primary);
      box-shadow: 0 1px 0 rgba(0,0,0,0.02);
      border: 1px solid rgba(0,0,0,0.08);
      transition: transform 120ms ease, box-shadow 120ms ease;
    }
    .alt-btn:hover { transform: translateY(-4px); box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
    .alt-btn:active { transform: translateY(-1px); }
    .fade-in { animation: fadeIn 380ms ease both; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }
  `],
})
export class HomePage {
  heartIcon = heart;
  googleIcon = logoGoogle;
  appleIcon = logoApple;
  mailIcon = mail;
  constructor(private router: Router, private ui: UiService) {}

  onRegister() {
    this.router.navigate(['/register']);
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onUnavailable(provider: string) {
    this.ui.showToast('Función no disponible en modo offline');
  }
}
