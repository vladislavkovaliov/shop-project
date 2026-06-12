import { Component, inject, signal } from '@angular/core';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { rxResource } from '@angular/core/rxjs-interop';
import { StatCard } from '@components/stat-card/stat-card';
import { CreateOrderDialog } from '@components/create-order-dialog/create-order-dialog';
import { OrderService } from '@app/services/orders/order.service';

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
  selector: 'app-orders',
  imports: [
    MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
    MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow,
    MatPaginator, MatButton, MatIcon, MatTabGroup, MatTab, StatCard,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
  providers: [
    { provide: MatPaginatorIntl, useFactory: paginatorIntlFactory },
  ],
})
export class Orders {
  private dialog = inject(MatDialog);
  private orderService = inject(OrderService);

  protected readonly displayedColumns = ['id', 'userId', 'createdAt'];
  protected pageIndex = signal(0);
  protected pageSize = signal(10);

  protected readonly dailyColumns = ['date', 'orders', 'revenue'];
  protected dailyPageIndex = signal(0);
  protected dailyPageSize = signal(5);

  readonly ordersResource = rxResource({
    params: () => ({ page: this.pageIndex(), pageSize: this.pageSize() }),
    stream: (p) => this.orderService.getOrders(p.params.page, p.params.pageSize),
    defaultValue: { items: [], total: 0, page: 0, pageSize: 10 },
  });

  readonly dailyResource = rxResource({
    params: () => ({ page: this.dailyPageIndex(), pageSize: this.dailyPageSize() }),
    stream: (p) => this.orderService.getDailyPurchases(p.params.page, p.params.pageSize),
    defaultValue: { items: [], total: 0, page: 0, pageSize: 5 },
  });

  readonly statsResource = rxResource({
    stream: () => this.orderService.getOrderStats(),
    defaultValue: { totalThisMonth: 0, averageCheck: 0, activeOrders: 0 },
  });

  protected onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected onDailyPage(event: PageEvent): void {
    this.dailyPageIndex.set(event.pageIndex);
    this.dailyPageSize.set(event.pageSize);
  }

  protected openCreateOrderDialog(): void {
    this.dialog.open(CreateOrderDialog);
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  }

  protected formatDate(iso: string): string {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(iso));
  }
}
