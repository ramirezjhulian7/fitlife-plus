import { Component, OnInit, signal, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonIcon, IonButton,
  IonModal, IonButtons, IonProgressBar
} from '@ionic/angular/standalone';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ProgressService, ProgressStats, Achievement } from '../../services/progress.service';
import { trophy, flame, fitness, body, calendar, medal, add, close, trendingDown, barChart, calculator } from 'ionicons/icons';

@Component({
  selector: 'app-tab4',
  template: `
    <ion-content [fullscreen]="true" class="progress-bg">
      <div class="progress-container">
        <!-- Header -->
        <div class="progress-header">
          <h1 class="progress-title">Mi Progreso</h1>
          <p class="progress-subtitle">Sigue tu evolución y logros</p>
        </div>

        <!-- Estadísticas principales -->
        <div class="stats-grid">
          <ion-card class="stat-card weight-card">
            <ion-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <ion-icon [icon]="trendingDownIcon"></ion-icon>
                </div>
                <div class="stat-info">
                  <p class="stat-label">Último Cambio</p>
                  <p class="stat-value" [class.positive]="progressStats().lastWeightChange < 0" [class.negative]="progressStats().lastWeightChange > 0">
                    {{ progressStats().lastWeightChange >= 0 ? '+' : '' }}{{ progressStats().lastWeightChange.toFixed(1) }} kg
                  </p>
                  <p class="stat-detail">
                    Peso actual: {{ progressStats().currentWeight.toFixed(1) }}kg
                  </p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card bmi-card">
            <ion-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <ion-icon [icon]="calculatorIcon"></ion-icon>
                </div>
                <div class="stat-info">
                  <p class="stat-label">IMC</p>
                  <p class="stat-value" [class]="getBMICategoryClass(progressStats().bmiCategory)">
                    {{ progressStats().bmi.toFixed(1) }}
                  </p>
                  <p class="stat-detail">
                    {{ progressStats().bmiCategory }}
                  </p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card workout-card">
            <ion-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <ion-icon [icon]="flameIcon"></ion-icon>
                </div>
                <div class="stat-info">
                  <p class="stat-label">Racha Actual</p>
                  <p class="stat-value">{{ progressStats().streakDays }}</p>
                  <p class="stat-detail">días consecutivos</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card achievement-card">
            <ion-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <ion-icon [icon]="trophyIcon"></ion-icon>
                </div>
                <div class="stat-info">
                  <p class="stat-label">Logros</p>
                  <p class="stat-value">{{ progressStats().achievementsUnlocked }}</p>
                  <p class="stat-detail">desbloqueados</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card total-card">
            <ion-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <ion-icon [icon]="barChartIcon"></ion-icon>
                </div>
                <div class="stat-info">
                  <p class="stat-label">Total Entrenamientos</p>
                  <p class="stat-value">{{ progressStats().totalWorkouts }}</p>
                  <p class="stat-detail">completados</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Gráfico de evolución de peso -->
        <ion-card class="chart-card">
          <ion-card-header>
            <ion-card-title>Evolución de Peso</ion-card-title>
            <ion-button fill="clear" size="small" (click)="openWeightModal()">
              <ion-icon slot="icon-only" [icon]="addIcon"></ion-icon>
            </ion-button>
          </ion-card-header>
          <ion-card-content>
            <div class="chart-container">
              <canvas baseChart
                [data]="weightChartData()"
                [options]="weightChartOptions"
                [type]="'line'">
              </canvas>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Gráfico de consistencia de entrenamientos -->
        <ion-card class="chart-card">
          <ion-card-header>
            <ion-card-title>Consistencia de Entrenamientos</ion-card-title>
            <p class="chart-subtitle">Últimos 30 días</p>
          </ion-card-header>
          <ion-card-content>
            <div class="chart-container">
              <canvas baseChart
                [data]="workoutChartData()"
                [options]="workoutChartOptions"
                [type]="'bar'">
              </canvas>
            </div>
            <div class="workout-stats">
              <div class="workout-stat">
                <span class="stat-label">Esta semana:</span>
                <span class="stat-value">{{ progressStats().workoutsThisWeek }}/7</span>
              </div>
              <div class="workout-stat">
                <span class="stat-label">Este mes:</span>
                <span class="stat-value">{{ progressStats().workoutsThisMonth }}/30</span>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Logros -->
        <ion-card class="achievements-card">
          <ion-card-header>
            <ion-card-title>Logros</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="achievements-grid">
              <div *ngFor="let achievement of achievements()"
                   class="achievement-item"
                   [class.unlocked]="achievement.unlocked">
                <div class="achievement-icon">
                  <ion-icon [icon]="getAchievementIcon(achievement.icon)"></ion-icon>
                </div>
                <div class="achievement-info">
                  <h4 class="achievement-title">{{ achievement.title }}</h4>
                  <p class="achievement-description">{{ achievement.description }}</p>
                  <div class="achievement-progress">
                    <ion-progress-bar
                      [value]="achievement.progress / achievement.target"
                      [color]="achievement.unlocked ? 'success' : 'medium'">
                    </ion-progress-bar>
                    <span class="progress-text">
                      {{ achievement.progress }}/{{ achievement.target }}
                    </span>
                  </div>
                </div>
                <div class="achievement-status" *ngIf="achievement.unlocked">
                  <ion-icon [icon]="trophyIcon" color="success"></ion-icon>
                </div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Modal para añadir peso -->
      <ion-modal [isOpen]="showWeightModal" (willDismiss)="closeWeightModal()">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>Añadir Peso</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="closeWeightModal()">
                  <ion-icon [icon]="closeIcon"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="weight-modal-content">
            <div class="weight-form">
              <div class="weight-input-group">
                <label class="weight-label">Peso actual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  [(ngModel)]="newWeight"
                  class="weight-input"
                  placeholder="Ej: 72.5">
              </div>
              <div class="weight-input-group">
                <label class="weight-label">Notas (opcional)</label>
                <textarea
                  [(ngModel)]="weightNotes"
                  class="weight-notes"
                  placeholder="¿Cómo te sientes hoy?"
                  rows="3">
                </textarea>
              </div>
              <ion-button
                expand="block"
                color="success"
                (click)="saveWeight()"
                [disabled]="!newWeight">
                Guardar Peso
              </ion-button>
            </div>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
  styles: [`
    .progress-bg {
      --background: #f8fafc;
    }

    .progress-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .progress-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .progress-title {
      font-size: 28px;
      font-weight: 700;
      color: #16a34a;
      margin: 0 0 8px 0;
    }

    .progress-subtitle {
      font-size: 16px;
      color: #6b7280;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      --background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin: 0;
    }

    .weight-card {
      --border: 2px solid #16a34a;
    }

    .bmi-card {
      --border: 2px solid #3b82f6;
    }

    .workout-card {
      --border: 2px solid #ea580c;
    }

    .achievement-card {
      --border: 2px solid #7c3aed;
    }

    .total-card {
      --border: 2px solid #0891b2;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .weight-card .stat-icon {
      background: rgba(22, 163, 74, 0.1);
      color: #16a34a;
    }

    .bmi-card .stat-icon {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .workout-card .stat-icon {
      background: rgba(234, 88, 12, 0.1);
      color: #ea580c;
    }

    .achievement-card .stat-icon {
      background: rgba(124, 58, 237, 0.1);
      color: #7c3aed;
    }

    .total-card .stat-icon {
      background: rgba(8, 145, 178, 0.1);
      color: #0891b2;
    }

    .stat-icon ion-icon {
      font-size: 24px;
    }

    .stat-info {
      flex: 1;
    }

    .stat-label {
      font-size: 12px;
      color: #6b7280;
      margin: 0 0 4px 0;
      font-weight: 500;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #16a34a;
      margin: 0 0 4px 0;
    }

    .stat-value.positive {
      color: #16a34a;
    }

    .stat-value.negative {
      color: #dc2626;
    }

    .stat-value.bmi-underweight {
      color: #f59e0b;
    }

    .stat-value.bmi-normal {
      color: #16a34a;
    }

    .stat-value.bmi-overweight {
      color: #ea580c;
    }

    .stat-value.bmi-obese {
      color: #dc2626;
    }

    .stat-value.bmi-default {
      color: #6b7280;
    }

    .stat-detail {
      font-size: 12px;
      color: #9ca3af;
      margin: 0;
    }

    .chart-card {
      --background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 24px;
    }

    .chart-card ion-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 4px 0 0 0;
    }

    .chart-container {
      height: 300px;
      position: relative;
    }

    .workout-stats {
      display: flex;
      justify-content: space-around;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .workout-stat {
      text-align: center;
    }

    .workout-stat .stat-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .workout-stat .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #16a34a;
    }

    .achievements-card {
      --background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .achievement-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      opacity: 0.6;
      transition: all 0.2s ease;
    }

    .achievement-item.unlocked {
      opacity: 1;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-color: #bbf7d0;
    }

    .achievement-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .achievement-item.unlocked .achievement-icon {
      background: #16a34a;
      color: white;
    }

    .achievement-icon ion-icon {
      font-size: 20px;
    }

    .achievement-info {
      flex: 1;
    }

    .achievement-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .achievement-item.unlocked .achievement-title {
      color: #16a34a;
    }

    .achievement-description {
      font-size: 12px;
      color: #6b7280;
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .achievement-progress {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-text {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
    }

    .achievement-status {
      width: 24px;
      height: 24px;
      background: #16a34a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .achievement-status ion-icon {
      font-size: 14px;
      color: white;
    }

    /* Modal de peso */
    :host ::ng-deep .weight-modal-content {
      --background: #ffffff;
    }

    .weight-form {
      padding: 24px;
    }

    .weight-input-group {
      margin-bottom: 20px;
    }

    .weight-label {
      display: block;
      font-size: 16px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    .weight-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      background: white;
    }

    .weight-input:focus {
      outline: none;
      border-color: #16a34a;
      box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
    }

    .weight-notes {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      background: white;
      resize: vertical;
      min-height: 80px;
    }

    .weight-notes:focus {
      outline: none;
      border-color: #16a34a;
      box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .progress-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .achievements-grid {
        grid-template-columns: 1fr;
      }

      .chart-container {
        height: 250px;
      }

      .progress-title {
        font-size: 24px;
      }
    }
  `],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent,
    IonCardHeader, IonCardTitle, IonIcon, IonButton,
    IonModal, IonButtons, IonProgressBar,
    CommonModule, FormsModule, BaseChartDirective
  ]
})
export class Tab4Page implements OnInit, OnDestroy {
  // Servicios
  private progressService = inject(ProgressService);
  private cdr = inject(ChangeDetectorRef);

  // Señales reactivas
  progressStats = signal<ProgressStats>({
    currentWeight: 0,
    startingWeight: 0,
    weightLost: 0,
    lastWeightChange: 0,
    bmi: 0,
    bmiCategory: '',
    workoutsThisWeek: 0,
    workoutsThisMonth: 0,
    streakDays: 0,
    totalWorkouts: 0,
    achievementsUnlocked: 0
  });

  achievements = signal<Achievement[]>([]);

  // Datos para gráficos
  weightChartData = signal<ChartConfiguration<'line'>['data']>({
    labels: [],
    datasets: [{
      data: [],
      label: 'Peso (kg)',
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22, 163, 74, 0.1)',
      fill: true,
      tension: 0.4
    }]
  });

  workoutChartData = signal<ChartConfiguration<'bar'>['data']>({
    labels: [],
    datasets: [{
      data: [],
      label: 'Entrenamientos Completados',
      backgroundColor: [],
      borderColor: '#ffffff',
      borderWidth: 1
    }]
  });

  // Configuración de gráficos
  weightChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: '#f3f4f6'
        }
      }
    }
  };

  workoutChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            return value === 1 ? 'Sí' : 'No';
          }
        },
        grid: {
          color: '#f3f4f6'
        }
      }
    }
  };

  // Estado del modal de peso
  showWeightModal = false;
  newWeight: number | null = null;
  weightNotes = '';

  // Iconos
  trendingDownIcon = trendingDown;
  flameIcon = flame;
  trophyIcon = trophy;
  barChartIcon = barChart;
  calculatorIcon = calculator;
  addIcon = add;
  closeIcon = close;

  ngOnInit() {
    this.loadProgressData();
  }

  ngOnDestroy() {
    // Cleanup si es necesario
  }

  private async loadProgressData() {
    try {
      // Cargar estadísticas
      const stats = await this.progressService.getProgressStats();
      this.progressStats.set(stats);

      // Cargar logros
      const achievements = this.progressService.getAchievements();
      this.achievements.set(achievements);

      // Cargar datos de gráficos
      const weightData = this.progressService.getWeightChartData();
      const workoutData = this.progressService.getWorkoutConsistencyData();

      // Usar datos reales o arrays vacíos
      this.weightChartData.set(weightData || {
        labels: [],
        datasets: [{
          data: [],
          label: 'Peso (kg)',
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.1)',
          fill: true,
          tension: 0.4
        }]
      });

      this.workoutChartData.set(workoutData || {
        labels: [],
        datasets: [{
          data: [],
          label: 'Entrenamientos Completados',
          backgroundColor: [],
          borderColor: '#ffffff',
          borderWidth: 1
        }]
      });

      // Forzar actualización visual
      setTimeout(() => this.cdr.detectChanges(), 0);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  }

  // Métodos del modal de peso
  openWeightModal() {
    this.showWeightModal = true;
  }

  closeWeightModal() {
    this.showWeightModal = false;
    this.newWeight = null;
    this.weightNotes = '';
  }

  async saveWeight() {
    if (this.newWeight && this.newWeight > 0) {
      this.progressService.addWeightEntry(this.newWeight, this.weightNotes || undefined);
      this.closeWeightModal();
      setTimeout(async () => {
        await this.loadProgressData();
      }, 200);
    }
  }

  // Método para obtener clase CSS basada en categoría de IMC
  getBMICategoryClass(category: string): string {
    switch (category) {
      case 'Bajo peso':
        return 'bmi-underweight';
      case 'Normal':
        return 'bmi-normal';
      case 'Sobrepeso':
        return 'bmi-overweight';
      case 'Obesidad grado I':
      case 'Obesidad grado II':
      case 'Obesidad grado III':
        return 'bmi-obese';
      default:
        return 'bmi-default';
    }
  }

  // Método para obtener íconos de logros
  getAchievementIcon(iconName: string): string {
    switch (iconName) {
      case 'fitness': return this.fitnessIcon;
      case 'flame': return this.flameIcon;
      case 'trophy': return this.trophyIcon;
      case 'medal': return this.medalIcon;
      case 'calendar': return this.calendarIcon;
      case 'body': return this.bodyIcon;
      default: return this.trophyIcon;
    }
  }

  // Iconos adicionales para logros
  fitnessIcon = fitness;
  medalIcon = medal;
  calendarIcon = calendar;
  bodyIcon = body;
}
