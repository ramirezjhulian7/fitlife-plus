import { Component } from '@angular/core';
import { IonContent, IonButton, IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-register',
  template: `
    <ion-content class="ion-padding">
      <h2>Registro</h2>
      <ion-input placeholder="Email"></ion-input>
      <ion-input type="password" placeholder="Contraseña"></ion-input>
      <ion-button (click)="onSubmit()">Crear cuenta</ion-button>
    </ion-content>
  `,
  imports: [IonContent, IonButton, IonInput],
})
export class RegisterPage {
  constructor(private router: Router) {}
  onSubmit() {
    this.router.navigate(['/tabs/home']);
  }
}
