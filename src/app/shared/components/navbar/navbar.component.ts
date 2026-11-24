import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, BrandLogoComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly authApi = inject(AuthApiService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly currentUser = this.authApi.currentUser;
  readonly isUserLoggedIn = this.authApi.isUserLoggedIn;
  readonly isAdminLoggedIn = this.authApi.isAdminLoggedIn;
  readonly isDark = this.themeService.isDark;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logoutUser(): void {
    this.authApi.logoutUser();
    void this.router.navigate(['/']);
  }

  logoutAdmin(): void {
    this.authApi.logoutAdmin();
    void this.router.navigate(['/admin/login']);
  }
}
