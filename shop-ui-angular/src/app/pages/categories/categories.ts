import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { StatCard } from '@components/stat-card/stat-card';
import { CreateCategoryDialog } from '@components/create-category-dialog/create-category-dialog';
import { CategoryService } from '@app/services/categories/category.service';
import { IS_MOCK } from '@app/tokens/is-mock.token';
import type { Category, CategoryRevenue, CategoryStats } from '@app/models/category.types';

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
  selector: 'app-categories',
  imports: [
    MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
    MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow,
    MatPaginator, MatButton, MatIcon, MatTabGroup, MatTab, StatCard,
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  providers: [
    { provide: MatPaginatorIntl, useFactory: paginatorIntlFactory },
  ],
})
export class Categories implements OnInit {
  private dialog = inject(MatDialog);
  private categoryService = inject(CategoryService);
  private cdr = inject(ChangeDetectorRef);
  protected readonly isMock = inject(IS_MOCK);

  protected readonly displayedColumns = ['id', 'name', 'slug', 'created'];
  protected categories: Category[] = [];
  protected totalCategories = 0;
  protected pageSize = 10;
  protected pageIndex = 0;

  protected readonly statsColumns = ['category', 'products', 'revenue', 'orders', 'growth'];
  protected revenueData: CategoryRevenue[] = [];
  protected totalRevenue = 0;
  protected statsPageSize = 5;
  protected statsPageIndex = 0;

  protected categoryStats: CategoryStats | null = null;

  ngOnInit(): void {
    this.loadCategories();
    this.loadCategoryRevenue();
    this.loadCategoryStats();
  }

  private loadCategories(): void {
    this.categoryService.getCategories(this.pageIndex, this.pageSize).subscribe(res => {
      this.categories = res.items;
      this.totalCategories = res.total;
      this.cdr.detectChanges();
    });
  }

  private loadCategoryRevenue(): void {
    this.categoryService.getCategoryRevenue(this.statsPageIndex, this.statsPageSize).subscribe(res => {
      this.revenueData = res.items;
      this.totalRevenue = res.total;
      this.cdr.detectChanges();
    });
  }

  private loadCategoryStats(): void {
    this.categoryService.getCategoryStats().subscribe(stats => {
      this.categoryStats = stats;
      this.cdr.detectChanges();
    });
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  }

  protected onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCategories();
  }

  protected onStatsPage(event: PageEvent): void {
    this.statsPageIndex = event.pageIndex;
    this.statsPageSize = event.pageSize;
    this.loadCategoryRevenue();
  }

  protected openCreateCategoryDialog(): void {
    this.dialog.open(CreateCategoryDialog);
  }
}
