import { Component, computed, effect, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { LucideAngularModule, ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-angular';
import { Header } from '../../core/header/header';
import { Footer } from '../../core/footer/footer';
import { InsightsService } from '../../services/insights';
import { SeoRouterService } from '../../services/seo';
import { findInsight } from '../../data/insights';

const SITE_URL = 'https://openbaseafrica.com';

@Component({
  selector: 'app-insight-post',
  imports: [Header, Footer, RouterLink, DatePipe, LucideAngularModule],
  templateUrl: './insight-post.html',
  styleUrl: './insight-post.css',
})
export class InsightPost {
  protected readonly icons = { ArrowLeft, ArrowRight, Calendar, Clock };
  protected readonly insights = inject(InsightsService);
  private seo = inject(SeoRouterService);

  private slug = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('slug') ?? '')), {
    initialValue: '',
  });

  protected readonly post = computed(() => findInsight(this.slug()));
  protected readonly isLive = computed(() => {
    const post = this.post();
    return !!post && this.insights.isLive(post);
  });

  protected readonly countdown = computed(() => {
    const post = this.post();
    return post ? this.insights.countdown(post.publishAt) : null;
  });

  /** Up to three live articles, same category first. */
  protected readonly related = computed(() => {
    const post = this.post();
    if (!post) return [];
    const others = this.insights.published().filter((p) => p.slug !== post.slug);
    return [
      ...others.filter((p) => p.category === post.category),
      ...others.filter((p) => p.category !== post.category),
    ].slice(0, 3);
  });

  constructor() {
    effect(() => this.updateSeo());
  }

  private updateSeo(): void {
    const post = this.post();

    if (!post) {
      this.seo.apply({
        title: 'Article Not Found | Open Base Africa Insights',
        description: 'The article you are looking for does not exist.',
        robots: 'noindex, nofollow',
      });
      return;
    }

    const url = `${SITE_URL}/insights/${post.slug}`;

    if (!this.isLive()) {
      this.seo.apply({
        title: `${post.metaTitle} | Coming Soon`,
        description: post.metaDescription,
        robots: 'noindex, follow',
      });
      return;
    }

    this.seo.apply({
      title: `${post.metaTitle} | Open Base Africa`,
      description: post.metaDescription,
      keywords: [post.primaryKeyword, ...post.keywords].join(', '),
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            headline: post.title,
            description: post.metaDescription,
            datePublished: post.publishAt,
            articleSection: post.category,
            keywords: [post.primaryKeyword, ...post.keywords].join(', '),
            mainEntityOfPage: url,
            ...(post.author && { author: { '@type': 'Organization', name: post.author } }),
            publisher: {
              '@type': 'Organization',
              name: 'Open Base Africa',
              logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/main-logo.png` },
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${SITE_URL}/insights` },
              { '@type': 'ListItem', position: 3, name: post.title, item: url },
            ],
          },
        ],
      },
    });
  }
}
