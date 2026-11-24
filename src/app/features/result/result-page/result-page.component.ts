import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ExamResult } from '../../../core/models/exam.model';
import { ExamApiService } from '../../../core/services/exam-api.service';
import { parseHttpError } from '../../../core/utils/http-error.util';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-result-page',
  imports: [RouterLink, DatePipe, AlertBannerComponent, LoadingSpinnerComponent],
  templateUrl: './result-page.component.html',
  styleUrl: './result-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly examApi = inject(ExamApiService);

  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');
  readonly result = signal<ExamResult | null>(null);

  ngOnInit(): void {
    const attemptId = this.route.snapshot.paramMap.get('attemptId');
    if (!attemptId) {
      this.loading.set(false);
      this.errorMessage.set('معرف النتيجة غير صالح.');
      return;
    }

    this.examApi.getResult(attemptId).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.result.set(res.data);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(parseHttpError(err, 'تعذر تحميل النتيجة النهائية').message);
      }
    });
  }
}
