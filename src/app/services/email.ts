import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmailService {
  constructor() {
  emailjs.init({
    publicKey: environment.publicKey,
  });
}

sendEmail(templateParams: Record<string, string>) {
  return emailjs.send(
    environment.serviceId,
    environment.templateId,
    templateParams
  );
}
}
