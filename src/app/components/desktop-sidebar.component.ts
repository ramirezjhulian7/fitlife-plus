import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-desktop-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="desktop-sidebar">
      <div class="sidebar-header">
        <div class="logo-section">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <div class="logo-text">
            <h3>FitLife+</h3>
          </div>
        </div>

        <div class="user-section">
          <div class="user-avatar">
            <span>{{ userName.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="user-info">
            <p class="user-name">{{ userName }}</p>
            <p class="user-subtitle" (click)="onNavigate.emit('profile')">Ver perfil</p>
          </div>
        </div>

        <div class="separator"></div>

        <nav class="nav-menu">
          <button
            *ngFor="let item of navItems"
            [class.active]="activeScreen === item.id"
            (click)="onNavigate.emit(item.id)"
            class="nav-item"
          >
            <div class="nav-icon" [innerHTML]="item.icon"></div>
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </div>

      <div class="sidebar-footer">
        <div class="separator"></div>
        <button class="logout-btn" (click)="onLogout.emit()">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .desktop-sidebar {
      width: 256px;
      background: white;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: relative;
      overflow-y: auto;
      z-index: 1000;
    }

    .sidebar-header {
      padding: 24px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: #dcfce7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #16a34a;
    }

    .logo-text h3 {
      color: #16a34a;
      font-size: 18px;
      font-weight: 700;
      margin: 0;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: #16a34a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-subtitle {
      margin: 0;
      font-size: 12px;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      transition: color 0.2s;
    }

    .user-subtitle:hover {
      color: #16a34a;
    }

    .separator {
      height: 1px;
      background: #e5e7eb;
      margin-bottom: 16px;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      transition: all 0.2s;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      color: #374151;
    }

    .nav-item:hover {
      background: #f9fafb;
    }

    .nav-item.active {
      background: #dcfce7;
      color: #16a34a;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nav-icon svg {
      width: 20px;
      height: 20px;
      stroke-width: 2;
    }

    .nav-item.active .nav-icon svg {
      stroke-width: 2.5;
    }

    .sidebar-footer {
      margin-top: auto;
      padding: 24px;
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      color: #dc2626;
      background: #fef2f2;
    }
  `]
})
export class DesktopSidebarComponent {
  @Input() activeScreen: string = 'dashboard';
  @Input() userName: string = 'Usuario';
  @Output() onNavigate = new EventEmitter<string>();
  @Output() onLogout = new EventEmitter<void>();

  navItems = [
    {
      id: 'dashboard',
      label: 'Inicio',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9,22 9,12 15,12 15,22"></polyline>
      </svg>`
    },
    {
      id: 'workout',
      label: 'Entrenamientos',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
      </svg>`
    },
    {
      id: 'nutrition',
      label: 'Nutrición',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12c.552 0 1 .448 1 1v2c0 2.761-2.239 5-5 5s-5-2.239-5-5v-2c0-.552.448-1 1-1h8z"></path>
        <path d="M5 12H3c-.552 0-1 .448-1 1v2c0 2.761 2.239 5 5 5s5-2.239 5-5v-2c0-.552-.448-1-1-1h-2"></path>
        <path d="M12 3c-1.657 0-3 1.343-3 3v6c0 1.657 1.343 3 3 3s3-1.343 3-3V6c0-1.657-1.343-3-3-3z"></path>
      </svg>`
    },
    {
      id: 'progress',
      label: 'Progreso',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>`
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>`
    }
  ];
}