import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class Tab5Page implements OnInit {

  isDesktop = signal(false);

  constructor() { }

  ngOnInit() {
    this.checkDeviceType();
  }

  private checkDeviceType() {
    this.isDesktop.set(window.innerWidth >= 768);
  }

}
