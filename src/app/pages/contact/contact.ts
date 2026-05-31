import { Component } from '@angular/core';
import { Header } from '../../core/header/header';
import { Footer } from '../../core/footer/footer';
import { LucideAngularModule, MessageSquare, Mail, MapPin, ShieldCheck } from 'lucide-angular';

@Component({
  selector: 'app-contact',
  imports: [Header, Footer, LucideAngularModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  icons = { MessageSquare, Mail, MapPin, ShieldCheck };
}
