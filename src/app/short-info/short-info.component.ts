import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../services/data.service';
import { takeUntil } from 'rxjs/operators';
import { User } from '../model/user.model';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';

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
  standalone: true,
  imports: [CommonModule],
  templateUrl: './short-info.component.html',
  styleUrls: ['./short-info.component.scss'],
})
export class ShortInfoComponent implements OnInit, OnDestroy {
  monthlyCredits: MonthlyCredit[] = [];
  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.dataService.getUsers()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (users: User[]) => {
          this.monthlyCredits = this.calculateMetrics(users);
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }

  sortData(property: string): void {
    if (property === 'month') {
      this.monthlyCredits.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    } else {
      this.monthlyCredits.sort((a, b) => Number(a[property]) - Number(b[property]));
    }
  }

  calculateMetrics(users: User[]): MonthlyCredit[] {
    const monthsData: Record<string, MonthlyCredit> = {};

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

    Object.values(monthsData).forEach(month => {
      month.averageIssuedCredits = month.totalIssuedAmount / month.totalIssuedCredits;
    });

    return Object.values(monthsData) as MonthlyCredit[];
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
