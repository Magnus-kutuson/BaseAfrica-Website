import {
  ApplicationRef,
  Injectable,
  PLATFORM_ID,
  TransferState,
  computed,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { INSIGHTS, Insight } from '../data/insights';

const RENDER_TIME_KEY = makeStateKey<number>('insights-render-time');

/**
 * Publishing clock for the Insights blog.
 *
 * Articles are released by date: anything whose `publishAt` has passed is live,
 * everything else stays hidden until its slot. In the browser the clock ticks
 * every second, so an open page picks up a new article (and the countdown runs)
 * without a reload or a redeploy.
 *
 * The server/prerender time is passed to the browser through TransferState so the
 * first client render matches the server HTML during hydration; the clock then
 * jumps to the real time once the app is stable.
 */
@Injectable({ providedIn: 'root' })
export class InsightsService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private transferState = inject(TransferState);

  readonly now = signal(this.initialTime());

  /** Live articles, newest first. */
  readonly published = computed(() =>
    INSIGHTS.filter((p) => this.isLive(p, this.now())).sort(
      (a, b) => Date.parse(b.publishAt) - Date.parse(a.publishAt),
    ),
  );

  /** Scheduled articles, soonest first. */
  readonly upcoming = computed(() =>
    INSIGHTS.filter((p) => !this.isLive(p, this.now())).sort(
      (a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt),
    ),
  );

  readonly next = computed<Insight | undefined>(() => this.upcoming()[0]);

  constructor() {
    if (!this.isBrowser) return;

    void inject(ApplicationRef)
      .whenStable()
      .then(() => {
        this.now.set(Date.now());
        setInterval(() => this.now.set(Date.now()), 1000);
      });
  }

  isLive(post: Insight, now = this.now()): boolean {
    return Date.parse(post.publishAt) <= now;
  }

  /** Remaining time until `iso`, split for display. */
  countdown(iso: string) {
    const ms = Math.max(0, Date.parse(iso) - this.now());
    const s = Math.floor(ms / 1000);
    return {
      done: ms === 0,
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    };
  }

  private initialTime(): number {
    if (this.isBrowser) {
      return this.transferState.get(RENDER_TIME_KEY, Date.now());
    }
    const now = Date.now();
    this.transferState.set(RENDER_TIME_KEY, now);
    return now;
  }
}
