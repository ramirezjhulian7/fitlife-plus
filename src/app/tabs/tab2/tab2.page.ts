import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab2',
  template: `
    <ion-content [fullscreen]="true">
      <ion-header [collapse]="true">
        <ion-toolbar>
          <ion-title>Entrenamientos</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="container">
        <h2>Entrenamientos</h2>
        <p>Página de entrenamientos próximamente...</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .container {
      padding: 20px;
      text-align: center;
    }

    h2 {
      color: #16a34a;
      margin-bottom: 16px;
    }

    p {
      color: #6b7280;
    }
  `],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule]
})
export class Tab2Page {

}