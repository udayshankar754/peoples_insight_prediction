import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay, Subject, switchMap, takeUntil, timer } from 'rxjs';
import { environment } from '../../../environments/environment.development';
@Injectable({
  providedIn: 'root',
})
export class LiveResultService {
  private stopPolling$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  getLiveResult(state: string, state_code: string) {
    let params = new HttpParams();

    if (state) params = params.set('state', state);
    if (state_code) params = params.set('state_code', state_code);
    return this.http.get(`${environment.baseUrl}result/live-result?${new Date()}`, { params });
  }

  getPartyColorBi() {
    return this.http.get(`${environment.baseUrl}result/party-color-bi`);
  }

  getPartyColor() {
    return this.http.get(`${environment.baseUrl}result/party-color`);
  }

  getVotes(state: any) {
    let params = new HttpParams();

    if (state) params = params.set('state', state);
    return this.http.get(`${environment.baseUrl}result/votes-percentage`, { params });
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

  // startPolling(interval: number): Observable<any> {
  //   return timer(0, interval).pipe(
  //     switchMap(() => {
  //       return this.getLiveResult();
  //     }),
  //   );
  // }

  roundWiseReport(state: string | null, state_code: string | null) {
    let params = new HttpParams();

    if (state) params = params.set('state', state);
    if (state_code) params = params.set('state_code', state_code);
    return this.http.get(`${environment.baseUrl}result/round-wise-report`, { params });
  }

  startPolling(intervalMs: number, state: string, state_code: string): Observable<any> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.getLiveResult(state, state_code)),
      takeUntil(this.stopPolling$),
      shareReplay(1), // Ensures multiple subscribers don't trigger multiple requests
    );
  }

  stopPolling(): void {
    this.stopPolling$.next();
    this.stopPolling$.complete();
  }

  roundwiseBiResult(state_code: any , ac_no : any) {
    return this.http.get(`${environment.baseUrl}result/roundwise-bi-result/${state_code}/${ac_no}`);
  }

  roundwiseTotalVoter(state_code: any) {
    return this.http.get(`${environment.baseUrl}result/roundwise-total-voter/${state_code}`);
  }

  stateWiseTurnout(state_code: any) {
    return this.http.get(`${environment.baseUrl}result/state-wise-turnout/${state_code}`);
  }

  roundwiseLiveResult(state_code: any , ac_no : any) {
    return this.http.get(`${environment.baseUrl}result/round-wise-result/${state_code}/${ac_no}`); 
  }
}
