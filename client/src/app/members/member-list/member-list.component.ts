import { Component, OnInit } from '@angular/core';
import { MembersService } from 'src/app/services/members.service';
import { IMember } from 'src/app/models/member';
import { Observable } from 'rxjs';
import { Pagination } from 'src/app/models/pagination';
import { UserParams } from 'src/app/models/userParams';
import { AccountService } from 'src/app/services/account.service';
import { take } from 'rxjs/operators';
import { IUser } from 'src/app/models/user';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
})
export class MemberListComponent implements OnInit {
  members: IMember[] = [];
  pagination: Pagination;
  userParams: UserParams;
  user: IUser;
  genderList = [
    { value: 'male', display: 'Males' },
    { value: 'female', display: 'Females' },
  ];

  constructor(private membersService: MembersService) {
    this.userParams = this.membersService.getUserParams();
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  pageChanged(event: any): void {
    this.userParams.pageNumber = event.page;
    this.membersService.setUserParams(this.userParams);
    this.loadMembers();
  }

  resetFilters() {
    this.userParams = this.membersService.resetUserParams();
    this.loadMembers();
  }

  loadMembers(): void {
    this.membersService.setUserParams(this.userParams);
    this.membersService.getMembers(this.userParams).subscribe((response) => {
      this.members = response.result;
      this.pagination = response.pagination;
    });
  }
}
