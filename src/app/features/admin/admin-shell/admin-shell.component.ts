import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { parseHttpError } from '../../../core/utils/http-error.util';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { QuestionsCrudComponent } from '../questions-crud/questions-crud.component';
import { SettingsPaymentsComponent } from '../settings-payments/settings-payments.component';
import { UsersGrantsComponent } from '../users-grants/users-grants.component';

type AdminTab = 'users' | 'questions' | 'grants' | 'settings';

@Component({
  selector: 'app-admin-shell',
  imports: [
    AlertBannerComponent,
    LoadingSpinnerComponent,
    UsersGrantsComponent,
    QuestionsCrudComponent,
    SettingsPaymentsComponent
  ],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminShellComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  readonly overview = this.adminApi.overview;
  readonly activeTab = signal<AdminTab>('users');
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    this.reloadOverview();
  }

  switchTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }

  reloadOverview(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.adminApi.loadOverview().subscribe({
      next: () => this.loading.set(false),
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(parseHttpError(err, 'تعذر تحميل بيانات لوحة الأدمن').message);
      }
    });
  }
}
