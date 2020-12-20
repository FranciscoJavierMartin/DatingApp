import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RolesModalComponent } from '../../modals/roles-modal/roles-modal.component';
import { IUser } from 'src/app/models/user';
import { AdminService } from 'src/app/services/admin.service';
import { IEditRoleRow } from 'src/app/interfaces/common';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit {
  users: Partial<IUser[]>;
  bsModalRef: BsModalRef;

  constructor(
    private adminService: AdminService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  getUsersWithRoles() {
    this.adminService.getUsersWithRoles().subscribe((users) => {
      this.users = users;
    });
  }

  openRolesModal(user: IUser) {
    const config = {
      class: 'modal-dialog-centered',
      initialState: {
        user,
        roles: this.getRolesArray(user),
      },
    };
    this.bsModalRef = this.modalService.show(RolesModalComponent, config);
    this.bsModalRef.content.updateSelectedRoles.subscribe(
      (values: IEditRoleRow[]) => {
        const rolesToUpdate = {
          roles: [
            ...values.filter((el) => el.checked === true).map((el) => el.name),
          ],
        };
        if (rolesToUpdate) {
          this.adminService
            .updateUserRoles(user.username, rolesToUpdate.roles)
            .subscribe(() => {
              user.roles = [...rolesToUpdate.roles];
            });
        }
      }
    );
  }

  private getRolesArray(user: IUser) {
    const roles: IEditRoleRow[] = [];
    const userRoles = user.roles;
    const availableRoles: IEditRoleRow[] = [
      { name: 'Admin', value: 'Admin' },
      { name: 'Moderator', value: 'Moderator' },
      { name: 'Member', value: 'Member' },
    ];

    availableRoles.forEach((role) => {
      let isMatch: boolean = false;
      for (const userRole of userRoles) {
        if (role.name === userRole) {
          isMatch = true;
          role.checked = true;
          roles.push(role);
          break;
        }
      }

      if (!isMatch) {
        role.checked = false;
        roles.push(role);
      }
    });
    return roles;
  }
}
