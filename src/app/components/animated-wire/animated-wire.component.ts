import { Component, AfterViewInit, OnDestroy, NgZone, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate } from 'animejs';

@Component({
  selector: 'app-animated-wire',
  templateUrl: './animated-wire.component.html',
  styleUrls: ['./animated-wire.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AnimatedWireComponent implements AfterViewInit, OnDestroy {
  @Input() pathData: string = 'M10.37,2.29 L2.87,12.79 L30.37,17.54 L30.37,21.29 L63.22,20.06 L63.22,41.52';
  @Input() viewBox: string = '0 0 66 44';
  @Input() color: string = '#FFE000';
  @Input() duration: number = 3500;
  @Input() trailLength: number = 20;
  @Input() autoStart: boolean = true;
  @Input() reverse: boolean = false;

  @ViewChild('svgRef') svgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('pathRef') pathRef!: ElementRef<SVGPathElement>;
  @ViewChild('particlesGroup') particlesGroup!: ElementRef<SVGGElement>;

  public instanceId = Math.random().toString(36).substring(2, 9);
  private animation: any;
  private destroyed = false;
  private isPaused = false;
  private currentParticle: any;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    if (this.autoStart) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => this.startFlow(), 400);
      });
    }
  }

  public start() {
    this.isPaused = false;
    if (!this.animation) {
      this.startFlow();
    } else {
      this.animation.play();
    }
  }

  public stop() {
    this.isPaused = true;
    if (this.animation) {
      this.animation.pause();
    }
  }

  public toggleReverse(isReverse: boolean) {
    this.reverse = isReverse;
    this.restart();
  }

  public restart() {
    this.stop();
    if (this.currentParticle && this.currentParticle.parentNode) {
      this.currentParticle.parentNode.removeChild(this.currentParticle);
    }
    this.animation = null;
    this.startFlow();
  }

  private startFlow() {
    if (this.destroyed || this.isPaused) return;
    this.runSingleParticle();
  }

  private runSingleParticle() {
    const svg = this.svgRef.nativeElement;
    const group = this.particlesGroup.nativeElement;
    const pathEl = this.pathRef.nativeElement;

    if (!svg || !group || !pathEl) return;

    const totalLen = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = `${this.trailLength} ${totalLen}`;
    pathEl.style.strokeDashoffset = this.reverse ? String(-totalLen) : String(this.trailLength);

    // Create a clean, powerful Energy Core
    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particle.setAttribute('r', '2.8');
    particle.setAttribute('fill', `url(#electricGrad-${this.instanceId})`);
    particle.setAttribute('filter', `url(#particleGlow-${this.instanceId})`);
    particle.setAttribute('opacity', '0');
    group.appendChild(this.currentParticle = particle);

    const progress = { t: 0 };
    const totalPath = totalLen + this.trailLength;
    
    // Smooth start with meaningful burst
    const startPt = pathEl.getPointAtLength(this.reverse ? totalLen : 0);
    this.createSparkBurst(startPt.x, startPt.y, 8);

    this.animation = animate(progress, {
      t: 1,
      duration: this.duration,
      easing: 'linear',
      onUpdate: () => {
        const t = progress.t;
        let headDist: number;
        if (!this.reverse) {
          headDist = t * totalPath;
        } else {
          headDist = totalLen - (t * totalPath);
        }

        const dashStart = this.reverse ? headDist : headDist - this.trailLength;
        pathEl.style.strokeDashoffset = String(-dashStart);

        // Clamp for smooth sampling
        const sampledDist = Math.max(0, Math.min(totalLen, headDist));

        if (headDist >= -this.trailLength && headDist <= totalLen + this.trailLength) {
          const pt = pathEl.getPointAtLength(sampledDist);
          
          // Smooth follow (no jitter)
          particle.setAttribute('cx', String(pt.x));
          particle.setAttribute('cy', String(pt.y));
          
          const fadeZone = Math.min(this.trailLength, totalLen * 0.2);
          let opacity = 0.95;
          let scale = 1.0;
          
          const distToDestination = this.reverse ? headDist : totalLen - headDist;
          const distToStart = this.reverse ? totalLen - headDist : headDist;

          // Realistic scaling and fading at ends
          if (distToDestination < fadeZone) {
            const factor = Math.max(0, distToDestination / fadeZone);
            opacity = factor * 0.95;
            scale = 0.3 + (factor * 0.7);
            
            // Impact burst at destination
            if (distToDestination < 1 && progress.t < 0.99) {
               this.createSparkBurst(pt.x, pt.y, 10);
            }
          } else if (distToStart < fadeZone) {
            const factor = Math.max(0, distToStart / fadeZone);
            opacity = factor * 0.95;
            scale = 0.3 + (factor * 0.7);
          }

          particle.setAttribute('opacity', String(opacity));
          particle.setAttribute('r', String(2.8 * scale));

          // Occasional subtle energy trails (not excessive)
          if (Math.random() > 0.95) {
            this.createTrailSpark(pt.x, pt.y);
          }
        } else {
          particle.setAttribute('opacity', '0');
        }
      },
      onComplete: () => {
        if (particle.parentNode) group.removeChild(particle);
        pathEl.style.strokeDashoffset = this.reverse ? String(-totalLen) : String(this.trailLength);
        if (!this.destroyed && !this.isPaused) {
          setTimeout(() => this.startFlow(), 600);
        }
      }
    });
  }

  private createSparkBurst(x: number, y: number, count: number = 8) {
    const group = this.particlesGroup.nativeElement;
    for (let i = 0; i < count; i++) {
      const spark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const radius = 0.5 + Math.random() * 1.2;
      spark.setAttribute('r', String(radius));
      spark.setAttribute('fill', `url(#electricGrad-${this.instanceId})`);
      spark.setAttribute('filter', `url(#sparkFilter-${this.instanceId})`);
      spark.setAttribute('cx', String(x));
      spark.setAttribute('cy', String(y));
      group.appendChild(spark);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 2 + Math.random() * 10;
      const destinationX = x + Math.cos(angle) * velocity;
      const destinationY = y + Math.sin(angle) * velocity;

      animate(spark, {
        cx: destinationX,
        cy: destinationY,
        opacity: [1, 0],
        r: [radius, 0],
        duration: 400 + Math.random() * 400,
        easing: 'easeOutExpo',
        onComplete: () => {
          if (spark.parentNode) group.removeChild(spark);
        }
      });
    }
  }

  private createTrailSpark(x: number, y: number) {
    const group = this.particlesGroup.nativeElement;
    const spark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const radius = 0.4 + Math.random() * 0.8;
    spark.setAttribute('r', String(radius));
    spark.setAttribute('fill', this.color);
    spark.setAttribute('cx', String(x));
    spark.setAttribute('cy', String(y));
    spark.setAttribute('opacity', '0.8');
    group.appendChild(spark);

    const vx = (Math.random() - 0.5) * 4;
    const vy = (Math.random() - 0.5) * 4;

    animate(spark, {
      cx: x + vx,
      cy: y + vy,
      opacity: 0,
      duration: 300,
      easing: 'linear',
      onComplete: () => {
        if (spark.parentNode) group.removeChild(spark);
      }
    });
  }

  ngOnDestroy() {
    this.destroyed = true;
    if (this.animation) {
      this.animation.pause();
    }
  }
}
