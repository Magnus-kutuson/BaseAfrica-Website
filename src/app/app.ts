import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/header/header';
import { HeroSection } from './core/hero-section/hero-section';
import { WhyChooseUs } from './core/why-choose-us/why-choose-us';
import { Feedback } from './core/feedback/feedback';
import { Operations } from './core/operations/operations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, HeroSection, Operations, WhyChooseUs, Feedback],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BaseAfrica');
}
