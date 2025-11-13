import { Component, inject, signal, ViewChild } from '@angular/core';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonProgressBar, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { add, cafe, sunny, moon, nutrition, water, trash, close, time } from 'ionicons/icons';
import { NutritionService, MealItem, Recipe } from '../../services/nutrition.service';
import { AddFoodModalComponent } from '../../components/add-food-modal/add-food-modal.component';
import { AuthService } from '../../services/auth.service';

interface Meal {
  id: string;
  icon: string;
  name: string;
  time: string;
  items: MealItem[];
  pending?: boolean;
}

@Component({
  selector: 'app-tab3',
  template: `
    <ion-content [fullscreen]="false" class="nutrition-bg">
      <div class="nutrition-container">
        <!-- Header con gradiente -->
        <div class="header-gradient">
          <h2 class="header-title">Nutrición</h2>

          <ion-card class="calories-card">
            <ion-card-content>
              <div class="calories-header">
                <p class="calories-label">Calorías de hoy</p>
                <p class="calories-value">
                  <span class="calories-number">{{ getDailyTotals().calories.toFixed(0) }}</span> / {{ targetCalories }}
                </p>
              </div>
              <ion-progress-bar
                [value]="getCaloriesProgress()"
                class="calories-progress">
              </ion-progress-bar>
              <div class="macros-grid">
                <div class="macro-item">
                  <p class="macro-label">Proteínas</p>
                  <p class="macro-value">{{ getDailyTotals().protein.toFixed(1) }}g</p>
                </div>
                <div class="macro-item">
                  <p class="macro-label">Carbos</p>
                  <p class="macro-value">{{ getDailyTotals().carbs.toFixed(1) }}g</p>
                </div>
                <div class="macro-item">
                  <p class="macro-label">Grasas</p>
                  <p class="macro-value">{{ getDailyTotals().fat.toFixed(1) }}g</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Contenido principal -->
        <div class="content-grid">
          <!-- Columna izquierda - Registro de comidas -->
          <div class="meals-column">
            <div class="meals-header">
              <h3 class="meals-title">Registro de comidas</h3>
              <ion-button fill="solid" color="success" size="small" class="add-button" (click)="addExtraMeal()">
                <ion-icon slot="start" [icon]="addIcon"></ion-icon>
                Añadir
              </ion-button>
            </div>

            <div class="meals-list">
              <ion-card *ngFor="let meal of meals; let i = index" class="meal-card">
                <ion-card-content>
                  <div class="meal-content">
                    <div class="meal-icon">
                      <ion-icon [icon]="getMealIcon(meal.icon)" size="large"></ion-icon>
                    </div>
                    <div class="meal-info">
                    <div class="meal-header">
                      <p class="meal-name">{{ meal.name }}</p>
                      <div class="meal-header-actions">
                        <span class="meal-time">{{ meal.time }}</span>
                        <ion-button
                          *ngIf="meal.id.startsWith('extra-')"
                          fill="clear"
                          color="danger"
                          size="small"
                          class="delete-meal-button"
                          (click)="removeExtraMeal(meal.id)">
                          <ion-icon [icon]="trashIcon"></ion-icon>
                        </ion-button>
                      </div>
                    </div>
                      <ng-container *ngIf="meal.items.length === 0 && meal.pending; else mealItems">
                        <ion-button
                          fill="outline"
                          color="success"
                          size="small"
                          class="add-food-button"
                          (click)="openAddFoodModal(meal.id)">
                          <ion-icon slot="start" [icon]="addIcon"></ion-icon>
                          Añadir alimentos
                        </ion-button>
                      </ng-container>
                      <ng-template #mealItems>
                        <div class="meal-items-list">
                          <div *ngFor="let item of meal.items; let itemIndex = index" class="meal-item-row">
                            <div class="meal-item-info">
                              <span class="meal-item-name">{{ item.food.name }}</span>
                              <span class="meal-item-quantity">{{ item.quantity }}g</span>
                            </div>
                            <div class="meal-item-actions">
                              <span class="meal-item-calories">{{ item.calculatedCalories.toFixed(0) }} kcal</span>
                              <ion-button
                                fill="clear"
                                color="danger"
                                size="small"
                                (click)="removeFoodFromMeal(meal.id, itemIndex)">
                                <ion-icon [icon]="trashIcon"></ion-icon>
                              </ion-button>
                            </div>
                          </div>
                        </div>
                        <div class="meal-totals">
                          <p class="meal-calories">{{ getMealTotals(meal.id).calories.toFixed(0) }} kcal</p>
                          <ion-button
                            fill="outline"
                            color="success"
                            size="small"
                            (click)="openAddFoodModal(meal.id)">
                            <ion-icon slot="start" [icon]="addIcon"></ion-icon>
                            Añadir más
                          </ion-button>
                        </div>
                      </ng-template>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </div>
          </div>

          <!-- Columna derecha - Hidratación y recetas -->
          <div class="right-column">
            <!-- Hidratación -->
            <ion-card class="hydration-card">
              <ion-card-content>
                <div class="hydration-header">
                  <div class="hydration-icon">
                    <ion-icon [icon]="waterIcon" size="large"></ion-icon>
                  </div>
                  <div class="hydration-info">
                    <h4 class="hydration-title">Hidratación</h4>
                    <p class="hydration-amount">
                      {{ waterGlasses() * 250 }}ml / 2000ml
                    </p>
                  </div>
                </div>
                <div class="water-glasses">
                  <button
                    *ngFor="let glass of waterGlassesArray; let i = index"
                    class="water-glass"
                    [class.filled]="i < waterGlasses()"
                    (click)="setWaterGlasses(i + 1)">
                  </button>
                </div>
              </ion-card-content>
            </ion-card>

            <!-- Recetas recomendadas -->
            <ion-card class="recipes-card">
              <ion-card-header>
                <ion-card-title class="recipes-title">Recetas recomendadas</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="recipes-list">
                  <div *ngFor="let recipe of recipes()" class="recipe-item" (click)="openRecipeModal(recipe)">
                    <div class="recipe-image">
                      <img [src]="recipe.image" [alt]="recipe.name" class="recipe-img">
                    </div>
                    <div class="recipe-info">
                      <p class="recipe-name">{{ recipe.name }}</p>
                      <p class="recipe-details">{{ recipe.time }} • {{ recipe.totalCalories }} kcal</p>
                      <ion-button
                        fill="solid"
                        color="success"
                        size="small"
                        class="add-recipe-btn"
                        (click)="addRecipeToMeal($event, recipe)">
                        <ion-icon slot="start" [icon]="addIcon"></ion-icon>
                        Añadir
                      </ion-button>
                    </div>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </div>
        </div>
      </div>

      <!-- Modal para añadir alimentos -->
      <app-add-food-modal
        [isOpen]="showAddFoodModal"
        [mealType]="currentMealType"
        (foodAdded)="onFoodAdded()"
        (closeModal)="closeAddFoodModal()">
      </app-add-food-modal>

      <!-- Modal para detalles de receta -->
      <ion-modal [isOpen]="showRecipeModal" (willDismiss)="closeRecipeModal()" class="recipe-modal">
        <ng-template>
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
        </ng-template>
      </ion-modal>

      <!-- Modal para seleccionar comida -->
      <ion-modal [isOpen]="showMealSelector" (willDismiss)="closeMealSelector()" class="meal-selector-modal">
        <ng-template>
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
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
  styles: [`
    .nutrition-bg {
      --background: #f8fafc;
    }

    .nutrition-container {
      padding: 24px 24px 100px 24px; /* Extra padding bottom for tabs */
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
      margin: 0 0 24px 0;
    }

    .calories-card {
      --background: rgba(255, 255, 255, 0.1);
      --color: white;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      margin: 0;
    }

    .calories-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .calories-label {
      font-size: 16px;
      margin: 0;
    }

    .calories-value {
      font-size: 14px;
      margin: 0;
    }

    .calories-number {
      font-size: 24px;
      font-weight: 700;
    }

    .calories-progress {
      --background: rgba(255, 255, 255, 0.2);
      margin-bottom: 16px;
    }

    .macros-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .macro-item {
      text-align: center;
    }

    .macro-label {
      font-size: 12px;
      opacity: 0.8;
      margin: 0 0 4px 0;
    }

    .macro-value {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .meals-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .meals-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .meals-title {
      color: #16a34a;
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .add-button {
      --border-radius: 8px;
    }

    .meals-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .meal-card {
      --background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin: 0;
    }

    .meal-content {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .meal-icon {
      width: 48px;
      height: 48px;
      background: #dcfce7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .meal-icon ion-icon {
      color: #16a34a;
    }

    .meal-info {
      flex: 1;
    }

    .meal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .meal-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meal-name {
      font-size: 16px;
      font-weight: 500;
      color: #111827;
      margin: 0;
    }

    .meal-time {
      font-size: 14px;
      color: #6b7280;
    }

    .delete-meal-button {
      --padding-start: 4px;
      --padding-end: 4px;
      --padding-top: 4px;
      --padding-bottom: 4px;
      min-width: 32px;
      height: 32px;
    }

    .delete-meal-button ion-icon {
      font-size: 16px;
    }

    .meal-items-list {
      margin-bottom: 12px;
    }

    .meal-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .meal-item-row:last-child {
      border-bottom: none;
    }

    .meal-item-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .meal-item-name {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .meal-item-quantity {
      font-size: 12px;
      color: #6b7280;
    }

    .meal-item-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meal-item-calories {
      font-size: 12px;
      color: #16a34a;
      font-weight: 500;
    }

    .meal-totals {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;
    }

    .meal-calories {
      font-size: 14px;
      color: #16a34a;
      font-weight: 500;
      margin: 0;
    }

    .add-food-button {
      --border-radius: 6px;
      margin-top: 8px;
    }

    .right-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hydration-card {
      --background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
    }

    .hydration-header {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 16px;
    }

    .hydration-icon {
      width: 48px;
      height: 48px;
      background: #2563eb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .hydration-icon ion-icon {
      color: white;
    }

    .hydration-info {
      flex: 1;
    }

    .hydration-title {
      color: #2563eb;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .hydration-amount {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .water-glasses {
      display: flex;
      gap: 8px;
    }

    .water-glass {
      flex: 1;
      height: 48px;
      border-radius: 8px;
      border: none;
      background: #e5e7eb;
      transition: background-color 0.2s ease;
      cursor: pointer;
    }

    .water-glass.filled {
      background: #2563eb;
    }

    .water-glass:hover {
      opacity: 0.8;
    }

    .recipes-card {
      --background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .recipes-title {
      color: #16a34a;
      font-size: 18px;
    }

    .recipes-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .recipe-item {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .recipe-item:hover {
      background: #f3f4f6;
    }

    .recipe-info {
      flex: 1;
    }

    .recipe-name {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .recipe-details {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }

    .add-recipe-btn {
      --border-radius: 6px;
      margin-top: 8px;
    }

    .recipe-image {
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

    .recipe-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .recipe-info {
      flex: 1;
    }

    .recipe-name {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .recipe-details {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }

    /* Desktop responsive */
    @media (min-width: 768px) {
      .nutrition-container {
        padding: 24px;
      }

      .content-grid {
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
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
  imports: [IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonProgressBar, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, CommonModule, AddFoodModalComponent]
})
export class Tab3Page {
  // Servicios
  private nutritionService = inject(NutritionService);
  private authService = inject(AuthService);

  // Estado del modal
  showAddFoodModal = false;
  currentMealType: string = 'breakfast';

  // Estado
  waterGlasses = signal(6);
  targetCalories = 2000;

  // Iconos
  addIcon = add;
  cafeIcon = cafe;
  sunnyIcon = sunny;
  moonIcon = moon;
  nutritionIcon = nutrition;
  waterIcon = water;
  trashIcon = trash;
  closeIcon = close;
  timeIcon = time;

  // Array para los vasos de agua (8 vasos)
  waterGlassesArray = Array(8).fill(0);

  // Datos de comidas
  meals: Meal[] = [
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

  // Recetas recomendadas (se actualizan dinámicamente)
  recipes = signal<Recipe[]>([]);

  ngOnInit() {
    this.updateMealsData();
    this.loadRandomRecipes();
    this.loadHydrationData();
  }

  // Cargar 3 recetas aleatorias
  private loadRandomRecipes() {
    const randomRecipes = this.nutritionService.getRandomRecipes(3);
    this.recipes.set(randomRecipes);
  }

  // Actualizar datos de comidas desde el servicio
  private updateMealsData() {
    const mealsData = this.nutritionService.getMeals();

    // Actualizar comidas estándar
    this.meals.forEach(meal => {
      if (['breakfast', 'lunch', 'snack', 'dinner'].includes(meal.id)) {
        meal.items = mealsData().get(meal.id) || [];
        meal.pending = meal.items.length === 0;
      }
    });

    // Agregar comidas extra dinámicas
    const extraMeals: Meal[] = [];
    mealsData().forEach((items, mealId) => {
      if (mealId.startsWith('extra-')) {
        const number = mealId.split('-')[1];
        extraMeals.push({
          id: mealId,
          icon: 'nutrition',
          name: `Comida extra ${number}`,
          time: "",
          items: items,
          pending: items.length === 0,
        });
      }
    });

    // Combinar comidas estándar con extra
    this.meals = [
      ...this.meals.filter(meal => ['breakfast', 'lunch', 'snack', 'dinner'].includes(meal.id)),
      ...extraMeals
    ];
  }

  // Métodos para cálculos
  getDailyTotals() {
    return this.nutritionService.getDailyTotals();
  }

  getCaloriesProgress(): number {
    return this.getDailyTotals().calories / this.targetCalories;
  }

  getMealTotals(mealId: string) {
    const mealType = this.getMealTypeFromId(mealId);
    return this.nutritionService.getMealTotals(mealType);
  }

  private getMealTypeFromId(mealId: string): string {
    // Para comidas estándar y extra, devolver el mismo ID
    return mealId;
  }

  // Métodos para iconos
  getMealIcon(iconName: string): string {
    switch (iconName) {
      case 'cafe': return this.cafeIcon;
      case 'sunny': return this.sunnyIcon;
      case 'moon': return this.moonIcon;
      case 'nutrition': return this.nutritionIcon;
      default: return this.nutritionIcon;
    }
  }

  // Métodos para el modal
  openAddFoodModal(mealId: string) {
    this.currentMealType = this.getMealTypeFromId(mealId);
    this.showAddFoodModal = true;
    console.log('Opening modal for meal:', this.currentMealType);
  }

  closeAddFoodModal() {
    this.showAddFoodModal = false;
  }

  onFoodAdded() {
    console.log('Food added, updating meals data');
    this.updateMealsData();
    this.closeAddFoodModal();
  }

  // Métodos para gestión de alimentos
  removeFoodFromMeal(mealId: string, itemIndex: number) {
    const mealType = this.getMealTypeFromId(mealId);
    this.nutritionService.removeFoodFromMeal(mealType, itemIndex);
    this.updateMealsData();
  }

  // Método para añadir comida extra
  addExtraMeal() {
    const mealId = this.nutritionService.addExtraMeal();
    this.updateMealsData();
    console.log('Added extra meal with ID:', mealId);
  }

  // Método para eliminar comida extra
  removeExtraMeal(mealId: string) {
    this.nutritionService.removeExtraMeal(mealId);
    this.updateMealsData();
    console.log('Removed extra meal with ID:', mealId);
  }

  // Método para vasos de agua
  setWaterGlasses(glasses: number) {
    this.waterGlasses.set(glasses);
    // Guardar en localStorage para compartir con otras tabs
    const userId = this.authService.currentUser?.id;
    if (userId) {
      localStorage.setItem(`hydrationData_${userId}`, JSON.stringify({ glasses, timestamp: Date.now() }));
    }
  }

  // Método para cargar datos de hidratación
  private loadHydrationData() {
    const userId = this.authService.currentUser?.id;
    if (!userId) return;

    const stored = localStorage.getItem(`hydrationData_${userId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Solo cargar si es del día actual
        const today = new Date().toDateString();
        const storedDate = new Date(data.timestamp).toDateString();

        if (today === storedDate) {
          this.waterGlasses.set(data.glasses);
        }
      } catch (error) {
        console.error('Error loading hydration data:', error);
      }
    }
  }

  // Método para abrir modal de receta
  selectedRecipe = signal<Recipe | null>(null);
  showRecipeModal = false;

  openRecipeModal(recipe: Recipe) {
    this.selectedRecipe.set(recipe);
    this.showRecipeModal = true;
  }

  closeRecipeModal() {
    this.showRecipeModal = false;
    this.selectedRecipe.set(null);
  }

  // Método para añadir receta completa a una comida
  selectedRecipeForMeal = signal<Recipe | null>(null);
  showMealSelector = false;

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
      this.updateMealsData();
      console.log(`Recipe "${recipe.name}" added to ${mealId}`);
    }
    this.closeMealSelector();
  }

  closeMealSelector() {
    this.showMealSelector = false;
    this.selectedRecipeForMeal.set(null);
  }
}