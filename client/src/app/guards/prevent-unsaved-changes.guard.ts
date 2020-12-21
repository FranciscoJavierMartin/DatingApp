import { Injectable } from '@angular/core';
import {
  CanDeactivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { ConfirmService } from './../services/confirm.service';
import { MemberEditComponent } from '../members/member-edit/member-edit.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PreventUnsavedChangesGuard implements CanDeactivate<unknown> {
  constructor(private confirmService: ConfirmService) {}

  canDeactivate(component: MemberEditComponent): Observable<boolean> | true {
    return component.editForm.dirty
      ? this.confirmService.confirm(
          'Are you sure you want to continue? Any unsaved changes will be lost'
        )
      : true;
  }
}
