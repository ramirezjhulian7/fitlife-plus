import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';
import { StatusBar, StatusBarInfo } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    // Configure status bar for Android
    this.configureStatusBar();
  }

  private async configureStatusBar() {
    // Only configure status bar on native platforms
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (error) {
        console.log('StatusBar configuration failed', error);
      }
    }
  }
}
