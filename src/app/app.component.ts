import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DataService } from './services/data.service';
import { DatePipe } from '@angular/common';
import { OrderPipe } from 'ngx-order-pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, HttpClientModule ,FormsModule, DatePipe],
  providers: [OrderPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Credit_Calculator_Number_2_Angular';
  constructor(private dataService: DataService) { }
}
