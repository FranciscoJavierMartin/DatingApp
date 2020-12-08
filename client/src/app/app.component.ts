import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { USER_KEY_LOCALSTORAGE } from './constants/localStorage';
import { User } from './models/user';
import { AccountService } from './services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  users: any;

  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.setCurrentUser();
  }

  setCurrentUser() {
    const userFromLocalStorage = localStorage.getItem(USER_KEY_LOCALSTORAGE);
    if (userFromLocalStorage) {
      const user: User = JSON.parse(userFromLocalStorage);
      this.accountService.setCurrentUser(user);
    }
  }

}
