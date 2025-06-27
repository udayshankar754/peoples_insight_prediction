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
}
