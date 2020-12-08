import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ILoginForm } from '../interfaces/common';
import { User } from '../models/user';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  model: ILoginForm = {
    username: '',
    password: '',
  };

  constructor(public accountService: AccountService) {}

  ngOnInit(): void {
    
  }

  login() {
    this.accountService.login(this.model).subscribe(
      (response) => {},
      (error) => {}
    );
  }

  logout() {
    this.accountService.logout();
  }
}
