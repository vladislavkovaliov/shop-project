import { Component } from '@angular/core';
import { StatCard } from '@components/stat-card/stat-card';

interface StatData {
  icon: string;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

@Component({
  selector: 'app-home',
  imports: [StatCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly stats: StatData[] = [
    { icon: 'payments', label: 'Revenue', value: '$128,430.00', trend: '+12.5%', trendUp: true },
    { icon: 'shopping_bag', label: 'Orders', value: '3,421', trend: '+8.2%', trendUp: true },
    { icon: 'person_play', label: 'Users', value: '1,204', trend: '-2.1%', trendUp: false },
    { icon: 'ads_click', label: 'Conversion', value: '3.24%', trend: '+4.3%', trendUp: true },
  ];
}
