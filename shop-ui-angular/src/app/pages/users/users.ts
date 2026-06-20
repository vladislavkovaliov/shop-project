import { Component, inject, signal } from '@angular/core';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { rxResource } from '@angular/core/rxjs-interop';
import { CreateUserDialog } from '@components/create-user-dialog/create-user-dialog';
import { UserService } from '@app/services/users/user.service';

function paginatorIntlFactory(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = '';
  intl.nextPageLabel = '';
  intl.previousPageLabel = '';
  intl.firstPageLabel = '';
  intl.lastPageLabel = '';
  intl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0) return `0 of ${length}`;
    const start = page * pageSize + 1;
    const end = Math.min(start + pageSize - 1, length);
    return `${start}\u2013${end} of ${length}`;
  };
  return intl;
}

@Component({
  selector: 'app-users',
  imports: [
    MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
    MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow,
    MatPaginator, MatButton, MatIcon, MatDialogModule,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
  providers: [
    { provide: MatPaginatorIntl, useFactory: paginatorIntlFactory },
  ],
})
export class Users {
  private dialog = inject(MatDialog);
  private userService = inject(UserService);

  protected readonly displayedColumns = ['id', 'name', 'email', 'actions'];
  protected pageIndex = signal(0);
  protected pageSize = signal(10);

  readonly usersResource = rxResource({
    params: () => ({ page: this.pageIndex(), pageSize: this.pageSize() }),
    stream: (p) => this.userService.getUsers(p.params.page, p.params.pageSize),
    defaultValue: { items: [], total: 0, page: 0, pageSize: 10 },
  });

  readonly top3Resource = rxResource({
    stream: () => this.userService.getTop3Users(),
    defaultValue: [],
  });

  readonly premiumResource = rxResource({
    stream: () => this.userService.getPremiumUsers(),
    defaultValue: [],
  });

  protected onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(CreateUserDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.usersResource.reload();
      }
    });
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  }

  protected getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  protected avatarBg(index: number): string {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-green-100 text-green-700',
      'bg-amber-100 text-amber-700',
      'bg-rose-100 text-rose-700',
      'bg-cyan-100 text-cyan-700',
    ];
    return colors[index % colors.length];
  }
}
