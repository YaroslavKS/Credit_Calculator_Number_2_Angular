import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-general-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './general-table.component.html',
  styleUrl: './general-table.component.scss'
})
export class GeneralTableComponent implements OnInit {
  issuanceDate: string = '';
  returnDate: string = '';
  actualReturnDate: string = '';
  users: any[] = [];
  filteredUsers: any[] = [];

  private onDestroy$: Subject<void> = new Subject<void>();
  issuanceDateFilter: Subject<any> = new Subject<any>();
  returnDateFilter: Subject<any> = new Subject<any>();
  overdueFilter: Subject<any> = new Subject<any>();

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<any[]>('https://raw.githubusercontent.com/LightOfTheSun/front-end-coding-task-db/master/db.json')
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(users => {
        this.users = users;
        this.filteredUsers = users;
        this.applyFilters();
      });

    this.issuanceDateFilter.pipe(takeUntil(this.onDestroy$)).subscribe(() => this.applyFilters());
    this.returnDateFilter.pipe(takeUntil(this.onDestroy$)).subscribe(() => this.applyFilters());
    this.overdueFilter.pipe(takeUntil(this.onDestroy$)).subscribe(() => this.applyFilters());
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      let passIssuanceDateFilter = true;
      let passReturnDateFilter = true;
      let passActualReturnDateFilter = true;
      let passOverdueFilter = true;
  
      if (this.issuanceDate) {
        passIssuanceDateFilter = user.issuance_date === this.issuanceDate;
      }
      if (this.returnDate) {
        passReturnDateFilter = user.return_date === this.returnDate;
      }
      if (this.actualReturnDate) {
        passActualReturnDateFilter = user.actual_return_date === this.actualReturnDate;
      }
      if (user.actual_return_date && user.return_date) {
        passOverdueFilter = new Date(user.actual_return_date) > new Date(user.return_date);
      } else if (user.return_date) {
        passOverdueFilter = new Date(user.return_date) < new Date();
      }
  
      return passIssuanceDateFilter && passReturnDateFilter && passActualReturnDateFilter && passOverdueFilter;
    });
  }
  
  
  
}
