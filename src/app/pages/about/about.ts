import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from "../../core/header/header";
import { Footer } from "../../core/footer/footer";

@Component({
  selector: 'app-about',
  imports: [Header, Footer, RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {

}
