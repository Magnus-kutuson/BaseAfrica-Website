import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Facebook, Twitter, Linkedin, Instagram } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, url: '#' },
    { name: 'Twitter', icon: Twitter, url: '#' },
    { name: 'Facebook', icon: Facebook, url: '#' },
    { name: 'Instagram', icon: Instagram, url: '#' }
  ];
}
