import { IUser } from './user';

export class UserParams {
  gender: string;
  minAge: number = 18;
  maxAge: number = 99;
  pageNumber: number = 1;
  pageSize: number = 5;
  orderBy: 'lastActive' | 'created' = 'lastActive';

  constructor(user: IUser) {
    this.gender = user.gender === 'female' ? 'male' : 'female';
  }
}
