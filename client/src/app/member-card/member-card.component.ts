import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IMember } from '../models/member';
import { MembersService } from '../services/members.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.scss'],
})
export class MemberCardComponent implements OnInit {
  @Input() member: IMember;

  constructor(
    private memberService: MembersService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  addLike(member: IMember) {
    this.memberService.addLike(member.username).subscribe(() => {
      this.toastr.success(`You have liked ${member.knownAs}`);
    });
  }
}
