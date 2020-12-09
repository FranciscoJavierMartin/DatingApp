import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { baseUrl } from 'src/app/constants/urls';

@Component({
  selector: 'app-test-errors',
  templateUrl: './test-errors.component.html',
  styleUrls: ['./test-errors.component.scss'],
})
export class TestErrorsComponent implements OnInit {
  baseUrlBuggy: string = `${baseUrl}buggy/`;
  validationErrors: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  get404Error() {
    this.http.get(`${this.baseUrlBuggy}not-found`).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  get400Error() {
    this.http.get(`${this.baseUrlBuggy}bad-request`).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  get500Error() {
    this.http.get(`${this.baseUrlBuggy}server-error`).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  get401Error() {
    this.http.get(`${this.baseUrlBuggy}auth`).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  get400ValidationError() {
    this.http
      .post(`${baseUrl}account/register`, {
        username: '',
        password: '',
      })
      .subscribe(
        (response) => {
          console.log(response);
        },
        (error) => {
          this.validationErrors = error;
        }
      );
  }
}
