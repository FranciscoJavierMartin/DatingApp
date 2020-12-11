import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { IMember } from '../models/member';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrlService = `${environment.apiUrl}users`;
  members: IMember[] = [];

  constructor(private http: HttpClient) {}

  getMembers(): Observable<IMember[]> {
    return this.members.length > 0
      ? of(this.members)
      : this.http.get<IMember[]>(this.baseUrlService).pipe(
          map((members) => {
            this.members = members;
            return members;
          })
        );
  }

  getMember(username: string): Observable<IMember> {
    const member = this.members.find((x) => x.username === username);
    return member
      ? of(member)
      : this.http.get<IMember>(`${this.baseUrlService}/${username}`);
  }

  updateMember(member: IMember): Observable<void> {
    return this.http.put<void>(this.baseUrlService, member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }
}
