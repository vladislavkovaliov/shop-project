import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, of } from 'rxjs';
import type { Observable } from 'rxjs';
import type { User, UserWithPurchases } from '@app/models/user.types';
import type { PaginatedResponse } from '@app/models/order.types';
import type { DtoListUserResponse, DtoListUserWithTotalResponse } from 'src/lib/types/api';
import { mapUsers, mapUserWithPurchases } from './user.mapper';

@Injectable()
export class UserService {
  private http = inject(HttpClient);

  static getUsersUrl = '/api/users';
  static getTop3Url = '/api/users/top-3-users';
  static getPremiumUsersUrl = '/api/users/by-most-expensive-product';

  getUsers(page: number, pageSize: number): Observable<PaginatedResponse<User>> {
    const offset = page * pageSize;

    return this.http.get<DtoListUserResponse>(UserService.getUsersUrl, {
      params: { limit: pageSize, offset },
    }).pipe(
      map(response => {
        const { data, total } = response;
        const items = mapUsers(data);
        return { items, total, page, pageSize };
      }),
    );
  }

  getTop3Users(): Observable<UserWithPurchases[]> {
    return this.http.get<DtoListUserWithTotalResponse>(UserService.getTop3Url).pipe(
      map(response => response.data.map(mapUserWithPurchases)),
    );
  }

  getPremiumUsers(): Observable<User[]> {
    return this.http.get<DtoListUserResponse>(UserService.getPremiumUsersUrl).pipe(
      map(response => mapUsers(response.data)),
    );
  }
}
