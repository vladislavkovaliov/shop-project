import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HomeService } from '@app/services/home/home.service';
import type { Trend } from '@app/services/home/home.types';
import { StatCard } from '@components/stat-card/stat-card';

interface StatData {
  icon: string;
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatTrend(trend: Trend): string {
  return `${trend.sign}${trend.value}%`;
}

@Component({
  selector: 'app-home',
  imports: [StatCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private homeService = inject(HomeService);

  readonly homeStatsResource = rxResource({
    stream: () => this.homeService.getStats(),
    defaultValue: {
      users: 0,
      orders: 0,
      revenue: 0,
      conversion: 0,
      revenueTrend: { value: 0, sign: '+' },
      ordersTrend: { value: 0, sign: '+' },
      usersTrend: { value: 0, sign: '+' },
      conversionTrend: { value: 0, sign: '+' },
    },
  });

  protected readonly statCards = computed<StatData[]>(() => {
    const stats = this.homeStatsResource.value();

    return [
      {
        icon: 'payments',
        label: 'Revenue',
        value: formatCurrency(stats.revenue),
        trend: formatTrend(stats.revenueTrend),
        trendUp: stats.revenueTrend.sign === '+',
      },
      {
        icon: 'shopping_bag',
        label: 'Orders',
        value: formatNumber(stats.orders),
        trend: formatTrend(stats.ordersTrend),
        trendUp: stats.ordersTrend.sign === '+',
      },
      {
        icon: 'person_play',
        label: 'Users',
        value: formatNumber(stats.users),
        trend: formatTrend(stats.usersTrend),
        trendUp: stats.usersTrend.sign === '+',
      },
      {
        icon: 'ads_click',
        label: 'Conversion',
        value: `${stats.conversion}%`,
        trend: formatTrend(stats.conversionTrend),
        trendUp: stats.conversionTrend.sign === '+',
      },
    ];
  });
}
