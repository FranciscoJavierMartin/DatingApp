import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IUser } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  baseUrlAdminService = `${environment.apiUrl}admin/`;

  constructor(private http: HttpClient) {}

  getUsersWithRoles(): Observable<Partial<IUser[]>> {
    return this.http.get<Partial<IUser[]>>(
      `${this.baseUrlAdminService}users-with-roles`
    );
  }

  updateUserRoles(username: string, roles: string[]){
    return this.http.post(`${this.baseUrlAdminService}edit-roles/${username}?roles=${roles}`, {});
  }
}
