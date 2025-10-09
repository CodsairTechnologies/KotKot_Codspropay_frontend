import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {


  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  // Set headers
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');

    console.log('token', token);

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // POST request function
  postData(endpoint: string, payload: any): Observable<any> {
    return this.http.post(endpoint, payload, { headers: this.getHeaders() });
  }
}
