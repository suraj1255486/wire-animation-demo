import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  signal,
  viewChild,
} from "@angular/core";
import { animate } from "animejs";

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
  lightningPath1 = viewChild<ElementRef<SVGPathElement>>("lightningPath1");
  lightningPath2 = viewChild<ElementRef<SVGPathElement>>("lightningPath2");

  instanceId = Math.random().toString(36).substring(2, 9);

  private totalLength = 0;
  private animation: any = null;
  private destroyed = false;

  startPoint = signal({ x: 0, y: 0 });
  endPoint = signal({ x: 0, y: 0 });

  // Computed mask position based on direction
  maskCenter = computed(() =>
    this.reverse() ? this.startPoint() : this.endPoint(),
  );

  // Helper to get all animated path elements
  private get animatedPaths(): SVGPathElement[] {
    return [
      this.particlePathRef()?.nativeElement,
      this.trailGlowRef()?.nativeElement,
      this.lightningPath1()?.nativeElement,
      this.lightningPath2()?.nativeElement,
    ].filter((p): p is SVGPathElement => !!p);
  }

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

    try {
      this.totalLength = pathEl.getTotalLength();

      // Only calculate points if the path has length
      if (this.totalLength > 0) {
        const start = pathEl.getPointAtLength(0);
        const end = pathEl.getPointAtLength(this.totalLength);

        this.startPoint.set({ x: start.x, y: start.y });
        this.endPoint.set({ x: end.x, y: end.y });
      }
    } catch (e) {
      console.warn("SVG Path calculation failed:", e);
      this.totalLength = 0;
    }
  }

  public startAnimation() {
    if (!this.showParticles() || !this.totalLength) return;
    this.stopAnimation();

    const paths = this.animatedPaths;
    if (paths.length === 0) return;

    paths.forEach((p) => {
      p.style.strokeDasharray = `${this.trailLength()} ${this.totalLength}`;
    });

    const isRev = this.reverse();
    const startOffset = isRev ? -this.totalLength : this.trailLength();
    const endOffset = isRev ? this.trailLength() : -this.totalLength;

    this.ngZone.runOutsideAngular(() => {
      this.animation = animate(paths, {
        strokeDashoffset: [startOffset, endOffset],
        duration: this.duration(),
        easing: "linear",
        loop: true,
      });
    });
  }

  public restartAnimation() {
    if (this.destroyed) return;

    this.stopAnimation();
    queueMicrotask(() => {
      // Re-calculate path metrics in case pathData changed
      this.initializePath();
      this.startAnimation();
    });
  }

  public stopAnimation() {
    if (this.animation) {
      this.animation.revert();
      this.animation = null;
    }

    // Hide all paths by resetting dasharray
    this.animatedPaths.forEach((p) => {
      p.style.strokeDasharray = `0 9999`;
    });
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.stopAnimation();
  }
}
