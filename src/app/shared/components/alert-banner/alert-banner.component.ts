import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type AlertType = 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-alert-banner',
  templateUrl: './alert-banner.component.html',
  styleUrl: './alert-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertBannerComponent {
  readonly type = input<AlertType>('info');
  readonly message = input<string>('');
  readonly title = input<string>('');
}
