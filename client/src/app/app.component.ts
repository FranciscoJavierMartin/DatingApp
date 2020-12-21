import { Component, OnInit } from '@angular/core';
import { USER_KEY_LOCALSTORAGE } from './constants/localStorage';
import { IUser } from './models/user';
import { AccountService } from './services/account.service';
import { PresenceService } from './services/presence.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(
    private accountService: AccountService,
    private presence: PresenceService
  ) {}

  ngOnInit(): void {
    this.setCurrentUser();
  }

  setCurrentUser() {
    const userFromLocalStorage = localStorage.getItem(USER_KEY_LOCALSTORAGE);
    if (userFromLocalStorage) {
      const user: IUser = JSON.parse(userFromLocalStorage);
      this.accountService.setCurrentUser(user);
      this.presence.createhubConnection(user);
    }
  }

}
