import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, Input, OnDestroy, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { AnimationsService } from '../services/animations';

export type StaggerDirection = 'up' | 'left' | 'right' | 'zoom';

/**
 * Slides a container's children in one after another when it scrolls into view.
 * Use on card grids and bullet lists for a sequential cascade.
 *
 * Usage:
 *   <div class="grid" appStaggerChildren> …cards… </div>
 *   <ul appStaggerChildren staggerFrom="left"> …bullets… </ul>
 */
@Directive({
  selector: '[appStaggerChildren]',
  standalone: true,
})
export class StaggerChildren implements OnInit, OnDestroy {
  /** CSS selector for the children to cascade (relative to the host). */
  @Input() staggerSelector = ':scope > *';
  /** Seconds between each child starting. */
  @Input() staggerDelay = 0.2;
  /** Direction each child travels from. */
  @Input() staggerFrom: StaggerDirection = 'up';
  /** Travel distance in px (ignored for zoom). */
  @Input() staggerDistance = 44;
  /** Duration of each child's tween in seconds. */
  @Input() staggerDuration = 0.7;

  private el = inject(ElementRef<HTMLElement>);
  private animations = inject(AnimationsService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private cleanup: (() => void) | null = null;
  private destroyed = false;

  ngOnInit(): void {
    if (!this.isBrowser || this.animations.reducedMotion) return;

    void this.animations.load().then((bundle) => {
      if (this.destroyed || !bundle) return;
      const { gsap } = bundle;
      const host = this.el.nativeElement;
      const children = Array.from(host.querySelectorAll(this.staggerSelector));
      if (children.length === 0) return;

      const from = this.fromVars();

      // Hide children up-front so there is no flash before the trigger fires.
      gsap.set(children, { ...from, opacity: 0 });

      const tween = gsap.to(children, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: this.staggerDuration,
        stagger: this.staggerDelay,
        ease: 'power3.out',
        scrollTrigger: { trigger: host, start: 'top 86%', once: true },
        onComplete: () => {
          // Release inline styles so hover transforms still work.
          gsap.set(children, { clearProps: 'transform,opacity' });
        },
      });

      this.cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
  }

  private fromVars(): Record<string, number> {
    const d = this.staggerDistance;
    switch (this.staggerFrom) {
      case 'left':
        return { x: -d };
      case 'right':
        return { x: d };
      case 'zoom':
        return { scale: 0.85 };
      case 'up':
      default:
        return { y: d };
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.cleanup?.();
    this.cleanup = null;
  }
}
