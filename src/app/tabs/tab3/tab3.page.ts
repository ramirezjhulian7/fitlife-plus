import { Component, OnInit, signal } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab3',
  template: `
    <ion-content [fullscreen]="isDesktop()">
      <ion-header [collapse]="true">
        <ion-toolbar>
          <ion-title>Nutrición</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="container">
        <h2>Nutrición</h2>
        <p>Página de nutrición próximamente...</p>
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

    /* Mobile responsive */
    @media (max-width: 767px) {
      .container {
        padding: 20px 20px 100px 20px; /* Extra padding bottom for tabs */
      }
    }
  `],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule]
})
export class Tab3Page implements OnInit {
  isDesktop = signal(false);

  ngOnInit() {
    this.checkDeviceType();
  }

  private checkDeviceType() {
    this.isDesktop.set(window.innerWidth >= 768);
  }
}