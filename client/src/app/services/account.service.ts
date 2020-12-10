import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ILoginForm, IRegisterForm } from '../interfaces/common';
import { USER_KEY_LOCALSTORAGE } from '../constants/localStorage';
import { IUser } from '../models/user';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrlService = `${environment.apiUrl}account/`;
  private currentUserSource = new ReplaySubject<IUser | null>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) {}

  login(model: ILoginForm): Observable<IUser> {
    return this.http.post<IUser>(`${this.baseUrlService}login`, model).pipe(
      map((response: IUser) => {
        const user = response;
        if (user) {
          localStorage.setItem(USER_KEY_LOCALSTORAGE, JSON.stringify(user));
          this.currentUserSource.next(user);
        }
        return user;
      })
    );
  }

  register(model: IRegisterForm): Observable<IUser> {
    return this.http.post<IUser>(`${this.baseUrlService}register`, model).pipe(
      map((user: IUser) => {
        if (user) {
          localStorage.setItem(USER_KEY_LOCALSTORAGE, JSON.stringify(user));
          this.currentUserSource.next(user);
        }
        return user;
      })
    );
  }

  setCurrentUser(user: IUser) {
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem(USER_KEY_LOCALSTORAGE);
    this.currentUserSource.next(null);
  }
}
