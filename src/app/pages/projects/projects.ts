import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from "../../core/header/header";
import { Footer } from "../../core/footer/footer";

@Component({
  selector: 'app-projects',
  imports: [Header, Footer, RouterLink],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects {

}
