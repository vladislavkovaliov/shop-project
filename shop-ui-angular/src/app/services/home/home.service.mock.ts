import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import type { Observable } from 'rxjs';
import type { HomeStats } from './home.types';

@Injectable()
export class MockHomeService {
  getStats(): Observable<HomeStats> {
    return of({
      users: 1204,
      orders: 3421,
      revenue: 128430.0,
      conversion: 3.24,
      revenueTrend: { value: 12.5, sign: '+' },
      ordersTrend: { value: 8.2, sign: '+' },
      usersTrend: { value: 2.1, sign: '-' },
      conversionTrend: { value: 4.3, sign: '+' },
    });
  }
}
