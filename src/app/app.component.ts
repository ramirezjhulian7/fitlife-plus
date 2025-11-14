import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private platform: Platform) {
    // Status bar configuration is handled in main.ts
  }

  ngOnInit() {
    // Add platform-specific classes to body
    if (this.platform.is('android')) {
      document.body.classList.add('platform-android');
    }
    if (this.platform.is('ios')) {
      document.body.classList.add('platform-ios');
    }
  }
}
