import { Component, OnInit } from '@angular/core';
import { IPhoto } from 'src/app/models/photo';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-photo-management',
  templateUrl: './photo-management.component.html',
  styleUrls: ['./photo-management.component.scss'],
})
export class PhotoManagementComponent implements OnInit {
  photos: IPhoto[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.getPhotosForApproval();
  }

  getPhotosForApproval(): void {
    this.adminService.getPhotosForApproval().subscribe((photos: IPhoto[]) => {
      this.photos = photos;
    });
  }

  approvePhoto(photoId: number): void {
    this.adminService.approvePhoto(photoId).subscribe(() => {
      this.photos.splice(
        this.photos.findIndex((p: IPhoto) => p.id === photoId),
        1
      );
    });
  }

  rejectPhoto(photoId: number): void {
    this.adminService.rejectPhoto(photoId).subscribe(() => {
      this.photos.splice(
        this.photos.findIndex((p: IPhoto) => p.id === photoId),
        1
      );
    });
  }
}
