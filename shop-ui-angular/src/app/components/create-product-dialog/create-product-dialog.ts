import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-create-product-dialog',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButton, MatIcon,
    MatFormField, MatLabel, MatInput, MatSelectModule,
  ],
  templateUrl: './create-product-dialog.html',
  styleUrl: './create-product-dialog.css',
})
export class CreateProductDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateProductDialog>);

  protected readonly categories = [
    'Electronics', 'Clothing', 'Footwear', 'Appliances',
    'Sports', 'Furniture', 'Accessories', 'Books',
  ];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    price: ['', [Validators.required, Validators.min(0)]],
    stock: ['', [Validators.required, Validators.min(0)]],
    category: ['', Validators.required],
  });

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    console.log(this.form.value);
    this.dialogRef.close();
  }
}
