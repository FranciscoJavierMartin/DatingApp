import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { IMember } from '../models/member';
import { PaginatedResult } from '../models/pagination';
import { IUser } from '../models/user';
import { UserParams } from '../models/userParams';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrlService = `${environment.apiUrl}users`;
  members: IMember[] = [];
  memberCache = new Map();
  user: IUser;
  userParams: UserParams;

  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe((user) => {
      if (user) {
        this.user = user;
        this.userParams = new UserParams(user);
      }
    });
  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  resetUserParams() {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  getMembers(userParams: UserParams) {
    let res;
    let response = this.memberCache.get(Object.values(userParams).join('-'));
    if (response) {
      res = of(response);
    } else {
      let params = this.getPaginationHeaders(
        userParams.pageNumber,
        userParams.pageSize
      );

      params = params.append('minAge', userParams.minAge.toString());
      params = params.append('maxAge', userParams.maxAge.toString());
      params = params.append('gender', userParams.gender);
      params = params.append('orderBy', userParams.orderBy);

      res = this.getPaginatedResult<IMember[]>(
        this.baseUrlService,
        params
      ).pipe(
        map((response) => {
          this.memberCache.set(Object.values(userParams).join('-'), response);
          return response;
        })
      );
    }

    return res;
  }

  getMember(username: string): Observable<IMember> {
    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((member: IMember) => member.username === username);

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

  setMainPhoto(photoId: number): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrlService}/set-main-photo/${photoId}`,
      {}
    );
  }

  deletePhoto(photoId: number) {
    return this.http.delete<void>(
      `${this.baseUrlService}/delete-photo/${photoId}`
    );
  }

  private getPaginationHeaders(
    pageNumber: number,
    pageSize: number
  ): HttpParams {
    let params = new HttpParams();

    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());

    return params;
  }

  private getPaginatedResult<T>(url: string, params: HttpParams) {
    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();
    return this.http
      .get<T>(url, {
        observe: 'response',
        params,
      })
      .pipe(
        map((response) => {
          paginatedResult.result = response.body!;
          if (response.headers.get('Pagination') !== null) {
            paginatedResult.pagination = JSON.parse(
              response.headers.get('Pagination') || '{}'
            );
          }
          return paginatedResult;
        })
      );
  }
}
