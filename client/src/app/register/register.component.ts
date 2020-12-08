import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IRegisterForm } from '../interfaces/common';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  @Output() cancelRegister = new EventEmitter();
  model: IRegisterForm = {
    username: '',
    password: '',
  };

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {}

  register() {
    this.accountService.register(this.model).subscribe(response => {
      console.log(response)
      this.cancel();
    }, error => {
      
    })
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}