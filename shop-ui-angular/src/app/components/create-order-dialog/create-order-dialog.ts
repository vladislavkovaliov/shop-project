import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { OrderService } from '@app/services/orders/order.service';

@Component({
  selector: 'app-create-order-dialog',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButton, MatIcon,
    MatFormField, MatLabel, MatInput,
  ],
  templateUrl: './create-order-dialog.html',
  styleUrl: './create-order-dialog.css',
})
export class CreateOrderDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateOrderDialog>);
  private orderService = inject(OrderService);

  protected form = this.fb.group({
    user_id: [0, [Validators.required, Validators.min(1)]],
    items: this.fb.array([this.createItem()]),
  });

  protected get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  private createItem() {
    return this.fb.group({
      product_id: [0, [Validators.required, Validators.min(1)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  protected addItem(): void {
    this.items.push(this.createItem());
  }

  protected removeItem(index: number): void {
    this.items.removeAt(index);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.orderService.createOrder(this.form.value as any).subscribe({
      next: (result) => this.dialogRef.close(result),
      error: () => {},
    });
  }
}
