import { Component } from '@angular/core';
import { IonContent, IonButton, IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  template: `
    <ion-content class="ion-padding">
      <h2>Iniciar sesión</h2>
      <ion-input placeholder="Email"></ion-input>
      <ion-input type="password" placeholder="Contraseña"></ion-input>
      <ion-button (click)="onLogin()">Entrar</ion-button>
    </ion-content>
  `,
  imports: [IonContent, IonButton, IonInput],
})
export class LoginPage {
  constructor(private router: Router) {}
  onLogin() {
    this.router.navigate(['/tabs/home']);
  }
}
