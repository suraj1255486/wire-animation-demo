import { Component, ViewChild } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons } from '@ionic/angular/standalone';
import { AnimatedWireComponent } from '../components/animated-wire/animated-wire.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, AnimatedWireComponent],
})
export class HomePage {
  public path1 = 'M10.37,2.29 L2.87,12.79 L30.37,17.54 L30.37,21.29 L63.22,20.06 L63.22,41.52';
  public path2 = 'M75.0704 38.1987 L51.6938 39.7571 L51.6937 11.0937 L2.50006 2.59386 L2.50006 15.0939';
  public path3 = 'M2.0625 5.72119 L27.6221 2.49609';
  public isReversed = false;

  @ViewChild('wire1') wire1!: AnimatedWireComponent;
  @ViewChild('wire2') wire2!: AnimatedWireComponent;
  @ViewChild('wire3') wire3!: AnimatedWireComponent;

  startFlow() {
    this.wire1.start();
    this.wire2.start();
    this.wire3.start();
  }

  stopFlow() {
    this.wire1.stop();
    this.wire2.stop();
    this.wire3.stop();
  }

  reverseFlow() {
    this.isReversed = !this.isReversed;
    this.wire1.toggleReverse(this.isReversed);
    this.wire2.toggleReverse(this.isReversed);
    this.wire3.toggleReverse(this.isReversed);
  }
}
