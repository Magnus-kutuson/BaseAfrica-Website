import { RenderMode, ServerRoute } from '@angular/ssr';
import { INSIGHTS } from './data/insights';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'insights/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => INSIGHTS.map((p) => ({ slug: p.slug })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
