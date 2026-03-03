import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  signal,
  viewChild,
} from "@angular/core";
import { animate, remove } from "animejs";

@Component({
  selector: "app-animated-wire",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./animated-wire.component.html",
  styleUrls: ["./animated-wire.component.scss"],
})
export class AnimatedWireComponent implements AfterViewInit, OnDestroy {
  private ngZone = inject(NgZone);

  // SIGNAL INPUTS
  pathData = input(
    "M10.37,2.29 L2.87,12.79 L30.37,17.54 L30.37,21.29 L63.22,20.06 L63.22,41.52",
  );
  viewBox = input("0 0 66 44");
  color = input("#FFE000");
  duration = input(3500);
  trailLength = input(20);
  autoStart = input(true);
  reverse = input(false);
  showParticles = input(true);

  // ViewChild signal queries
  pathRef = viewChild<ElementRef<SVGPathElement>>("pathRef");
  particlePathRef = viewChild<ElementRef<SVGPathElement>>("particlePathRef");
  trailGlowRef = viewChild<ElementRef<SVGPathElement>>("trailGlowRef");

  instanceId = Math.random().toString(36).substring(2, 9);

  private totalLength = 0;
  private animation: any = null;
  private destroyed = false;

  startPoint = signal({ x: 0, y: 0 });
  endPoint = signal({ x: 0, y: 0 });

  constructor() {
    // Reactive animation restart using signals
    effect(() => {
      this.pathData();
      this.reverse();
      this.duration();
      this.trailLength();
      this.showParticles();

      this.restartAnimation();
    });
  }

  ngAfterViewInit() {
    this.initializePath();

    if (this.autoStart()) {
      this.startAnimation();
    }
  }

  private initializePath() {
    const pathEl = this.pathRef()?.nativeElement;
    if (!pathEl) return;

    this.totalLength = pathEl.getTotalLength();

    const start = pathEl.getPointAtLength(0);
    const end = pathEl.getPointAtLength(this.totalLength);

    this.startPoint.set({ x: start.x, y: start.y });
    this.endPoint.set({ x: end.x, y: end.y });
  }

  private startAnimation() {
    if (!this.showParticles() || !this.totalLength) return;

    const particle = this.particlePathRef()?.nativeElement;
    const glow = this.trailGlowRef()?.nativeElement;

    if (!particle) return;

    const paths = glow ? [glow, particle] : [particle];

    paths.forEach((p) => {
      p.style.strokeDasharray = `${this.trailLength()} ${this.totalLength}`;
    });

    const startOffset = this.reverse() ? -this.totalLength : this.trailLength();

    const endOffset = this.reverse() ? this.trailLength() : -this.totalLength;

    this.ngZone.runOutsideAngular(() => {
      this.animation = animate(paths, {
        strokeDashoffset: [startOffset, endOffset],
        duration: this.duration(),
        easing: "linear",
        loop: true,
      });
    });
  }

  private restartAnimation() {
    if (this.destroyed) return;

    this.stopAnimation();
    queueMicrotask(() => this.startAnimation());
  }

  stopAnimation() {
    if (this.animation) {
      remove(this.animation);
      this.animation = null;
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.stopAnimation();
  }
}
