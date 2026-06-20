import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user.service';
import type { User, UserWithPurchases } from '@app/models/user.types';
import type { PaginatedResponse } from '@app/models/order.types';
import type { DtoCreateUserRequest, DtoUserResponse } from 'src/lib/types/api';

const RAW_USERS_RESPONSE = {
  data: [
    { id: 1, name: 'Артем Кузнецов', email: 'kuznetsov.art@mail.ru' },
    { id: 2, name: 'Светлана Иванова', email: 'sveta.iva@gmail.com' },
  ],
  total: 2,
};

const EXPECTED_USERS: User[] = [
  { id: 1, name: 'Артем Кузнецов', email: 'kuznetsov.art@mail.ru' },
  { id: 2, name: 'Светлана Иванова', email: 'sveta.iva@gmail.com' },
];

const RAW_TOP3_RESPONSE = {
  data: [
    { id: 3, name: 'Александр Волков', email: 'volkov.a@example.com', totalSpent: 142500 },
  ],
  total: 1,
};

const EXPECTED_TOP3: UserWithPurchases[] = [
  { id: 3, name: 'Александр Волков', email: 'volkov.a@example.com', totalSpent: 142500 },
];

const RAW_PREMIUM_RESPONSE = {
  data: [
    { id: 6, name: 'Игорь Белов', email: 'belov.igor@outlook.com' },
  ],
  total: 1,
};

const EXPECTED_PREMIUM: User[] = [
  { id: 6, name: 'Игорь Белов', email: 'belov.igor@outlook.com' },
];

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getUsers', () => {
    it('should make GET request with limit and offset params', () => {
      service.getUsers(0, 10).subscribe();
      const req = httpMock.expectOne('/api/users?limit=10&offset=0');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should compute offset for page 2', () => {
      service.getUsers(2, 5).subscribe();
      const req = httpMock.expectOne('/api/users?limit=5&offset=10');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should map DtoUserResponse to User', () => {
      let result: PaginatedResponse<User> | undefined;

      service.getUsers(0, 10).subscribe(r => result = r);
      httpMock.expectOne('/api/users?limit=10&offset=0').flush(RAW_USERS_RESPONSE);

      expect(result!.items).toEqual(EXPECTED_USERS);
      expect(result!.total).toBe(2);
      expect(result!.page).toBe(0);
      expect(result!.pageSize).toBe(10);
    });

    it('should handle empty data', () => {
      let result: PaginatedResponse<User> | undefined;

      service.getUsers(0, 10).subscribe(r => result = r);
      httpMock.expectOne('/api/users?limit=10&offset=0').flush({ data: [], total: 0 });

      expect(result!.items).toEqual([]);
      expect(result!.total).toBe(0);
    });

    it('should propagate HTTP error', () => {
      let error: unknown;

      service.getUsers(0, 10).subscribe({ error: e => error = e });
      httpMock.expectOne('/api/users?limit=10&offset=0').flush(
        { message: 'Server error' },
        { status: 500, statusText: 'Internal Server Error' },
      );

      expect(error).toBeTruthy();
    });
  });

  describe('getTop3Users', () => {
    it('should make GET request', () => {
      service.getTop3Users().subscribe();
      const req = httpMock.expectOne('/api/users/top-3-users');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should map response', () => {
      let result: UserWithPurchases[] | undefined;

      service.getTop3Users().subscribe(r => result = r);
      httpMock.expectOne('/api/users/top-3-users').flush(RAW_TOP3_RESPONSE);

      expect(result).toEqual(EXPECTED_TOP3);
    });
  });

  describe('createUser', () => {
    it('should POST to /api/users with name and email', () => {
      const payload: DtoCreateUserRequest = { name: 'Test User', email: 'test@example.com' };
      service.createUser(payload).subscribe();
      const req = httpMock.expectOne('/api/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ id: 1, name: 'Test User', email: 'test@example.com' });
    });

    it('should return the created user', () => {
      let result: DtoUserResponse | undefined;
      service.createUser({ name: 'New User', email: 'new@test.com' }).subscribe(r => result = r);
      httpMock.expectOne('/api/users').flush({ id: 16, name: 'New User', email: 'new@test.com' });
      expect(result!.id).toBe(16);
      expect(result!.name).toBe('New User');
      expect(result!.email).toBe('new@test.com');
    });

    it('should propagate HTTP error', () => {
      let error: unknown;
      service.createUser({ name: '', email: '' }).subscribe({ error: e => error = e });
      httpMock.expectOne('/api/users').flush(
        { error: 'name is required' },
        { status: 400, statusText: 'Bad Request' },
      );
      expect(error).toBeTruthy();
    });
  });

  describe('getPremiumUsers', () => {
    it('should make GET request', () => {
      service.getPremiumUsers().subscribe();
      const req = httpMock.expectOne('/api/users/by-most-expensive-product');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });

    it('should map response', () => {
      let result: User[] | undefined;

      service.getPremiumUsers().subscribe(r => result = r);
      httpMock.expectOne('/api/users/by-most-expensive-product').flush(RAW_PREMIUM_RESPONSE);

      expect(result).toEqual(EXPECTED_PREMIUM);
    });
  });
});
