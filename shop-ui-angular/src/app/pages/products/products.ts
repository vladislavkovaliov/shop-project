import { Component, inject, signal } from '@angular/core';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { rxResource } from '@angular/core/rxjs-interop';
import { StatCard } from '@components/stat-card/stat-card';
import { CreateProductDialog } from '@components/create-product-dialog/create-product-dialog';
import { ProductService } from '@app/services/products/product.service';

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
  selector: 'app-products',
  imports: [
    MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
    MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow,
    MatPaginator, MatButton, MatIcon, MatTabGroup, MatTab, StatCard,
  ],
  templateUrl: './products.html',
  styleUrl: './products.css',
  providers: [
    { provide: MatPaginatorIntl, useFactory: paginatorIntlFactory },
  ],
})
export class Products {
  private dialog = inject(MatDialog);
  private productService = inject(ProductService);

  protected readonly productColumns = ['id', 'title', 'price', 'category'];
  protected productPageIndex = signal(0);
  protected productPageSize = signal(10);

  protected readonly revenueStats = [
    { label: 'Total Revenue', value: '$1,240,500' },
    { label: 'Avg Order Value', value: '$89' },
    { label: 'Total Products Sold', value: '15,342' },
  ];

  protected readonly revenueColumns = ['title', 'revenue', 'growth'];
  protected revenuePageIndex = signal(0);
  protected revenuePageSize = signal(5);

  readonly productsResource = rxResource({
    params: () => ({ page: this.productPageIndex(), pageSize: this.productPageSize() }),
    stream: (p) => this.productService.getProducts(p.params.page, p.params.pageSize),
    defaultValue: { items: [], total: 0, page: 0, pageSize: 10 },
  });

  readonly revenueResource = rxResource({
    params: () => ({ page: this.revenuePageIndex(), pageSize: this.revenuePageSize() }),
    stream: (p) => this.productService.getProductRevenue(p.params.page, p.params.pageSize),
    defaultValue: { items: [], total: 0, page: 0, pageSize: 5 },
  });

  readonly revenueStatsResource = rxResource({
    stream: () => this.productService.getRevenueStats(),
    defaultValue: { totalRevenue: 0, totalProductsSold: 0, averageOrderValue: 0},
  });

  protected onProductPage(event: PageEvent): void {
    this.productPageIndex.set(event.pageIndex);
    this.productPageSize.set(event.pageSize);
  }

  protected onRevenuePage(event: PageEvent): void {
    this.revenuePageIndex.set(event.pageIndex);
    this.revenuePageSize.set(event.pageSize);
  }

  protected openCreateProductDialog(): void {
    const dialogRef = this.dialog.open(CreateProductDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productsResource.reload();
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
}
