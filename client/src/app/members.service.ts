import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IMember } from './models/member';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrlService = `${environment.apiUrl}users`;

  constructor(private http: HttpClient) {}

  getMembers(): Observable<IMember[]> {
    return this.http.get<IMember[]>(this.baseUrlService);
  }

  getMember(username: string): Observable<IMember> {
    return this.http.get<IMember>(`${this.baseUrlService}/${username}`);
  }
}
