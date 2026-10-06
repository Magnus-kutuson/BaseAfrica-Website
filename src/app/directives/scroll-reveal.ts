import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { AnimationsService } from '../services/animations';

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'fade';

/**
 * Scroll-triggered reveal. Uses GSAP + ScrollTrigger in the browser for smooth,
 * directional motion, and falls back to the CSS `.reveal-on-scroll` transition
 * (or an instant show) when GSAP is unavailable or motion is reduced.
 *
 * Because the stylesheet keeps `.reveal-on-scroll` hidden until revealed, the
 * async GSAP load never flashes content.
 *
 * Usage:
 *   <div class="reveal-on-scroll">…</div>
 *   <div reveal-on-scroll revealFrom="left" [revealIndex]="2">…</div>
 */
@Directive({
  selector: '.reveal-on-scroll, [reveal-on-scroll], [appScrollReveal]',
  standalone: true,
})
export class ScrollReveal implements OnInit, OnDestroy {
  /** Stagger slot; adds a small incremental delay (capped). */
  @Input() revealIndex = 0;
  /** Direction the element travels from. */
  @Input() revealFrom: RevealDirection = 'up';
  /** Travel distance in px (ignored for zoom/fade). */
  @Input() revealDistance = 48;
  /** Duration in seconds. */
  @Input() revealDuration = 0.9;
  /** Extra delay in seconds (on top of the index stagger). */
  @Input() revealDelay = 0;

  private el = inject(ElementRef<HTMLElement>);
  private animations = inject(AnimationsService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private cleanup: (() => void) | null = null;
  private destroyed = false;

  ngOnInit(): void {
    const host = this.el.nativeElement;

    // Server-side rendering: leave the CSS hidden state in place for crawlers.
    if (!this.isBrowser) {
      return;
    }

    // Reduced motion: show immediately, skip all animation.
    if (this.animations.reducedMotion) {
      host.classList.add('is-visible');
      return;
    }

    const staggerDelay = this.revealIndex > 0 ? Math.min(this.revealIndex * 0.09, 0.6) : 0;
    const delay = this.revealDelay + staggerDelay;

    void this.animations.load().then((bundle) => {
      if (this.destroyed) return;

      // Fallback if GSAP somehow didn't load: use the CSS transition.
      if (!bundle) {
        host.style.transitionDelay = `${delay}s`;
        host.classList.add('is-visible');
        return;
      }

      const { gsap, ScrollTrigger } = bundle;
      const from = this.fromVars(gsap);

      const tween = gsap.fromTo(
        host,
        { ...from, opacity: 0 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: this.revealDuration,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: host,
            start: 'top 88%',
            once: true,
          },
          onComplete: () => {
            // Hand control back to CSS so hover transforms (card lift, etc.)
            // are not blocked by leftover inline styles.
            host.classList.remove('reveal-on-scroll', 'is-visible');
            gsap.set(host, { clearProps: 'transform,opacity,transitionDelay' });
          },
        }
      );

      this.cleanup = () => {
        const st = tween.scrollTrigger;
        st?.kill();
        tween.kill();
      };
    });
  }

  /** Starting offset vars for the chosen direction. */
  private fromVars(gsap: any): Record<string, number> {
    const d = this.revealDistance;
    switch (this.revealFrom) {
      case 'down':
        return { y: -d };
      case 'left':
        return { x: -d };
      case 'right':
        return { x: d };
      case 'zoom':
        return { scale: 0.86, y: 12 };
      case 'fade':
        return {};
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
