import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(private http: HttpClient) {}

  getMapData(folderName: string, fileName: string) {
    return this.http.get(`${environment.baseUrl_2}results/maps/${folderName}/${fileName}`);
  }
}
