import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowRight, Calendar, Clock } from 'lucide-angular';
import { Header } from '../../core/header/header';
import { Footer } from '../../core/footer/footer';
import { ScrollReveal } from '../../directives/scroll-reveal';
import { InsightsService } from '../../services/insights';
import { INSIGHT_CATEGORIES, InsightCategory } from '../../data/insights';

@Component({
  selector: 'app-insights',
  imports: [Header, Footer, RouterLink, DatePipe, LucideAngularModule, ScrollReveal],
  templateUrl: './insights.html',
  styleUrl: './insights.css',
})
export class Insights {
  protected readonly icons = { ArrowRight, Calendar, Clock };
  protected readonly insights = inject(InsightsService);
  protected readonly categories = INSIGHT_CATEGORIES;

  protected readonly activeCategory = signal<InsightCategory | null>(null);

  protected readonly visiblePosts = computed(() => {
    const cat = this.activeCategory();
    const posts = this.insights.published();
    return cat ? posts.filter((p) => p.category === cat) : posts;
  });

  /** Only show categories that already have at least one live article. */
  protected readonly liveCategories = computed(() => {
    const live = new Set(this.insights.published().map((p) => p.category));
    return this.categories.filter((c) => live.has(c.name));
  });

  protected readonly nextCountdown = computed(() => {
    const next = this.insights.next();
    return next ? this.insights.countdown(next.publishAt) : null;
  });

  selectCategory(cat: InsightCategory | null): void {
    this.activeCategory.set(cat);
  }
}
