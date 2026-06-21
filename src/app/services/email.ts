import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmailService {
  constructor() {
  console.log('Environment:', environment);
  console.log('EmailJS:', environment.emailjs);
  console.log('Public Key:', environment.emailjs?.publicKey);

  emailjs.init({
    publicKey: environment.emailjs.publicKey,
  });
}
  

  sendEmail(templateParams: Record<string, string>) {
    return emailjs.send(
      environment.emailjs.serviceId,
      environment.emailjs.templateId,
      templateParams,
      {
        publicKey: environment.emailjs.publicKey,
      }
    );
  }
}
