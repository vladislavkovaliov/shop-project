import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  imports: [MatIcon],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  readonly icon = input<string>('');
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly trend = input<string>('');
  readonly trendUp = input<boolean>(true);
  readonly mock = input<boolean>(false);
}
