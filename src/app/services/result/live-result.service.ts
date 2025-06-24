import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay, Subject, switchMap, takeUntil, timer } from 'rxjs';
import { environment } from '../../../environments/environment.development';
@Injectable({
  providedIn: 'root',
})
export class LiveResultService {
  private stopPolling$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  getLiveResult() {
    return this.http.get(`${environment.baseUrl}result/live-result?${new Date()}`);
  }

  getPartyColorBi() {
    return this.http.get(`${environment.baseUrl}result/party-color-bi`);
  }

  getPartyColor() {
    return this.http.get(`${environment.baseUrl}result/party-color`);
  }

  getVotes() {
    return this.http.get(`${environment.baseUrl}result/votes-percentage`);
  }

  getStateCode() {
    return this.http.get(`${environment.baseUrl}result/state-code-list`);
  }

  getAcNoList(state: any) {
    return this.http.get(`${environment.baseUrl}result/statewise-accode-list/${state}`);
  }
  // /live-result/:state_code/:ac_no/:round_no

  acwiseResult(state_code: any, ac_no: any) {
    return this.http.get(`${environment.baseUrl}result/live-result/${state_code}/${ac_no}`);
  }

  roundwiseResult(state_code: any, ac_no: any, round_no: any) {
    return this.http.get(
      `${environment.baseUrl}result/live-result/${state_code}/${ac_no}/${round_no}`,
    );
  }

  roundList(state_code: any, ac_no: any) {
    return this.http.get(`${environment.baseUrl}result/live-result-round/${state_code}/${ac_no}`);
  }

  sheetWisePredection(state_code: any) {
    return this.http.get(`${environment.baseUrl}result/sheet-wise-prediction/${state_code}`);
  }

  startPolling(interval: number): Observable<any> {
    return timer(0, interval).pipe(
      switchMap(() => {
        return this.getLiveResult();
      }),
    );
  }

  roundWiseReport() {
    return this.http.get(`${environment.baseUrl}result/round-wise-report`);
  }
}
