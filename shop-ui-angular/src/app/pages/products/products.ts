import { Component, inject } from '@angular/core';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { StatCard } from '@components/stat-card/stat-card';
import { CreateProductDialog } from '@components/create-product-dialog/create-product-dialog';

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  category: string;
}

interface RevenueRow {
  month: string;
  orders: number;
  revenue: string;
  growth: string;
}

interface RevenueStat {
  label: string;
  value: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: 'PROD-001', name: 'Wireless Headphones', price: '$89.99', stock: 42, category: 'Electronics' },
  { id: 'PROD-002', name: 'Leather Jacket', price: '$199.00', stock: 15, category: 'Clothing' },
  { id: 'PROD-003', name: 'Running Shoes', price: '$129.95', stock: 78, category: 'Footwear' },
  { id: 'PROD-004', name: 'Smart Watch', price: '$249.00', stock: 23, category: 'Electronics' },
  { id: 'PROD-005', name: 'Coffee Maker', price: '$59.99', stock: 56, category: 'Appliances' },
  { id: 'PROD-006', name: 'Yoga Mat', price: '$34.50', stock: 112, category: 'Sports' },
  { id: 'PROD-007', name: 'Desk Lamp', price: '$45.00', stock: 67, category: 'Furniture' },
  { id: 'PROD-008', name: 'Bluetooth Speaker', price: '$79.99', stock: 34, category: 'Electronics' },
  { id: 'PROD-009', name: 'Backpack', price: '$89.00', stock: 48, category: 'Accessories' },
  { id: 'PROD-010', name: 'Sunglasses', price: '$159.00', stock: 29, category: 'Accessories' },
  { id: 'PROD-011', name: 'Novel (Bestseller)', price: '$14.99', stock: 203, category: 'Books' },
  { id: 'PROD-012', name: 'Protein Powder', price: '$49.99', stock: 91, category: 'Sports' },
];

const MOCK_REVENUE: RevenueRow[] = [
  { month: 'Jan 2026', orders: 342, revenue: '$128,430', growth: '+12.5%' },
  { month: 'Feb 2026', orders: 298, revenue: '$112,200', growth: '+8.3%' },
  { month: 'Mar 2026', orders: 415, revenue: '$156,800', growth: '+15.1%' },
  { month: 'Apr 2026', orders: 381, revenue: '$143,600', growth: '+11.7%' },
  { month: 'May 2026', orders: 356, revenue: '$134,200', growth: '+9.4%' },
  { month: 'Jun 2026', orders: 402, revenue: '$151,500', growth: '+13.8%' },
  { month: 'Jul 2026', orders: 378, revenue: '$142,100', growth: '+10.2%' },
  { month: 'Aug 2026', orders: 325, revenue: '$122,400', growth: '+7.6%' },
  { month: 'Sep 2026', orders: 440, revenue: '$165,800', growth: '+16.3%' },
  { month: 'Oct 2026', orders: 368, revenue: '$138,700', growth: '+11.1%' },
];

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

  protected readonly productColumns = ['id', 'name', 'price', 'stock', 'category'];
  protected readonly totalProducts = MOCK_PRODUCTS.length;
  protected productPageSize = 10;
  protected productPageIndex = 0;

  protected readonly revenueStats: RevenueStat[] = [
    { label: 'Total Revenue', value: '$1,240,500' },
    { label: 'Avg Order Value', value: '$89' },
    { label: 'Total Products Sold', value: '15,342' },
  ];

  protected readonly revenueColumns = ['month', 'orders', 'revenue', 'growth'];
  protected readonly revenueData = MOCK_REVENUE;
  protected revenuePageSize = 5;
  protected revenuePageIndex = 0;

  protected get pagedProducts(): Product[] {
    const start = this.productPageIndex * this.productPageSize;
    return MOCK_PRODUCTS.slice(start, start + this.productPageSize);
  }

  protected get pagedRevenue(): RevenueRow[] {
    const start = this.revenuePageIndex * this.revenuePageSize;
    return MOCK_REVENUE.slice(start, start + this.revenuePageSize);
  }

  protected onProductPage(event: PageEvent): void {
    this.productPageIndex = event.pageIndex;
    this.productPageSize = event.pageSize;
  }

  protected onRevenuePage(event: PageEvent): void {
    this.revenuePageIndex = event.pageIndex;
    this.revenuePageSize = event.pageSize;
  }

  protected openCreateProductDialog(): void {
    this.dialog.open(CreateProductDialog);
  }
}
