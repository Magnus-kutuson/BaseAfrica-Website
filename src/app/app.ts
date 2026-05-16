import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/header/header';
import { HeroSection } from './core/hero-section/hero-section';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, HeroSection],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BaseAfrica');
}
