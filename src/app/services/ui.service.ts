import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class UiService {
  constructor(private toastCtrl: ToastController) {}

  async showToast(message: string, duration = 2000) {
    const t = await this.toastCtrl.create({ message, duration });
    await t.present();
  }
}
