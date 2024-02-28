import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../services/data.service';
import { takeUntil } from 'rxjs/operators';
import { User } from '../model/user.model';
import { Subject } from 'rxjs';

interface MonthlyCredit {
  month: string;
  totalIssuedCredits: number;
  averageIssuedCredits: number;
  totalIssuedAmount: number;
  totalInterestAccrued: number;
  totalReturnedCredits: number;
  [key: string]: string | number;
}

@Component({
  selector: 'app-short-info',
  templateUrl: './short-info.component.html',
  styleUrls: ['./short-info.component.scss']
})
export class ShortInfoComponent implements OnInit, OnDestroy {
  monthlyCredits: MonthlyCredit[] = [];
  private onDestroy$: Subject<void> = new Subject<void>();
  users: User[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.dataService.getUsers()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((users: User[]) => {
        // Отримання даних користувачів
        this.users = users;
  
        // Розрахунок метрик за користувачів
        this.monthlyCredits = this.calculateMetrics(users); // Передаємо users у метод calculateMetrics
      });
  }
  

  sortData(property: string): void {
    if (property === 'month') {
      this.monthlyCredits.sort((a, b) => {
        const monthA = new Date(a.month).getTime();
        const monthB = new Date(b.month).getTime();
        return monthA - monthB;
      });
     } else {
       this.monthlyCredits.sort((a, b) => {
         return Number(a[property]) - Number(b[property]);
     });
    }
  }

  calculateMetrics(users: User[]): MonthlyCredit[] {
    const monthsData: { [key: string]: MonthlyCredit } = {};
  
    users.forEach(user => {
      const issuanceDate = new Date(user.issuance_date);
      const monthKey = `${issuanceDate.getMonth() + 1}-${issuanceDate.getFullYear()}`;
      const month = `${issuanceDate.toLocaleString('default', { month: 'long' })} ${issuanceDate.getFullYear()}`;
      if (!monthsData[monthKey]) {
        monthsData[monthKey] = {
          month: month,
          totalIssuedCredits: 0,
          averageIssuedCredits: 0,
          totalIssuedAmount: 0,
          totalInterestAccrued: 0,
          totalReturnedCredits: 0
        };
      }
      monthsData[monthKey].totalIssuedCredits++;
      monthsData[monthKey].totalIssuedAmount += user.body;
      monthsData[monthKey].totalInterestAccrued += user.percent;
      if (user.actual_return_date) {
        monthsData[monthKey].totalReturnedCredits++;
      }
    });
  
    for (const key in monthsData) {
      if (monthsData.hasOwnProperty(key)) {
        const month = monthsData[key];
        month.averageIssuedCredits = month.totalIssuedAmount / month.totalIssuedCredits;
      }
    }
  
    return Object.values(monthsData);
  }
  

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
