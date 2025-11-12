import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  public isDark = false;
  constructor() {
    // initialize from saved preference (if any)
    try {
      const saved = localStorage.getItem('fitlife-theme');
      this.isDark = saved === 'dark';
      this.applyTheme();
    } catch (e) {}
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    try { localStorage.setItem('fitlife-theme', this.isDark ? 'dark' : 'light'); } catch (e) {}
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }
}
