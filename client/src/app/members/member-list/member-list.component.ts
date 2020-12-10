import { Component, OnInit } from '@angular/core';
import { MembersService } from 'src/app/members.service';
import { IMember } from 'src/app/models/member';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
})
export class MemberListComponent implements OnInit {
  members: IMember[] = [];

  constructor(private membersService: MembersService) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.membersService.getMembers().subscribe((members) => {
      this.members = members;
    });
  }
}
