import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { CreateOrderDialog } from './create-order-dialog';
import { OrderService } from '@app/services/orders/order.service';

describe('CreateOrderDialog', () => {
  let component: CreateOrderDialog;
  let fixture: ComponentFixture<CreateOrderDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrderDialog],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: OrderService, useValue: { createOrder: vi.fn().mockReturnValue(of({})) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrderDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
