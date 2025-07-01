import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ConfiguratorService {
  constructor(private http: HttpClient) {}

  state_key_list() {
    return this.http.get(`${environment.baseUrl}result/state-key-list`);
  }

  uploadBiResult(body: any) {
    return this.http.post(`${environment.baseUrl}result/upload-bi-result`, body);
  }

  getBiKeys(state: any) {
    return this.http.get(`${environment.baseUrl}result/bi-keys/${state}`);
  }

  updateBiKeys(body: any) {
    return this.http.post(`${environment.baseUrl}result/bi-keys-visiblity-changes`, body);
  }

  state_column_key_list(state: any) {
    return this.http.get(`${environment.baseUrl}result/state-column-key-list/${state}`);
  }

  turnoutAcwise(state_code: any) {
    return this.http.get(`${environment.baseUrl}result/turnout-ac-wise/${state_code}`);
  }

  turnoutBoothWardWise(state_code: any) {
    return this.http.get(`${environment.baseUrl}result/turnout-booth-ward-wise/${state_code}`);
  }

  getAssemblyWiseData(state : any, column: any) {
    return this.http.get(`${environment.baseUrl}result/assembly-ward-booth/${state}/${column}`);
  }

  updateTurnoutAcWise(state_code :string ,body: any) {
    return this.http.put(`${environment.baseUrl}result/update-turnout-ac-wise/${state_code}`, body);
  }

  updateTurnoutBoothWardWise(state_code :string ,body: any) {
    return this.http.put(`${environment.baseUrl}result/update-turnout-booth-ward-wise/${state_code}`, body);
  }
}
