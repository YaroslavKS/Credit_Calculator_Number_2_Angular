import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../model/user.model';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-general-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './general-table.component.html',
  styleUrl: './general-table.component.scss'
})
export class GeneralTableComponent implements OnInit {
  issuanceStartDate: string = '';
  issuanceEndDate: string = '';
  returnStartDate: string = '';
  returnEndDate: string = '';
  actualReturnStartDate: Date | null = null;
  actualReturnEndDate: Date | null = null;  
  includeOverdue: boolean = false; // Опціональний фільтр для просрочених кредитів

  users: User[] = [];
  filteredUsers: User[] = [];

  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(private http: HttpClient, private dataService: DataService) { }

  ngOnInit() {
    this.getData()
  }

  getData(){
    this.dataService.getUsers()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((users: User[]) => {
      this.users = users;
      this.filteredUsers = users;
      this.applyFilters();
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  applyFilters() {
    this.filteredUsers = this.users.filter((user: User) => {
      let passIssuanceDateFilter = true;
      let passReturnDateFilter = true;
      let passActualReturnDateFilter = true;
      let passOverdueFilter = true;
      const today = new Date().toISOString().slice(0, 10); // Отримати сьогоднішню дату у форматі рядка YYYY-MM-DD
  
      // Фільтр за періодом видачі кредиту
      if (this.issuanceStartDate && this.issuanceEndDate) {
        passIssuanceDateFilter = user.issuance_date >= this.issuanceStartDate && user.issuance_date <= this.issuanceEndDate;
      }
  
      // Фільтр за періодом повернення кредиту
      if (this.returnStartDate && this.returnEndDate) {
        passReturnDateFilter = user.return_date >= this.returnStartDate && user.return_date <= this.returnEndDate;
      }
  
      // Фільтр за періодом фактичного повернення кредиту
      if (this.actualReturnStartDate && this.actualReturnEndDate && user.actual_return_date) {
        const startDate = new Date(this.actualReturnStartDate);
        const endDate = new Date(this.actualReturnEndDate);
        const userReturnDate = new Date(user.actual_return_date);
        passActualReturnDateFilter = userReturnDate >= startDate && userReturnDate <= endDate;
      }

      // // Опціональний фільтр для просрочених кредитів
      // if (this.includeOverdue) {
      //   if (user.actual_return_date && user.return_date) {
      //     passOverdueFilter = new Date(user.actual_return_date) > new Date(user.return_date);
      //   } else if (user.return_date) {
      //     passOverdueFilter = new Date(user.return_date) < new Date();
      //   }
      // }
  
      return passIssuanceDateFilter && passReturnDateFilter && passActualReturnDateFilter && passOverdueFilter;
    });
  }
  
  
}
