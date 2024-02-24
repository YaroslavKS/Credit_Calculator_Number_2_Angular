import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-short-info',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './short-info.component.html',
  styleUrl: './short-info.component.scss'
})

export class ShortInfoComponent implements OnInit {
  credits: any[] = [];
  monthlyCredits: any[] = [];
  totalIssuedCredits: number = 0;
  totalIssuedInterest: number = 0;
  totalReturnedCredits: number = 0;
  returnedCreditsByMonth: { [key: string]: number } = {};
  sortBy: string = 'month';
  sortDirection: number = 1;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<any[]>('https://raw.githubusercontent.com/LightOfTheSun/front-end-coding-task-db/master/db.json')
      .subscribe(credits => {
        this.monthlyCredits = [];
        this.credits = credits;
        this.calculateMetrics();
        this.calculateReturnedCreditsByMonth();
      });
  }
  
  calculateMetrics(): void {
    const monthsData: any = {};

    this.credits.forEach(credit => {
      const month = new Date(credit.issuance_date).getMonth();
      
      if (!monthsData[month]) {
        monthsData[month] = {
          issuedCredits: 0,
          issuedInterest: 0,
          returnedCredits: 0
        };
      }
      monthsData[month].issuedCredits += credit.body;
      monthsData[month].issuedInterest += credit.percent;
      if (credit.actual_return_date) {
        monthsData[month].returnedCredits++;
      }

      this.totalIssuedCredits += credit.body;
      this.totalIssuedInterest += credit.percent;

      if (credit.actual_return_date) {
        this.totalReturnedCredits++;
      }
    });

    for (let month in monthsData) {
      this.monthlyCredits.push({
        month: +month,
        averageIssuedCredits: monthsData[month].issuedCredits / Object.keys(monthsData).length,
        totalIssuedCredits: monthsData[month].issuedCredits,
        totalIssuedInterest: monthsData[month].issuedInterest,
        totalReturnedCredits: monthsData[month].returnedCredits
      });
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

