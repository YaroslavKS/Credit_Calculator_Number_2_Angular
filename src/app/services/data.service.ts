import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private onDestroy$: Subject<void> = new Subject<void>();
  private usersUrl = 'https://raw.githubusercontent.com/LightOfTheSun/front-end-coding-task-db/master/db.json';

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  fetchData(): Observable<any[]> {
    return this.http.get<any[]>('https://raw.githubusercontent.com/LightOfTheSun/front-end-coding-task-db/master/db.json')
      .pipe(takeUntil(this.onDestroy$));
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.usersUrl)
      .pipe(takeUntil(this.onDestroy$));
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  calculateReturnedCreditsByMonth(credits: any[]): Record<string, number> {
    const returnedCreditsByMonth: Record<string, number> = {};

    credits.forEach(credit => {
      const issuanceDate = new Date(credit.issuance_date);
      const actualReturnDate = credit.actual_return_date ? new Date(credit.actual_return_date) : null;
      const issuanceMonthYearKey = this.datePipe.transform(issuanceDate, 'MM-yyyy') || '';

      if (!returnedCreditsByMonth[issuanceMonthYearKey]) {
        returnedCreditsByMonth[issuanceMonthYearKey] = 0;
      }

      if (actualReturnDate && actualReturnDate >= issuanceDate && 
          actualReturnDate.getMonth() === issuanceDate.getMonth() &&
          actualReturnDate.getFullYear() === issuanceDate.getFullYear()) {
        returnedCreditsByMonth[issuanceMonthYearKey]++;
      }
    });

    return returnedCreditsByMonth;
  }
}
