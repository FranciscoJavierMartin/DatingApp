import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { baseUrl } from '../constants/urls';
import { ILoginForm, IRegisterForm } from '../interfaces/common';
import { USER_KEY_LOCALSTORAGE } from '../constants/localStorage';
import { User } from '../models/user';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrlService = `${baseUrl}account/`;
  private currentUserSource = new ReplaySubject<User | null>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) {}

  login(model: ILoginForm): Observable<User> {
    return this.http.post<User>(`${this.baseUrlService}login`, model).pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          localStorage.setItem(USER_KEY_LOCALSTORAGE, JSON.stringify(user));
          this.currentUserSource.next(user);
        }
        return user;
      })
    );
  }

  register(model: IRegisterForm): Observable<User> {
    return this.http.post<User>(`${this.baseUrlService}register`, model).pipe(
      map((user: User) => {
        if (user) {
          localStorage.setItem(USER_KEY_LOCALSTORAGE, JSON.stringify(user));
          this.currentUserSource.next(user);
        }
        return user;
      })
    );
  }

  setCurrentUser(user: User) {
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem(USER_KEY_LOCALSTORAGE);
    this.currentUserSource.next(null);
  }
}
