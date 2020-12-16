import { Component, OnInit } from '@angular/core';
import { LikePredicate } from '../constants/custom-types';
import { IMember } from '../models/member';
import { Pagination } from '../models/pagination';
import { MembersService } from '../services/members.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss'],
})
export class ListsComponent implements OnInit {
  members: Partial<IMember[]>;
  predicate: LikePredicate = 'liked';
  pageNumber: number = 1;
  pageSize: number = 5;
  pagination: Pagination;

  constructor(private membersService: MembersService) {}

  ngOnInit(): void {
    this.loadLikes();
  }

  loadLikes() {
    this.membersService
      .getLikes(this.predicate, this.pageNumber, this.pageSize)
      .subscribe((response) => {
        this.members = response.result;
        this.pagination = response.pagination;
      });
  }

  pageChanged(event: any) {
    this.pageNumber = event.page;
    this.loadLikes();
  }
}
