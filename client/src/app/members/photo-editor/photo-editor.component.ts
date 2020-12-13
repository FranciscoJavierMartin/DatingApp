import { Component, Input, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs/operators';
import { IMember } from 'src/app/models/member';
import { IPhoto } from 'src/app/models/photo';
import { IUser } from 'src/app/models/user';
import { AccountService } from 'src/app/services/account.service';
import { MembersService } from 'src/app/services/members.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.scss'],
})
export class PhotoEditorComponent implements OnInit {
  @Input() member: IMember;
  uploader: FileUploader;
  hasBaseDropZoneOver: boolean = false;
  baseUrlService: string = `${environment.apiUrl}users/add-photo`;
  user: IUser | null;

  constructor(
    private accountService: AccountService,
    private membersService: MembersService
  ) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.user = user));
  }

  ngOnInit(): void {
    this.initializeUploader();
  }

  fileOverBase(e: any) {
    this.hasBaseDropZoneOver = e;
  }

  setMainPhoto(photo: IPhoto) {
    this.membersService.setMainPhoto(photo.id).subscribe(() => {
      if (this.user) {
        this.user.photoUrl = photo.url;
        this.accountService.setCurrentUser(this.user);
        this.member.photoUrl = photo.url;
        this.member.photos.forEach((p) => {
          if (p.isMain) {
            p.isMain = false;
          }
          if (p.id === photo.id) {
            p.isMain = true;
          }
        });
      }
    });
  }

  deletePhoto(photoId: number) {
    this.membersService.deletePhoto(photoId).subscribe(() => {
      this.member.photos = this.member.photos.filter((x) => x.id !== photoId);
    });
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrlService,
      authToken: `Bearer ${this.user?.token}`,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024,
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const photo: IPhoto = JSON.parse(response);
        this.member.photos.push(photo);
        if (photo.isMain) {
          if (this.user) {
            this.user.photoUrl = photo.url;
            this.accountService.setCurrentUser(this.user);
          }
          this.member.photoUrl = photo.url;
        }
      }
    };
  }
}
