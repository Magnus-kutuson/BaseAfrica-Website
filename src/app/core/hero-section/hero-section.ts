import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimationsService, GsapBundle } from '../../services/animations';

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css',
})
export class HeroSection implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private animations = inject(AnimationsService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private ctx?: { revert: () => void };
  private split?: { revert: () => void };

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    void this.animations.load().then((bundle) => {
      if (!bundle) {
        this.revealFallback();
        return;
      }
      if (this.animations.reducedMotion) {
        this.revealFallback();
        return;
      }
      this.animate(bundle);
    });
  }

  /** No GSAP / reduced motion → let CSS show everything. */
  private revealFallback(): void {
    this.host.nativeElement.querySelector('.hero')?.setAttribute('data-anim', 'off');
  }

  private animate(bundle: GsapBundle): void {
    const { gsap, SplitText, ScrollTrigger } = bundle;
    const root = this.host.nativeElement;

    this.ctx = gsap.context(() => {
      // Split the headline into masked lines/words for a cinematic reveal.
      const title = root.querySelector('.hero-title') as HTMLElement | null;
      let words: Element[] = [];
      if (title) {
        const split = SplitText.create(title, {
          type: 'lines,words',
          linesClass: 'line-mask',
          autoSplit: true,
        });
        this.split = split;
        words = split.words;
      }

      // Hand opacity control to GSAP (CSS no longer forces the hidden state).
      root.querySelector('.hero')?.setAttribute('data-anim', 'done');

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo('.hero-kicker', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0)
        .fromTo(words, { yPercent: 118, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 1 }, 0.15)
        .fromTo('.hero-copy', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75 }, 0.55)
        .fromTo(
          '.hero-actions .anim',
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.12, duration: 0.6 },
          0.75
        )
        .fromTo(
          '.hero-frame',
          { scale: 0.82, opacity: 0, rotate: -3 },
          { scale: 1, opacity: 1, rotate: 0, duration: 1.2, ease: 'power3.out' },
          0.5
        )
        .fromTo(
          '.hero-badge',
          { scale: 0.5, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.7,
            ease: 'back.out(1.7)',
            clearProps: 'transform',
          },
          1.15
        );

      // Scroll-linked parallax + gentle content drift as the hero leaves view.
      gsap.to('.hero-bg', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero-inner', {
        yPercent: -8,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      ScrollTrigger.refresh();
    }, root);
  }

  ngOnDestroy(): void {
    this.split?.revert();
    this.ctx?.revert();
  }
}
