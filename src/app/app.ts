import { Component, signal, inject, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { Subscription } from 'rxjs';
import { SeoRouterService } from './services/seo';
import { BookingModalService } from './services/booking-modal';
import { BookingModal } from './core/booking-modal/booking-modal';
import { AnimationsService } from './services/animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BookingModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('Open Base Africa');
  private router = inject(Router);
  private sub!: Subscription;
  private seoRouterService = inject(SeoRouterService);
  private bookingModalService = inject(BookingModalService);
  private animations = inject(AnimationsService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('pageHost') pageHost?: ElementRef<HTMLElement>;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = (event.target as HTMLElement)?.closest('[data-booking-modal]');
    if (target) {
      event.preventDefault();
      this.bookingModalService.openPopup();
    }
  }

  /** True while a route transition is in progress */
  loading = signal(false);

  ngOnInit(): void {
    this.sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loading.set(true);
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        // Small delay so the bar is visible even on fast navigations
        setTimeout(() => this.loading.set(false), 150);

        if (event instanceof NavigationEnd && this.isBrowser) {
          window.scrollTo({ top: 0, behavior: 'auto' });
          this.playRouteTransition();
        }
      }
    });

    this.seoRouterService.initAutomaticSeo();
  }

  /** Fade the newly-activated page in and recompute scroll triggers. */
  private playRouteTransition(): void {
    void this.animations.load().then((bundle) => {
      // Give the router a tick to insert the new component host.
      setTimeout(() => this.animations.refresh(), 60);
      if (!bundle || this.animations.reducedMotion) return;

      const host = this.pageHost?.nativeElement.firstElementChild as HTMLElement | null;
      if (!host) return;

      const { gsap } = bundle;
      // Opacity-only so `position: fixed` children (the header) are unaffected.
      gsap.fromTo(
        host,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'opacity' }
      );
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
