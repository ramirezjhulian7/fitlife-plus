import { Component, OnInit, signal } from '@angular/core';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonChip, IonGrid, IonRow, IonCol, IonBadge, IonPopover, IonList, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { arrowBack, play, time, flash, filter } from 'ionicons/icons';
import { WorkoutService, Workout } from '../../services/workout.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  template: `
    <!-- Vista de detalle del entrenamiento -->
    <ng-container *ngIf="selectedWorkout() !== null || showDetail()">
      <ion-content [fullscreen]="false" class="workout-detail-bg">
        <div class="workout-detail-container">
          <!-- Header con gradiente -->
          <div class="workout-header">
            <ion-button
              fill="clear"
              color="light"
              class="back-button"
              tappable
              (click)="goBack()"
              style="cursor: pointer;">
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
              tappable
              (click)="startWorkout()"
              style="cursor: pointer;">
              <ion-icon slot="start" [icon]="playIcon"></ion-icon>
              Iniciar entrenamiento
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ng-container>

    <!-- Vista de lista de entrenamientos -->
    <ng-container *ngIf="selectedWorkout() === null && !showDetail()">
      <ion-content [fullscreen]="false" class="workouts-bg">
        <div class="workouts-container">
          <!-- Header con gradiente -->
          <div class="workouts-header">
            <h2 class="header-title">Entrenamientos</h2>

            <!-- Categorías -->
            <div class="categories-scroll">
              <ion-chip
                *ngFor="let category of categories()"
                [color]="activeCategory() === category ? 'success' : 'light'"
                [outline]="activeCategory() !== category"
                (click)="setActiveCategory(category)"
                class="category-chip"
                tappable
                style="cursor: pointer;">
                {{ category }}
              </ion-chip>
            </div>
          </div>

          <!-- Contenido principal -->
          <div class="workouts-content">
            <!-- Filtros -->
            <div class="filters-section">
              <div class="filters-info">
                <p class="filters-text">
                  <span *ngIf="!hasActiveFilters()">Filtros disponibles</span>
                  <span *ngIf="hasActiveFilters()" class="active-filters">
                    Filtros activos: {{ getActiveFiltersText() }}
                  </span>
                </p>
                <div class="filter-buttons">
                  <ion-button
                    *ngIf="hasActiveFilters()"
                    fill="outline"
                    color="medium"
                    size="small"
                    (click)="clearFilters()">
                    Limpiar
                  </ion-button>
                  <ion-button
                    fill="outline"
                    color="success"
                    size="small"
                    (click)="toggleFilters()">
                    <ion-icon slot="start" [icon]="filterIcon"></ion-icon>
                    Filtrar
                  </ion-button>
                </div>
              </div>
            </div>

            <!-- Popover de filtros -->
            <ion-popover [isOpen]="showFilters()" (didDismiss)="showFilters.set(false)">
              <ng-template>
                <ion-content class="filter-popover">
                  <div class="filter-header">
                    <h3>Filtros de búsqueda</h3>
                  </div>

                  <ion-list>
                    <ion-item>
                      <ion-label>Duración</ion-label>
                      <ion-select
                        [value]="durationFilter()"
                        (ionChange)="setDurationFilter($event.detail.value)"
                        placeholder="Seleccionar">
                        <ion-select-option
                          *ngFor="let duration of durations()"
                          [value]="duration">
                          {{ duration }}
                        </ion-select-option>
                      </ion-select>
                    </ion-item>

                    <ion-item>
                      <ion-label>Nivel</ion-label>
                      <ion-select
                        [value]="levelFilter()"
                        (ionChange)="setLevelFilter($event.detail.value)"
                        placeholder="Seleccionar">
                        <ion-select-option
                          *ngFor="let level of levels()"
                          [value]="level">
                          {{ level }}
                        </ion-select-option>
                      </ion-select>
                    </ion-item>

                    <ion-item>
                      <ion-label>Tipo</ion-label>
                      <ion-select
                        [value]="activeCategory()"
                        (ionChange)="setActiveCategory($event.detail.value)"
                        placeholder="Seleccionar">
                        <ion-select-option
                          *ngFor="let category of categories()"
                          [value]="category">
                          {{ category }}
                        </ion-select-option>
                      </ion-select>
                    </ion-item>
                  </ion-list>

                  <div class="filter-actions">
                    <ion-button
                      fill="clear"
                      color="medium"
                      (click)="clearFilters()">
                      Limpiar filtros
                    </ion-button>
                    <ion-button
                      fill="solid"
                      color="success"
                      (click)="showFilters.set(false)">
                      Aplicar
                    </ion-button>
                  </div>
                </ion-content>
              </ng-template>
            </ion-popover>

            <!-- Grid de entrenamientos -->
            <ion-grid class="workouts-grid">
              <ion-row>
                  <ion-col
                  *ngFor="let workout of filteredWorkouts"
                  [size]="'12'"
                  class="workout-col">
                  <ion-card class="workout-card" (click)="selectWorkout(workout.id)" tappable style="cursor: pointer;">
                    <!-- Imagen del entrenamiento -->
                    <div class="workout-image">
                      <img [src]="workout.image" [alt]="workout.title" class="workout-img" loading="lazy" />
                      <div class="workout-overlay">
                        <ion-icon [icon]="flashIcon" size="large"></ion-icon>
                      </div>
                    </div>

                    <!-- Contenido -->
                    <ion-card-header class="workout-header">
                      <ion-card-title class="workout-title">{{ workout.title }}</ion-card-title>
                      <ion-badge color="success" class="workout-level">{{ workout.level }}</ion-badge>
                    </ion-card-header>

                    <ion-card-content class="workout-content">
                      <p class="workout-description">
                        <span class="duration-highlight">{{ workout.duration }}</span> - {{ workout.description }}
                      </p>

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
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonChip, IonGrid, IonRow, IonCol, IonBadge, IonPopover, IonList, IonItem, IonLabel, IonSelect, IonSelectOption, CommonModule]
})
export class Tab2Page {
  // Estado
  selectedWorkout = signal<number | null>(null);
  showDetail = signal(false);
  activeCategory = signal('Todos');

  // Filtros
  durationFilter = signal<string>('Todas');
  levelFilter = signal<string>('Todos');
  showFilters = signal(false);

  // Iconos
  arrowBackIcon = arrowBack;
  playIcon = play;
  timeIcon = time;
  flashIcon = flash;
  filterIcon = filter;

  // Datos
  categories = signal(['Todos', 'Fuerza', 'Cardio', 'Yoga', 'HIIT']);
  durations = signal(['Todas', '15 min', '20 min', '25 min', '30 min', '45 min']);
  levels = signal(['Todos', 'Principiante', 'Intermedio', 'Avanzado']);
  workouts = signal<Workout[]>([]);

  constructor(private workoutService: WorkoutService, private router: Router) {
    this.workouts.set(this.workoutService.getWorkouts());

    // Verificar si hay un workout seleccionado en el estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['selectedWorkoutId']) {
      const workoutId = navigation.extras.state['selectedWorkoutId'];
      this.selectWorkout(workoutId);
    }
  }

  get filteredWorkouts() {
    let filtered = this.workouts();

    // Filtro por categoría/tipo
    const category = this.activeCategory();
    if (category !== 'Todos') {
      filtered = filtered.filter(workout => workout.type === category);
    }

    // Filtro por duración
    const duration = this.durationFilter();
    if (duration !== 'Todas') {
      filtered = filtered.filter(workout => workout.duration === duration);
    }

    // Filtro por nivel
    const level = this.levelFilter();
    if (level !== 'Todos') {
      filtered = filtered.filter(workout => workout.level === level);
    }

    return filtered;
  }

  setActiveCategory(category: string) {
    this.activeCategory.set(category);
  }

  setDurationFilter(duration: string) {
    this.durationFilter.set(duration);
  }

  setLevelFilter(level: string) {
    this.levelFilter.set(level);
  }

  toggleFilters() {
    this.showFilters.set(!this.showFilters());
  }

  clearFilters() {
    this.activeCategory.set('Todos');
    this.durationFilter.set('Todas');
    this.levelFilter.set('Todos');
  }

  hasActiveFilters(): boolean {
    return this.activeCategory() !== 'Todos' ||
           this.durationFilter() !== 'Todas' ||
           this.levelFilter() !== 'Todos';
  }

  getActiveFiltersText(): string {
    const filters: string[] = [];

    if (this.durationFilter() !== 'Todas') {
      filters.push(this.durationFilter());
    }

    if (this.levelFilter() !== 'Todos') {
      filters.push(this.levelFilter());
    }

    if (this.activeCategory() !== 'Todos') {
      filters.push(this.activeCategory());
    }

    return filters.join(', ');
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
    const workout = this.getCurrentWorkout();
    this.workoutService.startWorkout(workout);
    console.log('Starting workout:', workout.title);
    // Navegar al dashboard para ver el progreso
    this.router.navigate(['/tabs/dashboard']);
  }
}