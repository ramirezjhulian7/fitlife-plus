import { Component, EnvironmentInjector, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { home, barbell, leaf, trendingUp, person } from 'ionicons/icons';
import { DesktopSidebarComponent } from '../components/desktop-sidebar.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, CommonModule, DesktopSidebarComponent],
})
export class TabsPage implements OnInit, OnDestroy {
  public environmentInjector = inject(EnvironmentInjector);
  private router = inject(Router);
  private authService = inject(AuthService);

  isDesktop = signal(false);
  activeScreen = 'dashboard';
  userName = 'Usuario';
  private resizeListener: (() => void) | null = null;

  constructor() {
    addIcons({ home, barbell, leaf, trendingUp, person });
  }

  ngOnInit() {
    this.checkDeviceType();
    this.setupResizeListener();
    this.getUserName();
    this.updateActiveScreen();

    // Escuchar cambios de navegación
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveScreen();
      });
  }

  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private checkDeviceType() {
    // Considerar tablet o desktop si el ancho es mayor a 768px (md breakpoint en Tailwind)
    this.isDesktop.set(window.innerWidth >= 768);
  }

  private setupResizeListener() {
    this.resizeListener = () => this.checkDeviceType();
    window.addEventListener('resize', this.resizeListener);
  }

  private getUserName() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.userName = parsed.name || 'Usuario';
      } catch (e) {
        this.userName = 'Usuario';
      }
    }
  }

  private updateActiveScreen() {
    const url = this.router.url;
    if (url.includes('/dashboard')) {
      this.activeScreen = 'dashboard';
    } else if (url.includes('/workout')) {
      this.activeScreen = 'workout';
    } else if (url.includes('/nutrition')) {
      this.activeScreen = 'nutrition';
    } else if (url.includes('/progress')) {
      this.activeScreen = 'progress';
    } else if (url.includes('/profile')) {
      this.activeScreen = 'profile';
    }
  }

  onNavigate(screen: string) {
    this.router.navigate([`/tabs/${screen}`]);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
