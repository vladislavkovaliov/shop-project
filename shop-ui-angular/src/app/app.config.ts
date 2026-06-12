import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { API_BASE_URL } from '@app/tokens/api-base-url.token';
import { apiBaseUrlInterceptor } from '@app/interceptors/api-base-url.interceptor';
import { OrderService } from '@app/services/orders/order.service';
import { MockOrderService } from '@app/services/orders/order.service.mock';
import { CategoryService } from '@app/services/categories/category.service';
import { MockCategoryService } from '@app/services/categories/category.service.mock';
import { IS_MOCK } from '@app/tokens/is-mock.token';

const USE_MOCK = false;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([apiBaseUrlInterceptor])),
    { provide: API_BASE_URL, useValue: environment.apiUrl },
    { provide: IS_MOCK, useValue: USE_MOCK },
    USE_MOCK
      ? { provide: OrderService, useClass: MockOrderService }
      : OrderService,
    USE_MOCK
      ? { provide: CategoryService, useClass: MockCategoryService }
      : CategoryService,
  ],
};
