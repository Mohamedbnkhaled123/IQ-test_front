import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';
import { ExamModuleMeta } from '../exam-runner/exam-modules.config';

@Component({
  selector: 'app-module-intro',
  imports: [AlertBannerComponent],
  templateUrl: './module-intro.component.html',
  styleUrl: './module-intro.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModuleIntroComponent {
  readonly moduleInfo = input.required<ExamModuleMeta>();
  readonly questionCount = input.required<number>();
  readonly completedModuleTitle = input<string>('');
  readonly startModule = output<void>();

  onStartClick(): void {
    this.startModule.emit();
  }
}
