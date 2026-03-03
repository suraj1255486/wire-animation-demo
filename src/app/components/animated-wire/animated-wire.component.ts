import { Component, AfterViewInit, OnDestroy, NgZone, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, remove } from 'animejs';

@Component({
  selector: 'app-animated-wire',
  templateUrl: './animated-wire.component.html',
  styleUrls: ['./animated-wire.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AnimatedWireComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() pathData: string = 'M10.37,2.29 L2.87,12.79 L30.37,17.54 L30.37,21.29 L63.22,20.06 L63.22,41.52';
  @Input() viewBox: string = '0 0 66 44';
  @Input() color: string = '#FFE000';
  @Input() duration: number = 3500;
  @Input() trailLength: number = 20;
  @Input() autoStart: boolean = true;
  @Input() reverse: boolean = false;
  @Input() showParticles: boolean = true;

  @ViewChild('pathRef') pathRef!: ElementRef<SVGPathElement>;
  @ViewChild('particlePathRef') particlePathRef!: ElementRef<SVGPathElement>;
  @ViewChild('svgRef') svgRef!: ElementRef<SVGSVGElement>;

  public instanceId = Math.random().toString(36).substring(2, 9);
  private currentAnimation: any = null;
  private destroyed = false;
  private isPaused = false;
  private isInitialized = false;
  private flowTimeout: any = null;

  public startPoint = { x: 0, y: 0 };
  public endPoint = { x: 0, y: 0 };

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Only restart on subsequent changes, not the initial one
    if (this.isInitialized) {
      const needsRestart = changes['pathData'] || changes['showParticles'] || changes['reverse'] || changes['duration'] || changes['trailLength'];
      if (needsRestart) {
        this.restart();
      }
    }
  }

  ngAfterViewInit() {
    this.isInitialized = true;
    if (this.autoStart) {
      this.ngZone.runOutsideAngular(() => {
        // Reduced delay to start faster after view init
        this.flowTimeout = setTimeout(() => this.startFlow(), 100);
      });
    }
  }

  public start() {
    this.isPaused = false;
    if (this.currentAnimation) {
      this.currentAnimation.play();
    } else {
      this.startFlow();
    }
  }

  public stop() {
    this.isPaused = true;
    if (this.currentAnimation) this.currentAnimation.pause();
    if (this.flowTimeout) clearTimeout(this.flowTimeout);
  }

  public toggleReverse(isReverse: boolean) {
    this.reverse = isReverse;
    this.restart();
  }

  public restart() {
    // If we're restarting, we shouldn't necessarily be "paused" 
    // unless the user explicitly stopped the animation.
    const wasPaused = this.isPaused;
    this.cleanup();
    this.isPaused = wasPaused;
    this.startFlow();
  }

  private cleanup() {
    if (this.particlePathRef?.nativeElement) {
      remove(this.particlePathRef.nativeElement);
    }
    this.currentAnimation = null;
    if (this.flowTimeout) clearTimeout(this.flowTimeout);
  }

  private startFlow() {
    if (this.destroyed || this.isPaused) return;

    const pathEl = this.pathRef?.nativeElement;
    const particlePathEl = this.particlePathRef?.nativeElement;
    
    if (pathEl) {
      // 1. Core wire setup: ensure fully visible for the permanent arrow
      pathEl.style.strokeDasharray = 'none';
      pathEl.style.strokeDashoffset = '0';
      pathEl.style.opacity = '0.9';

      const totalLen = pathEl.getTotalLength();
      if (totalLen === 0) {
        // If the path hasn't rendered yet, try again in a moment
        this.flowTimeout = setTimeout(() => this.startFlow(), 100);
        return;
      }
      
      // Update points for mask logic (merging effect)
      const p1 = pathEl.getPointAtLength(0);
      const p2 = pathEl.getPointAtLength(totalLen);
      this.startPoint = { x: p1.x, y: p1.y };
      this.endPoint = { x: p2.x, y: p2.y };
      this.cdr.detectChanges();

      // 3. Flowing Neon Trail Logic (Layered)
      if (this.showParticles && particlePathEl) {
        this.cleanup();
        this.isPaused = false;

        // Target both trail layers (core and glow)
        const glowPathEl = this.svgRef.nativeElement.querySelector('.trail-glow') as SVGPathElement;
        const trailPaths = glowPathEl ? [glowPathEl, particlePathEl] : [particlePathEl];

        trailPaths.forEach(p => {
          p.style.strokeDasharray = `${this.trailLength} ${totalLen}`;
        });
        
        const startOffset = this.reverse ? -totalLen : this.trailLength;
        const endOffset = this.reverse ? this.trailLength : -totalLen;

        this.currentAnimation = animate(trailPaths, {
          strokeDashoffset: [startOffset, endOffset],
          duration: this.duration,
          easing: 'linear',
          onComplete: () => {
            if (!this.destroyed && !this.isPaused) {
              this.flowTimeout = setTimeout(() => this.startFlow(), 100);
            }
          }
        });
      }
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.cleanup();
  }
}


