import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import type { Observable } from 'rxjs';
import type { User, UserWithPurchases } from '@app/models/user.types';
import type { PaginatedResponse } from '@app/models/order.types';

const MOCK_USERS: User[] = [
  { id: 1, name: 'Артем Кузнецов', email: 'kuznetsov.art@mail.ru' },
  { id: 2, name: 'Светлана Иванова', email: 'sveta.iva@gmail.com' },
  { id: 3, name: 'Александр Волков', email: 'volkov.a@example.com' },
  { id: 4, name: 'Елена Смирнова', email: 'elena.sm@mail.ru' },
  { id: 5, name: 'Дмитрий Петров', email: 'dima_ptr@yandex.ru' },
  { id: 6, name: 'Игорь Белов', email: 'belov.igor@outlook.com' },
  { id: 7, name: 'Мария Котова', email: 'kotova.m@inbox.ru' },
  { id: 8, name: 'Николай Морозов', email: 'n.morozov@proton.me' },
  { id: 9, name: 'Анна Ли', email: 'anna.lee@gmail.com' },
  { id: 10, name: 'Павел Соколов', email: 'pavel.s@yandex.ru' },
  { id: 11, name: 'Ольга Новикова', email: 'novikova.o@mail.ru' },
  { id: 12, name: 'Алексей Федоров', email: 'fedorov.a@gmail.com' },
  { id: 13, name: 'Татьяна Мороз', email: 'moroz.t@inbox.ru' },
  { id: 14, name: 'Сергей Козлов', email: 'kozlov.s@outlook.com' },
  { id: 15, name: 'Юлия Зайцева', email: 'zayceva.j@proton.me' },
];

const MOCK_TOP3: UserWithPurchases[] = [
  { id: 3, name: 'Александр Волков', email: 'volkov.a@example.com', totalSpent: 142500 },
  { id: 4, name: 'Елена Смирнова', email: 'elena.sm@mail.ru', totalSpent: 128400 },
  { id: 5, name: 'Дмитрий Петров', email: 'dima_ptr@yandex.ru', totalSpent: 98200 },
];

const MOCK_PREMIUM: User[] = [
  { id: 6, name: 'Игорь Белов', email: 'belov.igor@outlook.com' },
  { id: 7, name: 'Мария Котова', email: 'kotova.m@inbox.ru' },
];

@Injectable()
export class MockUserService {
  private nextId = 16;
  getUsers(page: number, pageSize: number): Observable<PaginatedResponse<User>> {
    const start = page * pageSize;
    const items = MOCK_USERS.slice(start, start + pageSize);
    return of({ items, total: MOCK_USERS.length, page, pageSize });
  }

  getTop3Users(): Observable<UserWithPurchases[]> {
    return of(MOCK_TOP3);
  }

  getPremiumUsers(): Observable<User[]> {
    return of(MOCK_PREMIUM);
  }

  createUser(data: { name: string; email: string }): Observable<User> {
    const newUser: User = {
      id: this.nextId++,
      name: data.name,
      email: data.email,
    };
    MOCK_USERS.push(newUser);
    return of(newUser);
  }
}
