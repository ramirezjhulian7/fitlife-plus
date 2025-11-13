import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonProgressBar, IonGrid, IonRow, IonCol, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { play, flame, water, bulb, restaurant, barChart, time, close, nutrition, addCircle } from 'ionicons/icons';
import { NutritionService, Recipe, MealItem } from '../../services/nutrition.service';
import { WorkoutService, ActiveWorkout } from '../../services/workout.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab1',
  template: `
    <ion-content [fullscreen]="false" class="dashboard-bg">
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
            <ion-card class="workout-card" *ngIf="activeWorkout(); else defaultWorkout">
              <ion-card-header>
                <ion-card-title class="workout-title">Entrenamiento activo</ion-card-title>
                <span class="workout-time">{{ activeWorkout()!.workout.duration }}</span>
              </ion-card-header>
              <ion-card-content>
                <div class="active-workout-info">
                  <h3 class="active-workout-title">{{ activeWorkout()!.workout.title }}</h3>
                  <p class="active-workout-meta">
                    <ion-icon [icon]="timeIcon"></ion-icon>
                    {{ timeRemaining() }} min restantes
                  </p>
                </div>
                <ion-progress-bar
                  [value]="workoutProgress()"
                  class="workout-progress"
                  color="success">
                </ion-progress-bar>
                <p class="workout-status">{{ (workoutProgress() * 100) | number:'1.0-0' }}% completado</p>
                <ion-button
                  expand="block"
                  color="success"
                  class="workout-button"
                  tappable
                  (click)="continueWorkout()"
                  style="cursor: pointer;">
                  <ion-icon slot="start" [icon]="playIcon"></ion-icon>
                  Continuar entrenamiento
                </ion-button>
              </ion-card-content>
            </ion-card>

            <!-- Entrenamiento por defecto cuando no hay activo -->
            <ng-template #defaultWorkout>
              <ion-card class="workout-card">
                <ion-card-header>
                  <ion-card-title class="workout-title">¡Comienza tu entrenamiento!</ion-card-title>
                  <span class="workout-time">Elige tu rutina</span>
                </ion-card-header>
                <ion-card-content>
                  <div class="no-workout-message">
                    <p class="no-workout-text">No tienes ningún entrenamiento activo. ¿Listo para empezar?</p>
                    <p class="no-workout-subtext">Explora nuestras rutinas de HIIT, Yoga, Fuerza y Cardio</p>
                  </div>
                  <ion-button
                    expand="block"
                    color="success"
                    class="workout-button"
                    tappable
                    (click)="startWorkout()"
                    style="cursor: pointer;">
                    <ion-icon slot="start" [icon]="playIcon"></ion-icon>
                    Explorar entrenamientos
                  </ion-button>
                </ion-card-content>
              </ion-card>
            </ng-template>

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
                          <p class="metric-value">{{ dailyCalories().toFixed(0) }}</p>
                        </div>
                      </div>
                      <p class="metric-goal">Meta: {{ targetCalories }} kcal</p>
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
                          <p class="metric-value">{{ (waterGlasses() * 250 / 1000).toFixed(1) }} L</p>
                        </div>
                      </div>
                      <p class="metric-goal">Meta: {{ (targetWater * 250 / 1000).toFixed(1) }} L</p>
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
          <div class="right-column" style="display: none;">
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
        <div>
          <ion-card class="recipe-card-mobile">
            <ion-card-header>
              <ion-card-title class="recipe-title">Recetas saludables</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="recipes-list-mobile">
                <div *ngFor="let recipe of allRecipes()" class="recipe-item-mobile" (click)="openRecipeModal(recipe)">
                  <div class="recipe-image-mobile">
                    <img [src]="recipe.image" [alt]="recipe.name" class="recipe-img-mobile">
                  </div>
                  <div class="recipe-info-mobile">
                    <p class="recipe-name-mobile">{{ recipe.name }}</p>
                    <p class="recipe-details-mobile">{{ recipe.time }} • {{ recipe.totalCalories }} kcal</p>
                  </div>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Modal para detalles de receta -->
      <ion-modal [isOpen]="showRecipeModal" (willDismiss)="closeRecipeModal()" class="recipe-modal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Detalles de la Receta</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeRecipeModal()">
                <ion-icon [icon]="closeIcon"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="recipe-modal-content">
          <div *ngIf="selectedRecipe()" class="recipe-details">
            <!-- Imagen de la receta -->
            <div class="recipe-header">
              <img [src]="selectedRecipe()!.image" [alt]="selectedRecipe()!.name" class="recipe-detail-image">
              <h2 class="recipe-detail-title">{{ selectedRecipe()!.name }}</h2>
              <div class="recipe-meta">
                <span class="recipe-time"><ion-icon [icon]="timeIcon"></ion-icon> {{ selectedRecipe()!.time }}</span>
                <span class="recipe-calories"><ion-icon [icon]="nutritionIcon"></ion-icon> {{ selectedRecipe()!.totalCalories }} kcal</span>
              </div>
            </div>

            <!-- Macronutrientes -->
            <div class="recipe-nutrients">
              <div class="nutrient-item">
                <span class="nutrient-label">Proteínas</span>
                <span class="nutrient-value">{{ selectedRecipe()!.totalProtein }}g</span>
              </div>
              <div class="nutrient-item">
                <span class="nutrient-label">Carbohidratos</span>
                <span class="nutrient-value">{{ selectedRecipe()!.totalCarbs }}g</span>
              </div>
              <div class="nutrient-item">
                <span class="nutrient-label">Grasas</span>
                <span class="nutrient-value">{{ selectedRecipe()!.totalFat }}g</span>
              </div>
            </div>

            <!-- Ingredientes -->
            <div class="recipe-section">
              <h3 class="section-title">Ingredientes</h3>
              <div class="ingredients-list">
                <div *ngFor="let ingredient of selectedRecipe()!.ingredients" class="ingredient-item">
                  <span class="ingredient-name">{{ ingredient.food.name }}</span>
                  <span class="ingredient-quantity">{{ ingredient.quantity }}g</span>
                </div>
              </div>
            </div>

            <!-- Instrucciones -->
            <div class="recipe-section">
              <h3 class="section-title">Preparación</h3>
              <p class="recipe-instructions">{{ selectedRecipe()!.instructions }}</p>
            </div>

            <!-- Botón para añadir -->
            <div class="recipe-actions">
              <ion-button
                expand="block"
                color="success"
                (click)="addRecipeToMeal($event, selectedRecipe()!)">
                <ion-icon slot="start" [icon]="addIcon"></ion-icon>
                Añadir receta completa
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Modal para seleccionar comida -->
      <ion-modal [isOpen]="showMealSelector" (willDismiss)="closeMealSelector()" class="meal-selector-modal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Seleccionar comida</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeMealSelector()">
                <ion-icon [icon]="closeIcon"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="meal-selector-content">
          <div class="meal-selector-info" *ngIf="selectedRecipeForMeal()">
            <p class="meal-selector-text">
              ¿A qué comida quieres añadir <strong>{{ selectedRecipeForMeal()!.name }}</strong>?
            </p>
          </div>

          <div class="meal-options">
            <ion-card
              *ngFor="let meal of meals"
              class="meal-option-card"
              button
              (click)="confirmAddRecipeToMeal(meal.id)">
              <ion-card-content class="meal-option-content">
                <div class="meal-option-icon">
                  <ion-icon [icon]="getMealIcon(meal.icon)" size="large"></ion-icon>
                </div>
                <div class="meal-option-info">
                  <h3 class="meal-option-name">{{ meal.name }}</h3>
                  <p class="meal-option-details">
                    {{ meal.items.length }} alimentos • {{ getMealTotals(meal.id).calories.toFixed(0) }} kcal
                  </p>
                </div>
                <div class="meal-option-arrow">
                  <ion-icon [icon]="addIcon"></ion-icon>
                </div>
              </ion-card-content>
            </ion-card>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  `,
  styles: [`
    .dashboard-bg {
      --background: #f8fafc;
    }

    .dashboard-container {
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

    .no-workout-message {
      text-align: center;
      margin-bottom: 20px;
    }

    .no-workout-text {
      font-size: 16px;
      color: #374151;
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    .no-workout-subtext {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
      line-height: 1.4;
    }

    .workout-button {
      --border-radius: 8px;
    }

    .active-workout-info {
      margin-bottom: 16px;
    }

    .active-workout-title {
      color: #16a34a;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .active-workout-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #6b7280;
      font-size: 14px;
      margin: 0 0 16px 0;
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

    /* Estilos para lista de recetas móviles */
    .recipes-list-mobile {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .recipe-item-mobile {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .recipe-item-mobile:hover {
      background: #f3f4f6;
    }

    .recipe-image-mobile {
      width: 64px;
      height: 64px;
      background: #e5e7eb;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }

    .recipe-image-mobile img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .recipe-info-mobile {
      flex: 1;
    }

    .recipe-name-mobile {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .recipe-details-mobile {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }

    /* Modal de receta */
    :host ::ng-deep .recipe-modal {
      --width: 90vw;
      --max-width: 500px;
      --height: 80vh;
      --border-radius: 16px;
      --box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }

    .recipe-modal-content {
      --background: #ffffff;
    }

    .recipe-details {
      padding: 20px;
    }

    .recipe-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .recipe-detail-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 16px;
    }

    .recipe-detail-title {
      font-size: 20px;
      font-weight: 600;
      color: #16a34a;
      margin: 0 0 8px 0;
    }

    .recipe-meta {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .recipe-time,
    .recipe-calories {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #6b7280;
    }

    .recipe-nutrients {
      background: #f8fafc;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }

    .nutrient-item {
      text-align: center;
    }

    .nutrient-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .nutrient-value {
      font-size: 16px;
      font-weight: 600;
      color: #16a34a;
    }

    .recipe-section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 12px 0;
    }

    .ingredients-list {
      background: #f8fafc;
      border-radius: 8px;
      padding: 12px;
    }

    .ingredient-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .ingredient-item:last-child {
      border-bottom: none;
    }

    .ingredient-name {
      font-size: 14px;
      color: #374151;
    }

    .ingredient-quantity {
      font-size: 14px;
      font-weight: 500;
      color: #16a34a;
    }

    .recipe-instructions {
      font-size: 14px;
      line-height: 1.6;
      color: #374151;
      margin: 0;
    }

    .recipe-actions {
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    /* Modal selector de comidas */
    :host ::ng-deep .meal-selector-modal {
      --width: 90vw;
      --max-width: 400px;
      --height: auto;
      --max-height: 70vh;
      --border-radius: 16px;
      --box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }

    .meal-selector-content {
      --background: #ffffff;
      --padding-top: 0;
      --padding-bottom: 20px;
    }

    .meal-selector-info {
      padding: 20px 20px 0 20px;
      text-align: center;
    }

    .meal-selector-text {
      font-size: 16px;
      color: #374151;
      margin: 0;
      line-height: 1.4;
    }

    .meal-options {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .meal-option-card {
      --background: #f9fafb;
      --border-radius: 12px;
      border: 1px solid #e5e7eb;
      margin: 0;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .meal-option-card:hover {
      --background: #f3f4f6;
      border-color: #16a34a;
    }

    .meal-option-content {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 16px;
      --padding-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .meal-option-icon {
      width: 40px;
      height: 40px;
      background: #dcfce7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .meal-option-icon ion-icon {
      color: #16a34a;
    }

    .meal-option-info {
      flex: 1;
    }

    .meal-option-name {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .meal-option-details {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }

    .meal-option-arrow {
      width: 24px;
      height: 24px;
      background: #16a34a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .meal-option-arrow ion-icon {
      color: white;
      font-size: 14px;
    }
  `],
  standalone: true,
  imports: [IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonProgressBar, IonGrid, IonRow, IonCol, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, CommonModule]
})
export class Tab1Page implements OnInit, OnDestroy {
  userName = signal('Usuario');
  currentDate = signal('');

  // Entrenamiento activo
  activeWorkout = signal<ActiveWorkout | null>(null);
  workoutProgress = signal(0);
  timeRemaining = signal(0);

  // Servicios
  private workoutService = inject(WorkoutService);
  private nutritionService = inject(NutritionService);
  private router = inject(Router);
  private progressInterval: any;
  private dataUpdateInterval: any;
  private lastNutritionData: any;
  private lastHydrationData: any;

  // Datos de nutrición e hidratación
  dailyCalories = signal(0);
  waterGlasses = signal(6); // Estado compartido de vasos de agua
  targetCalories = 2000;
  targetWater = 8; // 8 vasos = 2L

  // Iconos
  playIcon = play;
  flameIcon = flame;
  waterIcon = water;
  bulbIcon = bulb;
  restaurantIcon = restaurant;
  barChartIcon = barChart;
  timeIcon = time;
  addIcon = addCircle;
  closeIcon = close;
  nutritionIcon = nutrition;

  // Recetas
  allRecipes = signal<Recipe[]>([]);

  // Estado del modal de receta
  showRecipeModal = false;
  selectedRecipe = signal<Recipe | null>(null);

  // Estado del modal selector de comidas
  showMealSelector = false;
  selectedRecipeForMeal = signal<Recipe | null>(null);

  // Datos de comidas para el selector
  meals: any[] = [
    {
      id: 'breakfast',
      icon: 'cafe',
      name: "Desayuno",
      time: "7:00 AM",
      items: [],
      pending: true,
    },
    {
      id: 'lunch',
      icon: 'sunny',
      name: "Almuerzo",
      time: "1:00 PM",
      items: [],
      pending: true,
    },
    {
      id: 'snack',
      icon: 'nutrition',
      name: "Snack",
      time: "4:00 PM",
      items: [],
      pending: true,
    },
    {
      id: 'dinner',
      icon: 'moon',
      name: "Cena",
      time: "8:00 PM",
      items: [],
      pending: true,
    },
  ];

  ngOnInit() {
    this.loadUserData();
    this.setCurrentDate();
    this.initializeActiveWorkout();
    this.loadNutritionData();
    this.loadHydrationData();
    this.loadAllRecipes();

    // Inicializar datos de referencia para comparación
    this.lastNutritionData = this.nutritionService.getDailyTotals();
    this.lastHydrationData = JSON.parse(localStorage.getItem('hydrationData') || '{}');

    // Actualizar datos cada 2 segundos para sincronizar con otras tabs
    this.dataUpdateInterval = setInterval(() => {
      this.checkForDataUpdates();
    }, 2000);
  }

  ngOnDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    if (this.dataUpdateInterval) {
      clearInterval(this.dataUpdateInterval);
    }
  }

  private initializeActiveWorkout() {
    // Cargar entrenamiento activo inicial
    this.updateActiveWorkout();

    // Actualizar cada segundo para la progress bar
    this.progressInterval = setInterval(() => {
      this.updateActiveWorkout();
    }, 1000);
  }

  private updateActiveWorkout() {
    const active = this.workoutService.getActiveWorkout();
    this.activeWorkout.set(active);

    if (active) {
      this.workoutProgress.set(this.workoutService.getWorkoutProgress());
      this.timeRemaining.set(Math.ceil(this.workoutService.getTimeRemaining()));
    }
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
    // Navegar a la pestaña de entrenamientos
    this.router.navigate(['/tabs/workout']);
  }

  private loadNutritionData() {
    const nutritionTotals = this.nutritionService.getDailyTotals();
    this.dailyCalories.set(nutritionTotals.calories);
  }

  private loadHydrationData() {
    // Cargar estado de hidratación desde localStorage
    const stored = localStorage.getItem('hydrationData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.waterGlasses.set(parsed.glasses || 6);
      } catch (e) {
        console.error('Error loading hydration data:', e);
      }
    }
  }

  private checkForDataUpdates() {
    // Verificar cambios en nutrición
    const currentNutrition = this.nutritionService.getDailyTotals();
    if (JSON.stringify(currentNutrition) !== JSON.stringify(this.lastNutritionData)) {
      this.lastNutritionData = currentNutrition;
      this.loadNutritionData();
    }

    // Verificar cambios en hidratación
    const hydrationData = localStorage.getItem('hydrationData');
    if (hydrationData) {
      const parsed = JSON.parse(hydrationData);
      if (JSON.stringify(parsed) !== JSON.stringify(this.lastHydrationData)) {
        this.lastHydrationData = parsed;
        this.loadHydrationData();
      }
    }
  }

  // Método para actualizar datos de nutrición (llamado desde otras tabs)
  updateNutritionData() {
    this.loadNutritionData();
  }

  // Método para actualizar datos de hidratación (llamado desde otras tabs)
  updateHydrationData(glasses: number) {
    this.waterGlasses.set(glasses);
    // Guardar en localStorage para compartir entre tabs
    localStorage.setItem('hydrationData', JSON.stringify({ glasses }));
  }

  continueWorkout() {
    const activeWorkout = this.activeWorkout();
    if (activeWorkout) {
      // Navegar a la página de entrenamientos con el workout activo seleccionado
      this.router.navigate(['/tabs/workout'], {
        state: { selectedWorkoutId: activeWorkout.workout.id }
      });
    }
  }

  // Métodos para recetas
  private loadAllRecipes() {
    const recipes = this.nutritionService.getAllRecipes();
    this.allRecipes.set(recipes);
  }

  // Método para abrir modal de receta
  openRecipeModal(recipe: Recipe) {
    this.selectedRecipe.set(recipe);
    this.showRecipeModal = true;
  }

  closeRecipeModal() {
    this.showRecipeModal = false;
    this.selectedRecipe.set(null);
  }

  // Método para añadir receta completa a una comida
  addRecipeToMeal(event: Event, recipe: Recipe) {
    event.stopPropagation(); // Evitar que se abra el modal de detalles
    this.selectedRecipeForMeal.set(recipe);
    this.showMealSelector = true;
  }

  // Método para confirmar añadir receta a una comida específica
  confirmAddRecipeToMeal(mealId: string) {
    const recipe = this.selectedRecipeForMeal();
    if (recipe) {
      this.nutritionService.addRecipeToMeal(mealId, recipe);
      console.log(`Recipe "${recipe.name}" added to ${mealId}`);
    }
    this.closeMealSelector();
  }

  closeMealSelector() {
    this.showMealSelector = false;
    this.selectedRecipeForMeal.set(null);
  }

  // Método para iconos de comidas
  getMealIcon(iconName: string): string {
    switch (iconName) {
      case 'cafe': return this.playIcon; // Usando playIcon como placeholder
      case 'sunny': return this.flameIcon; // Usando flameIcon como placeholder
      case 'moon': return this.waterIcon; // Usando waterIcon como placeholder
      case 'nutrition': return this.nutritionIcon;
      default: return this.nutritionIcon;
    }
  }

  // Método para calcular totales por comida
  getMealTotals(mealId: string) {
    return this.nutritionService.getMealTotals(mealId);
  }
}