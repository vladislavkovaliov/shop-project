import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-create-category-dialog',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButton, MatIcon,
    MatFormField, MatLabel, MatInput,
  ],
  templateUrl: './create-category-dialog.html',
  styleUrl: './create-category-dialog.css',
})
export class CreateCategoryDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateCategoryDialog>);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    slug: ['', Validators.required],
    description: [''],
  });

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    console.log(this.form.value);
    this.dialogRef.close();
  }
}
