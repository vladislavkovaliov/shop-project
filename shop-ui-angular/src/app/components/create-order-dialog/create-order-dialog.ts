import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

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

  form: FormGroup = this.fb.group({
    userId: ['', Validators.required],
    items: this.fb.array([this.createItem()]),
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  get itemControls(): FormGroup[] {
    return this.items.controls as FormGroup[];
  }

  private createItem(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    console.log(this.form.value);
    this.dialogRef.close();
  }
}
