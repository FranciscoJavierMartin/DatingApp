import { Component, OnInit } from '@angular/core';
import { MembersService } from 'src/app/services/members.service';
import { IMember } from 'src/app/models/member';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
})
export class MemberListComponent implements OnInit {
  members$: Observable<IMember[]> = [];

  constructor(private membersService: MembersService) {}

  ngOnInit(): void {
    this.members$ = this.membersService.getMembers();
  }
}
