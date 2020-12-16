import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LikePredicate } from '../constants/custom-types';
import { IMember } from '../models/member';
import { PaginatedResult } from '../models/pagination';
import { IUser } from '../models/user';
import { UserParams } from '../models/userParams';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrlUserService = `${environment.apiUrl}users`;
  baseUrlLikeService = `${environment.apiUrl}likes`;
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

  getUserParams(): UserParams {
    return this.userParams;
  }

  setUserParams(params: UserParams): void {
    this.userParams = params;
  }

  resetUserParams(): UserParams {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  getMembers(userParams: UserParams): Observable<PaginatedResult<IMember[]>> {
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
        this.baseUrlUserService,
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
      : this.http.get<IMember>(`${this.baseUrlUserService}/${username}`);
  }

  updateMember(member: IMember): Observable<void> {
    return this.http.put<void>(this.baseUrlUserService, member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrlUserService}/set-main-photo/${photoId}`,
      {}
    );
  }

  deletePhoto(photoId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrlUserService}/delete-photo/${photoId}`
    );
  }

  addLike(username: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrlLikeService}/${username}`, {});
  }

  getLikes(predicate: LikePredicate, pageNumber: number, pageSize: number) {
    let params = this.getPaginationHeaders(pageNumber, pageSize);
    params = params.append('predicate', predicate);
    return this.getPaginatedResult<Partial<IMember[]>>(this.baseUrlLikeService, params);
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

  private getPaginatedResult<T>(
    url: string,
    params: HttpParams
  ): Observable<PaginatedResult<T>> {
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
