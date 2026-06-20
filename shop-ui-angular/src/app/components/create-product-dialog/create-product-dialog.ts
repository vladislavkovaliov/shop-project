import { Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { ProductService } from '@app/services/products/product.service';
import { CategoryService } from '@app/services/categories/category.service';
import type { Category } from '@app/models/category.types';
import type { DtoCreateProductRequest } from 'src/lib/types/api';

@Component({
  selector: 'app-create-product-dialog',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButton, MatIcon,
    MatFormField, MatLabel, MatInput, MatSelect, MatOption,
  ],
  templateUrl: './create-product-dialog.html',
  styleUrl: './create-product-dialog.css',
})
export class CreateProductDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateProductDialog>);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  protected categoriesResource = rxResource({
    stream: () => this.categoryService.getCategories(0, 100),
    defaultValue: { items: [] as Category[], total: 0, page: 0, pageSize: 100 },
  });

  protected categories = computed(() => this.categoriesResource.value().items);

  protected form = this.fb.group({
    title: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    category_id: [null as number | null],
  });

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const data: DtoCreateProductRequest = {
      title: this.form.value.title ?? undefined,
      price: this.form.value.price ?? undefined,
      category_id: this.form.value.category_id ?? undefined,
    };

    this.productService.createProduct(data).subscribe({
      next: (product) => this.dialogRef.close(product),
    });
  }
}
