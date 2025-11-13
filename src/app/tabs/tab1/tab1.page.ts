import { Component, OnInit, inject, signal } from '@angular/core';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonProgressBar, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { play, flame, water, bulb, restaurant, barChart } from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  template: `
    <ion-content [fullscreen]="isDesktop()" class="dashboard-bg">
      <div class="dashboard-container">
        <!-- Header con gradiente -->
        <div class="header-gradient">
          <h2 class="header-title">¡Hola, {{ userName() }}!</h2>
          <p class="header-subtitle">{{ currentDate() }}</p>
        </div>

        <!-- Contenido principal -->
        <div class="content-grid">
          <!-- Columna izquierda -->
          <div class="left-column">
            <!-- Entrenamiento del día -->
            <ion-card class="workout-card">
              <ion-card-header>
                <ion-card-title class="workout-title">Entrenamiento de hoy</ion-card-title>
                <span class="workout-time">30 min</span>
              </ion-card-header>
              <ion-card-content>
                <ion-progress-bar
                  value="0.65"
                  class="workout-progress"
                  color="success">
                </ion-progress-bar>
                <p class="workout-status">65% completado - HIIT Cardio</p>
                <ion-button
                  expand="block"
                  color="success"
                  class="workout-button"
                  (click)="startWorkout()">
                  <ion-icon slot="start" [icon]="playIcon"></ion-icon>
                  Comenzar entrenamiento
                </ion-button>
              </ion-card-content>
            </ion-card>

            <!-- Métricas -->
            <ion-grid class="metrics-grid">
              <ion-row>
                <ion-col size="6">
                  <ion-card class="metric-card">
                    <ion-card-content>
                      <div class="metric-content">
                        <div class="metric-icon calories">
                          <ion-icon [icon]="flameIcon"></ion-icon>
                        </div>
                        <div class="metric-info">
                          <p class="metric-label">Calorías</p>
                          <p class="metric-value">1,240</p>
                        </div>
                      </div>
                      <p class="metric-goal">Meta: 2,000 kcal</p>
                    </ion-card-content>
                  </ion-card>
                </ion-col>
                <ion-col size="6">
                  <ion-card class="metric-card">
                    <ion-card-content>
                      <div class="metric-content">
                        <div class="metric-icon water">
                          <ion-icon [icon]="waterIcon"></ion-icon>
                        </div>
                        <div class="metric-info">
                          <p class="metric-label">Agua</p>
                          <p class="metric-value">1.5 L</p>
                        </div>
                      </div>
                      <p class="metric-goal">Meta: 2.5 L</p>
                    </ion-card-content>
                  </ion-card>
                </ion-col>
              </ion-row>
            </ion-grid>

            <!-- Consejo del día -->
            <ion-card class="tip-card">
              <ion-card-content>
                <div class="tip-content">
                  <div class="tip-icon">
                    <ion-icon [icon]="bulbIcon"></ion-icon>
                  </div>
                  <div class="tip-text">
                    <h4 class="tip-title">Consejo del día</h4>
                    <p class="tip-description">
                      Mantén tu cuerpo hidratado antes, durante y después del ejercicio para un mejor rendimiento.
                    </p>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </div>

          <!-- Columna derecha (solo desktop) -->
          <div class="right-column" *ngIf="isDesktop()">
            <!-- Receta saludable -->
            <ion-card class="recipe-card">
              <ion-card-header>
                <ion-card-title class="recipe-title">Receta saludable</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="recipe-content">
                  <div class="recipe-image">
                    <ion-icon [icon]="restaurantIcon" size="large"></ion-icon>
                  </div>
                  <div class="recipe-info">
                    <p class="recipe-name">Bowl de quinoa y aguacate</p>
                    <p class="recipe-details">25 min • 450 kcal</p>
                    <ion-button fill="clear" color="success" class="recipe-link">
                      Ver receta →
                    </ion-button>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>

            <!-- Progreso semanal -->
            <ion-card class="progress-card">
              <ion-card-header>
                <ion-card-title class="progress-title">Progreso semanal</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="progress-content">
                  <div class="progress-item">
                    <div class="progress-header">
                      <span class="progress-label">Entrenamientos</span>
                      <span class="progress-value">5/7</span>
                    </div>
                    <ion-progress-bar value="0.71" color="success"></ion-progress-bar>
                  </div>
                  <div class="progress-item">
                    <div class="progress-header">
                      <span class="progress-label">Objetivo semanal</span>
                      <span class="progress-value">71%</span>
                    </div>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </div>
        </div>

        <!-- Receta móvil (solo mobile) -->
        <div *ngIf="!isDesktop()">
          <ion-card class="recipe-card-mobile">
            <ion-card-header>
              <ion-card-title class="recipe-title">Receta saludable</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="recipe-content">
                <div class="recipe-image">
                  <ion-icon [icon]="restaurantIcon" size="large"></ion-icon>
                </div>
                <div class="recipe-info">
                  <p class="recipe-name">Bowl de quinoa y aguacate</p>
                  <p class="recipe-details">25 min • 450 kcal</p>
                  <ion-button fill="clear" color="success" class="recipe-link">
                    Ver receta →
                  </ion-button>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .dashboard-bg {
      --background: #f8fafc;
      --padding-top: 0;
      --padding-bottom: 0;
      --padding-start: 0;
      --padding-end: 0;
    }

    .dashboard-container {
      min-height: 100vh;
      padding: 24px;
    }

    .header-gradient {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      color: white;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 24px;
    }

    .header-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    .header-subtitle {
      font-size: 14px;
      opacity: 0.9;
      margin: 0;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .left-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .right-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .workout-card {
      --background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .workout-title {
      color: #16a34a;
      font-size: 18px;
      margin-bottom: 8px;
    }

    .workout-time {
      font-size: 14px;
      color: #6b7280;
    }

    .workout-progress {
      margin: 16px 0;
    }

    .workout-status {
      font-size: 14px;
      color: #374151;
      margin: 8px 0 16px 0;
    }

    .workout-button {
      --border-radius: 8px;
    }

    .metrics-grid {
      margin: 0;
    }

    .metric-card {
      --background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      height: 100%;
    }

    .metric-content {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .metric-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .metric-icon.calories {
      background: #fed7aa;
      color: #ea580c;
    }

    .metric-icon.water {
      background: #dbeafe;
      color: #2563eb;
    }

    .metric-icon ion-icon {
      font-size: 20px;
    }

    .metric-info {
      flex: 1;
    }

    .metric-label {
      font-size: 12px;
      color: #6b7280;
      margin: 0 0 4px 0;
    }

    .metric-value {
      font-size: 16px;
      font-weight: 600;
      color: #16a34a;
      margin: 0;
    }

    .metric-goal {
      font-size: 12px;
      color: #6b7280;
      margin: 4px 0 0 0;
    }

    .tip-card {
      --background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #bbf7d0;
      border-radius: 12px;
    }

    .tip-content {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .tip-icon {
      width: 48px;
      height: 48px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .tip-icon ion-icon {
      font-size: 24px;
      color: #16a34a;
    }

    .tip-text {
      flex: 1;
    }

    .tip-title {
      color: #16a34a;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .tip-description {
      font-size: 14px;
      color: #374151;
      margin: 0;
      line-height: 1.5;
    }

    .recipe-card, .recipe-card-mobile {
      --background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .recipe-title {
      color: #16a34a;
      font-size: 18px;
    }

    .recipe-content {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .recipe-image {
      width: 80px;
      height: 80px;
      background: #f3f4f6;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .recipe-image ion-icon {
      color: #9ca3af;
    }

    .recipe-info {
      flex: 1;
    }

    .recipe-name {
      font-size: 16px;
      font-weight: 500;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .recipe-details {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 8px 0;
    }

    .recipe-link {
      --color: #16a34a;
      font-size: 14px;
      font-weight: 500;
      padding: 0;
      height: auto;
      --padding-start: 0;
      --padding-end: 0;
    }

    .progress-card {
      --background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .progress-title {
      color: #16a34a;
      font-size: 18px;
    }

    .progress-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .progress-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .progress-label {
      font-size: 14px;
      color: #6b7280;
    }

    .progress-value {
      font-size: 14px;
      font-weight: 600;
      color: #16a34a;
    }

    /* Desktop responsive */
    @media (min-width: 768px) {
      .dashboard-container {
        padding: 0;
      }

      .content-grid {
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
    }

    /* Mobile responsive */
    @media (max-width: 767px) {
      .dashboard-container {
        padding: 24px 24px 100px 24px; /* Extra padding bottom for tabs */
      }
    }
  `],
  standalone: true,
  imports: [IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonProgressBar, IonGrid, IonRow, IonCol, CommonModule]
})
export class Tab1Page implements OnInit {
  userName = signal('Usuario');
  isDesktop = signal(false);
  currentDate = signal('');

  // Iconos
  playIcon = play;
  flameIcon = flame;
  waterIcon = water;
  bulbIcon = bulb;
  restaurantIcon = restaurant;
  barChartIcon = barChart;

  ngOnInit() {
    this.loadUserData();
    this.checkDeviceType();
    this.setCurrentDate();
  }

  private loadUserData() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.userName.set(parsed.name || 'Usuario');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }

  private checkDeviceType() {
    this.isDesktop.set(window.innerWidth >= 768);
  }

  private setCurrentDate() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    this.currentDate.set(formattedDate);
  }

  startWorkout() {
    // TODO: Implementar navegación al workout
    console.log('Starting workout...');
  }
}