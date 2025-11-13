import { Component, OnInit, signal } from '@angular/core';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonChip, IonGrid, IonRow, IonCol, IonBadge } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { arrowBack, play, time, flash, filter } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  template: `
    <!-- Vista de detalle del entrenamiento -->
    <ng-container *ngIf="selectedWorkout() !== null || showDetail()">
      <ion-content [fullscreen]="true" class="workout-detail-bg">
        <div class="workout-detail-container">
          <!-- Header con gradiente -->
          <div class="workout-header">
            <ion-button
              fill="clear"
              color="light"
              class="back-button"
              (click)="goBack()">
              <ion-icon slot="start" [icon]="arrowBackIcon"></ion-icon>
              Volver
            </ion-button>
            <h2 class="workout-title">{{ getCurrentWorkout().title }}</h2>
            <div class="workout-meta">
              <span class="meta-item">
                <ion-icon [icon]="timeIcon"></ion-icon>
                {{ getCurrentWorkout().duration }}
              </span>
              <span class="meta-separator">•</span>
              <span class="meta-item">{{ getCurrentWorkout().level }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-item">{{ getCurrentWorkout().exercises }} ejercicios</span>
            </div>
          </div>

          <!-- Contenido del detalle -->
          <div class="detail-content">
            <!-- Descripción -->
            <ion-card class="description-card">
              <ion-card-header>
                <ion-card-title class="description-title">Descripción</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p class="description-text">{{ getCurrentWorkout().description }}</p>

                <h4 class="objectives-title">Objetivos</h4>
                <ul class="objectives-list">
                  <li class="objective-item">
                    <span class="objective-bullet">•</span>
                    <span>Quemar hasta 350 calorías</span>
                  </li>
                  <li class="objective-item">
                    <span class="objective-bullet">•</span>
                    <span>Mejorar resistencia cardiovascular</span>
                  </li>
                  <li class="objective-item">
                    <span class="objective-bullet">•</span>
                    <span>Aumentar metabolismo durante 24 horas</span>
                  </li>
                </ul>
              </ion-card-content>
            </ion-card>

            <!-- Video placeholder -->
            <ion-card class="video-card">
              <ion-card-content>
                <div class="video-placeholder">
                  <div class="video-icon">
                    <ion-icon [icon]="playIcon" size="large"></ion-icon>
                  </div>
                  <p class="video-text">Video / Animación de ejercicio</p>
                </div>
              </ion-card-content>
            </ion-card>

            <!-- Botón de iniciar -->
            <ion-button
              expand="block"
              color="success"
              class="start-button"
              (click)="startWorkout()">
              <ion-icon slot="start" [icon]="playIcon"></ion-icon>
              Iniciar entrenamiento
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ng-container>

    <!-- Vista de lista de entrenamientos -->
    <ng-container *ngIf="selectedWorkout() === null && !showDetail()">
      <ion-content [fullscreen]="true" class="workouts-bg">
        <div class="workouts-container">
          <!-- Header con gradiente -->
          <div class="workouts-header">
            <h2 class="header-title">Entrenamientos</h2>

            <!-- Categorías -->
            <div class="categories-scroll">
              <ion-chip
                *ngFor="let category of categories()"
                [color]="activeCategory() === category ? 'success' : 'medium'"
                [outline]="activeCategory() !== category"
                (click)="setActiveCategory(category)"
                class="category-chip">
                {{ category }}
              </ion-chip>
            </div>
          </div>

          <!-- Contenido principal -->
          <div class="workouts-content">
            <!-- Filtros -->
            <div class="filters-section">
              <p class="filters-text">Filtros: Duración / Nivel / Tipo</p>
              <ion-button fill="outline" color="success" size="small">
                <ion-icon slot="start" [icon]="filterIcon"></ion-icon>
                Filtrar
              </ion-button>
            </div>

            <!-- Grid de entrenamientos -->
            <ion-grid class="workouts-grid">
              <ion-row>
                <ion-col
                  *ngFor="let workout of filteredWorkouts"
                  [size]="isDesktop() ? '6' : '12'"
                  class="workout-col">
                  <ion-card class="workout-card" (click)="selectWorkout(workout.id)">
                    <!-- Imagen placeholder -->
                    <div class="workout-image">
                      <ion-icon [icon]="flashIcon" size="large"></ion-icon>
                    </div>

                    <!-- Contenido -->
                    <ion-card-header class="workout-header">
                      <ion-card-title class="workout-title">{{ workout.title }}</ion-card-title>
                      <ion-badge color="success" class="workout-level">{{ workout.level }}</ion-badge>
                    </ion-card-header>

                    <ion-card-content class="workout-content">
                      <div class="workout-meta">
                        <span class="meta-item">
                          <ion-icon [icon]="timeIcon"></ion-icon>
                          {{ workout.duration }}
                        </span>
                        <span class="meta-separator">•</span>
                        <span class="meta-item">{{ workout.type }}</span>
                      </div>

                      <ion-button
                        fill="outline"
                        color="success"
                        expand="block"
                        class="view-workout-btn">
                        Ver rutina
                      </ion-button>
                    </ion-card-content>
                  </ion-card>
                </ion-col>
              </ion-row>
            </ion-grid>
          </div>
        </div>
      </ion-content>
    </ng-container>
  `,
  styles: [`
    .workout-detail-bg {
      --background: #f8fafc;
      --padding-top: 0;
      --padding-bottom: 0;
      --padding-start: 0;
      --padding-end: 0;
    }

    .workout-detail-container {
      min-height: 100vh;
    }

    .workout-header {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      color: white;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 24px;
    }

    .back-button {
      --color: white;
      margin-bottom: 16px;
      --padding-start: 0;
    }

    .workout-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 12px 0;
    }

    .workout-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 14px;
      opacity: 0.9;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .meta-separator {
      color: rgba(255, 255, 255, 0.7);
    }

    .detail-content {
      padding: 0 24px 24px 24px;
    }

    .description-card {
      --background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 16px;
    }

    .description-title {
      color: #16a34a;
      font-size: 18px;
    }

    .description-text {
      color: #374151;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .objectives-title {
      color: #16a34a;
      font-size: 16px;
      font-weight: 600;
      margin: 16px 0 12px 0;
    }

    .objectives-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .objective-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #374151;
    }

    .objective-bullet {
      color: #16a34a;
      font-weight: bold;
      margin-top: 2px;
    }

    .video-card {
      --background: #f3f4f6;
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .video-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .video-icon {
      width: 64px;
      height: 64px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    .video-icon ion-icon {
      color: #16a34a;
    }

    .video-text {
      color: #6b7280;
      font-size: 14px;
    }

    .start-button {
      --border-radius: 8px;
      height: 48px;
      font-weight: 600;
    }

    .workouts-bg {
      --background: #f8fafc;
      --padding-top: 0;
      --padding-bottom: 0;
      --padding-start: 0;
      --padding-end: 0;
    }

    .workouts-container {
      min-height: 100vh;
    }

    .workouts-header {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      color: white;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 24px;
    }

    .header-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 16px 0;
    }

    .categories-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .category-chip {
      flex-shrink: 0;
      --background: rgba(255, 255, 255, 0.2);
      --color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .category-chip.chip-outline {
      --background: transparent;
      --color: white;
    }

    .workouts-content {
      padding: 0 24px 24px 24px;
    }

    .filters-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .filters-text {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .workouts-grid {
      margin: 0;
    }

    .workout-col {
      margin-bottom: 16px;
    }

    .workout-card {
      --background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .workout-card:hover {
      transform: translateY(-2px);
    }

    .workout-image {
      height: 120px;
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .workout-image ion-icon {
      color: #16a34a;
    }

    .workout-header {
      padding: 16px 16px 8px 16px;
    }

    .workout-title {
      color: #16a34a;
      font-size: 16px;
      margin-bottom: 8px;
    }

    .workout-level {
      font-size: 12px;
    }

    .workout-content {
      padding: 0 16px 16px 16px;
    }

    .workout-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      color: #6b7280;
    }

    .view-workout-btn {
      --border-radius: 8px;
    }

    /* Desktop responsive */
    @media (min-width: 768px) {
      .workouts-container {
        padding: 0;
      }

      .workouts-content {
        padding: 0;
      }

      .workout-detail-container {
        padding: 0;
      }

      .detail-content {
        padding: 0;
      }
    }
  `],
  standalone: true,
  imports: [IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonChip, IonGrid, IonRow, IonCol, IonBadge, CommonModule]
})
export class Tab2Page implements OnInit {
  // Estado
  selectedWorkout = signal<number | null>(null);
  showDetail = signal(false);
  activeCategory = signal('Todos');
  isDesktop = signal(false);

  // Iconos
  arrowBackIcon = arrowBack;
  playIcon = play;
  timeIcon = time;
  flashIcon = flash;
  filterIcon = filter;

  // Datos
  categories = signal(['Todos', 'Fuerza', 'Cardio', 'Yoga', 'HIIT']);

  workouts = signal([
    {
      id: 1,
      title: 'HIIT Quema Grasa',
      duration: '30 min',
      level: 'Intermedio',
      type: 'HIIT',
      description: 'Entrenamiento de alta intensidad para quemar calorías rápidamente',
      exercises: 12,
    },
    {
      id: 2,
      title: 'Yoga para Principiantes',
      duration: '20 min',
      level: 'Principiante',
      type: 'Yoga',
      description: 'Secuencias suaves para mejorar flexibilidad y reducir estrés',
      exercises: 8,
    },
    {
      id: 3,
      title: 'Fuerza Tren Superior',
      duration: '45 min',
      level: 'Avanzado',
      type: 'Fuerza',
      description: 'Desarrolla músculos de pecho, espalda, hombros y brazos',
      exercises: 15,
    },
    {
      id: 4,
      title: 'Cardio Principiante',
      duration: '25 min',
      level: 'Principiante',
      type: 'Cardio',
      description: 'Mejora tu resistencia cardiovascular paso a paso',
      exercises: 10,
    },
  ]);

  ngOnInit() {
    this.checkDeviceType();
  }

  private checkDeviceType() {
    this.isDesktop.set(window.innerWidth >= 768);
  }

  get filteredWorkouts() {
    const category = this.activeCategory();
    if (category === 'Todos') {
      return this.workouts();
    }
    return this.workouts().filter(workout => workout.type === category);
  }

  setActiveCategory(category: string) {
    this.activeCategory.set(category);
  }

  selectWorkout(workoutId: number) {
    this.selectedWorkout.set(workoutId);
  }

  getCurrentWorkout() {
    const workoutId = this.selectedWorkout();
    return this.workouts().find(w => w.id === workoutId) || this.workouts()[0];
  }

  goBack() {
    this.selectedWorkout.set(null);
    this.showDetail.set(false);
  }

  startWorkout() {
    // TODO: Implementar navegación al workout activo
    console.log('Starting workout...');
  }
}