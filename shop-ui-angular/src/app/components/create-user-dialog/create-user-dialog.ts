import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { UserService } from '@app/services/users/user.service';

@Component({
  selector: 'app-create-user-dialog',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButton, MatIcon,
    MatFormField, MatLabel, MatInput,
  ],
  templateUrl: './create-user-dialog.html',
  styleUrl: './create-user-dialog.css',
})
export class CreateUserDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateUserDialog>);
  private userService = inject(UserService);

  protected form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.userService.createUser(this.form.value as any).subscribe({
      next: (result) => this.dialogRef.close(result),
      error: () => {},
    });
  }
}
