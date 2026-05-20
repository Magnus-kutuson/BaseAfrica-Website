import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
    { path: 'services', loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.Placeholder) },
    { path: 'projects', loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.Placeholder) },
    { path: 'about', loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.Placeholder) },
    { path: 'contact', loadComponent: () => import('./pages/placeholder/placeholder').then(m => m.Placeholder) },
    { path: '**', redirectTo: '/home' }
];
