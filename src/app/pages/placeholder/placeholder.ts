import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Header } from '../../core/header/header';
import { Footer } from '../../core/footer/footer';
import { LucideAngularModule, Wrench } from 'lucide-angular';

@Component({
  selector: 'app-placeholder',
  imports: [Header, Footer, LucideAngularModule, RouterLink],
  templateUrl: './placeholder.html',
  styleUrl: './placeholder.css',
})
export class Placeholder implements OnInit {
  pageName: string = 'Page';
  icons = { Wrench };

  constructor(private location: Location) {}

  ngOnInit() {
    const path = this.location.path();
    const segments = path.split('/');
    const lastSegment = segments[segments.length - 1];
    
    if (lastSegment) {
      this.pageName = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }
  }
}
