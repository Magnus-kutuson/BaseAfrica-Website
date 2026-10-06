import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import type { gsap as GsapType } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';
import type { SplitText as SplitTextType } from 'gsap/SplitText';

export interface GsapBundle {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
  SplitText: typeof SplitTextType;
}

/**
 * Central, SSR-safe gateway to GSAP.
 *
 * GSAP and its plugins are lazy-loaded only in the browser so the server bundle
 * never touches `window`/`document`. Every consumer awaits `load()`; because the
 * CSS keeps revealed elements hidden until GSAP animates them, the async load
 * causes no flash of content.
 */
@Injectable({ providedIn: 'root' })
export class AnimationsService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private loadPromise: Promise<GsapBundle | null> | null = null;

  /** True when running in the browser (GSAP is available). */
  get browser(): boolean {
    return this.isBrowser;
  }

  /** True when the user asked the OS to reduce motion. */
  get reducedMotion(): boolean {
    return (
      this.isBrowser &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  /**
   * Lazily imports and registers GSAP + plugins. Resolves to `null` on the
   * server so callers can no-op safely. The promise is memoised.
   */
  load(): Promise<GsapBundle | null> {
    if (!this.isBrowser) {
      return Promise.resolve(null);
    }
    if (!this.loadPromise) {
      this.loadPromise = Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/SplitText'),
      ]).then(([gsapMod, stMod, splitMod]) => {
        const gsap = gsapMod.gsap;
        gsap.registerPlugin(stMod.ScrollTrigger, splitMod.SplitText);

        // Cinematic but tasteful default easing.
        gsap.defaults({ ease: 'power3.out', duration: 0.9 });
        stMod.ScrollTrigger.defaults({ once: true });

        return {
          gsap,
          ScrollTrigger: stMod.ScrollTrigger,
          SplitText: splitMod.SplitText,
        } as GsapBundle;
      });
    }
    return this.loadPromise;
  }

  /** Recompute trigger positions (call after images load or layout shifts). */
  async refresh(): Promise<void> {
    const bundle = await this.load();
    bundle?.ScrollTrigger.refresh();
  }
}
