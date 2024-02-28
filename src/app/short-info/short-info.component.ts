import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface MonthlyCredit {
  [key: string]: any;
  month: number;
  totalIssuedCredits: number;
  averageIssuedCredits: number;
  totalIssuedInterest: number;
  totalReturnedCredits: number;
}

@Component({
  selector: 'app-short-info',
  templateUrl: './short-info.component.html',
  styleUrls: ['./short-info.component.scss']
})
export class ShortInfoComponent implements OnInit {
  credits: any[] = [];
  monthlyCredits: MonthlyCredit[] = [];
  totalIssuedCredits: number = 0;
  totalIssuedInterest: number = 0;
  totalReturnedCredits: number = 0;
  returnedCreditsByMonth: { [key: string]: number } = {};
  sortBy: string = 'month';
  sortDirection: number = 1;
  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.http.get<any[]>('https://raw.githubusercontent.com/LightOfTheSun/front-end-coding-task-db/master/db.json')
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(credits => {
        this.credits = credits;
        this.calculateMetrics();
        this.calculateReturnedCreditsByMonth();
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  calculateMetrics(): void {
    const monthsData: { [key: number]: MonthlyCredit } = {};

    this.credits.forEach(credit => {
      const month = new Date(credit.issuance_date).getMonth();
      if (!monthsData[month]) {
        monthsData[month] = {
          month: month,
          totalIssuedCredits: 0,
          averageIssuedCredits: 0,
          totalIssuedInterest: 0,
          totalReturnedCredits: 0
        };
      }
      monthsData[month].totalIssuedCredits += credit.body;
      monthsData[month].totalIssuedInterest += credit.percent;
      if (credit.actual_return_date) {
        monthsData[month].totalReturnedCredits++;
      }
      this.totalIssuedCredits += credit.body;
      this.totalIssuedInterest += credit.percent;
      if (credit.actual_return_date) {
        this.totalReturnedCredits++;
      }
    });

    for (const key in monthsData) {
      if (monthsData.hasOwnProperty(key)) {
        const monthData = monthsData[key];
        monthData.averageIssuedCredits = monthData.totalIssuedCredits / Object.keys(monthsData).length;
        this.monthlyCredits.push(monthData);
      }
    }
  }

  calculateReturnedCreditsByMonth(): void {
    this.returnedCreditsByMonth = {};

    this.credits.forEach(credit => {
      const issuanceDate = new Date(credit.issuance_date);
      const actualReturnDate = new Date(credit.actual_return_date);

      const issuanceMonth = issuanceDate.getMonth() + 1;
      const issuanceYear = issuanceDate.getFullYear();
      const key = `${issuanceMonth}-${issuanceYear}`;

      if (!this.returnedCreditsByMonth[key]) {
        this.returnedCreditsByMonth[key] = 0;
      }

      if (actualReturnDate && actualReturnDate >= issuanceDate &&
        actualReturnDate.getMonth() === issuanceDate.getMonth() &&
        actualReturnDate.getFullYear() === issuanceDate.getFullYear()) {
        this.returnedCreditsByMonth[key]++;
      }
    });
  }

  sortData(property: string): void {
    if (this.sortBy === property) {
      this.sortDirection = -this.sortDirection; // зміна напрямку сортування при повторному кліку
    } else {
      this.sortBy = property;
      this.sortDirection = 1;
    }
    this.monthlyCredits.sort((a, b) => {
      if (a[property] < b[property]) {
        return -1 * this.sortDirection;
      } else if (a[property] > b[property]) {
        return 1 * this.sortDirection;
      } else {
        return 0;
      }
    });
  }
}
