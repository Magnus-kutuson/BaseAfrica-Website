import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, Input, OnDestroy, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { AnimationsService } from '../services/animations';

export type StaggerDirection = 'up' | 'left' | 'right' | 'zoom';

/** Nested stagger lists register here so their parent can sequence them. */
const NESTED = new WeakMap<HTMLElement, StaggerChildren>();

/**
 * Slides a container's children in one after another as each scrolls into view.
 * Use on card grids and bullet lists for a sequential cascade.
 *
 * When a stagger list sits inside a staggered card (e.g. bullets in a pricing
 * card), the parent drives it: the card lands first, then its bullets slide in
 * one by one.
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

    const host = this.el.nativeElement;

    // Inside another stagger container: let the parent sequence us after our card.
    if (host.parentElement?.closest('[appStaggerChildren]')) {
      NESTED.set(host, this);
      return;
    }

    void this.animations.load().then((bundle) => {
      if (this.destroyed || !bundle) return;
      const { gsap, ScrollTrigger } = bundle;
      const children = this.items();
      if (children.length === 0) return;

      // Hide everything up-front so there is no flash before a trigger fires.
      gsap.set(children, { ...this.fromVars(), opacity: 0 });
      const nestedByChild = new Map(children.map((c) => [c, this.nestedIn(c)]));
      nestedByChild.forEach((lists) =>
        lists.forEach((n) => gsap.set(n.items(), { ...n.fromVars(), opacity: 0 }))
      );

      const timelines: gsap.core.Timeline[] = [];

      // Each child triggers as it enters the viewport; children entering
      // together cascade one after another.
      const triggers = ScrollTrigger.batch(children, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          const tl = gsap.timeline();
          timelines.push(tl);

          (batch as HTMLElement[]).forEach((child, i) => {
            const at = i * this.staggerDelay;
            tl.to(
              child,
              {
                x: 0,
                y: 0,
                scale: 1,
                rotation: 0,
                opacity: 1,
                duration: this.staggerDuration,
                ease: 'back.out(1.5)',
                clearProps: 'transform,opacity',
              },
              at
            );

            // Bullets start once the card has mostly landed.
            let nestedAt = at + this.staggerDuration * 0.6;
            for (const n of nestedByChild.get(child) ?? []) {
              const items = n.items();
              tl.to(
                items,
                {
                  x: 0,
                  y: 0,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                  duration: n.staggerDuration,
                  stagger: n.staggerDelay,
                  ease: 'back.out(2)',
                  clearProps: 'transform,opacity',
                },
                nestedAt
              );
              nestedAt += items.length * n.staggerDelay;
            }
          });
        },
      });

      this.cleanup = () => {
        triggers.forEach((t) => t.kill());
        timelines.forEach((t) => t.kill());
      };
    });
  }

  private items(): HTMLElement[] {
    return Array.from(this.el.nativeElement.querySelectorAll(this.staggerSelector));
  }

  /** Registered nested stagger lists inside `child`, in document order. */
  private nestedIn(child: HTMLElement): StaggerChildren[] {
    return Array.from(child.querySelectorAll<HTMLElement>('[appStaggerChildren]'))
      .map((el) => NESTED.get(el)).filter((n): n is StaggerChildren => !!n);
  }

  private fromVars(): Record<string, number> {
    const d = this.staggerDistance;
    switch (this.staggerFrom) {
      case 'left':
        return { x: -d, rotation: -2 };
      case 'right':
        return { x: d, rotation: 2 };
      case 'zoom':
        return { scale: 0.8, rotation: -3 };
      case 'up':
      default:
        return { y: d, scale: 0.96 };
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    NESTED.delete(this.el.nativeElement);
    this.cleanup?.();
    this.cleanup = null;
  }
}
