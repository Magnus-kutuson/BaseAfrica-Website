import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, Input, OnDestroy, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { AnimationsService } from '../services/animations';

/**
 * Subtle scroll-linked parallax. The element drifts vertically as it moves
 * through the viewport. Browser-only, reduced-motion aware, self-cleaning.
 *
 * Usage: <img appParallax [parallaxSpeed]="0.15" />
 */
@Directive({
  selector: '[appParallax]',
  standalone: true,
})
export class Parallax implements OnInit, OnDestroy {
  /** Fraction of the viewport the element travels (0.05 subtle → 0.3 strong). */
  @Input() parallaxSpeed = 0.12;

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
      const distance = this.parallaxSpeed * 100;

      const tween = gsap.fromTo(
        this.el.nativeElement,
        { yPercent: -distance / 2 },
        {
          yPercent: distance / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: this.el.nativeElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            once: false,
          },
        }
      );

      this.cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.cleanup?.();
    this.cleanup = null;
  }
}
