import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { CreateOrderDialog } from './create-order-dialog';

describe('CreateOrderDialog', () => {
  let component: CreateOrderDialog;
  let fixture: ComponentFixture<CreateOrderDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrderDialog],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
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
