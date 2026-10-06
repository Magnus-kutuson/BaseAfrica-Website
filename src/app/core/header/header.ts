import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AnimationsService } from '../../services/animations';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, AfterViewInit, OnDestroy {
  navLinks = [
    { label: 'Home', url: '/home' },
    { label: 'Services', url: '/services' },
    { label: 'Projects', url: '/projects' },
    { label: 'About', url: '/about' },
    { label: 'Contact', url: '/contact' },
  ];
  isMobileMenuOpen = false;
  isScrolled = false;

  @ViewChild('mobileMenu') mobileMenu?: ElementRef<HTMLElement>;

  private animations = inject(AnimationsService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private gsap: any = null;
  private menuTween: any = null;
  private scrollHandler?: () => void;

  ngOnInit(): void {
    if (this.isBrowser) {
      this.scrollHandler = () => {
        this.isScrolled = window.scrollY > 10;
      };
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      this.scrollHandler();
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    void this.animations.load().then((bundle) => {
      if (!bundle || this.animations.reducedMotion) return;
      const { gsap } = bundle;
      this.gsap = gsap;

      // Ensure the mobile menu starts hidden (entrance is CSS-driven).
      const menu = this.mobileMenu?.nativeElement;
      if (menu) gsap.set(menu, { autoAlpha: 0, yPercent: -2 });
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu(): void {
    this.isMobileMenuOpen = true;
    this.runMenu(true);
  }

  closeMenu(): void {
    if (!this.isMobileMenuOpen) return;
    this.isMobileMenuOpen = false;
    this.runMenu(false);
  }

  private runMenu(open: boolean): void {
    const menu = this.mobileMenu?.nativeElement;
    if (!menu) return;

    // CSS-class fallback when GSAP isn't ready.
    if (!this.gsap) {
      menu.classList.toggle('mobile-open', open);
      return;
    }

    this.menuTween?.kill();
    const links = menu.querySelectorAll('.mobile-link');

    if (open) {
      this.gsap.set(menu, { autoAlpha: 1 });
      this.menuTween = this.gsap.timeline();
      this.menuTween
        .fromTo(menu, { yPercent: -2 }, { yPercent: 0, duration: 0.35, ease: 'power3.out' })
        .fromTo(
          links,
          { y: -16, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.4, ease: 'power3.out' },
          0.05
        );
    } else {
      this.menuTween = this.gsap.timeline();
      this.menuTween
        .to(links, { y: -10, opacity: 0, stagger: 0.03, duration: 0.18 })
        .to(menu, { autoAlpha: 0, yPercent: -2, duration: 0.3, ease: 'power3.in' }, 0.05);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
    this.menuTween?.kill();
  }
}
