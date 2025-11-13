import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';
import { StatusBar } from '@capacitor/status-bar';

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
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (error) {
      console.log('StatusBar not available', error);
    }
  }
}
