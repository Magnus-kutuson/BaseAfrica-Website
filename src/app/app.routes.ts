import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
    { path: 'home', redirectTo: '', pathMatch: 'full' },
    { path: 'services', loadComponent: () => import('./pages/services/services').then(m => m.Services) },
    { path: 'projects', loadComponent: () => import('./pages/projects/projects').then(m => m.Projects) },
    { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.About) },
    { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact) },
    { path: 'terms', loadComponent: () => import('./pages/terms/terms').then(m => m.Terms) },
    { path: 'privacy', loadComponent: () => import('./pages/privacy/privacy').then(m => m.Privacy) },
    { path: '**', redirectTo: '' }
];
