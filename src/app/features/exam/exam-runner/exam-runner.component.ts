import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ExamAnswerPayload, StartExamResponse } from '../../../core/models/exam.model';
import { StudentQuestion } from '../../../core/models/question.model';
import { ExamApiService } from '../../../core/services/exam-api.service';
import { parseHttpError } from '../../../core/utils/http-error.util';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { InputConstraintDirective } from '../../../shared/directives/input-constraint.directive';
import { CanvasConnectComponent } from '../canvas-connect/canvas-connect.component';
import { MemoryGridComponent } from '../memory-grid/memory-grid.component';
import { ModuleIntroComponent } from '../module-intro/module-intro.component';
import { EXAM_MODULES, ExamModuleMeta, getModuleMeta } from './exam-modules.config';

@Component({
  selector: 'app-exam-runner',
  imports: [
    RouterLink,
    AlertBannerComponent,
    LoadingSpinnerComponent,
    InputConstraintDirective,
    MemoryGridComponent,
    CanvasConnectComponent,
    ModuleIntroComponent
  ],
  templateUrl: './exam-runner.component.html',
  styleUrl: './exam-runner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamRunnerComponent implements OnInit {
  private readonly examApi = inject(ExamApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly modules = EXAM_MODULES;
  readonly loading = signal<boolean>(true);
  readonly submitting = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly session = signal<StartExamResponse | null>(null);
  readonly currentIndex = signal<number>(0);
  readonly secondsLeft = signal<number>(0);
  readonly showingModuleIntro = signal<boolean>(true);
  readonly completedModuleTitle = signal<string>('');

  readonly textAnswer = signal<string>('');
  readonly selectedOptionKey = signal<string>('');
  readonly selectedCellIndex = signal<number | null>(null);
  readonly canvasSolved = signal<boolean>(false);

  private answers: ExamAnswerPayload[] = [];
  private timerId: ReturnType<typeof setInterval> | null = null;

  readonly currentQuestion = computed<StudentQuestion | null>(() => {
    const s = this.session();
    return s ? (s.questions[this.currentIndex()] ?? null) : null;
  });

  readonly currentModuleMeta = computed<ExamModuleMeta>(() => {
    const q = this.currentQuestion();
    return getModuleMeta(q?.section ?? 1);
  });

  readonly currentModuleQuestions = computed<StudentQuestion[]>(() => {
    const s = this.session();
    const q = this.currentQuestion();
    return s && q ? s.questions.filter((item) => item.section === q.section) : [];
  });

  readonly currentModulePosition = computed<number>(() => {
    const q = this.currentQuestion();
    const list = this.currentModuleQuestions();
    return q ? list.findIndex((item) => item._id === q._id) + 1 : 0;
  });

  readonly isLastQuestion = computed<boolean>(() => {
    const s = this.session();
    return s ? this.currentIndex() >= s.questions.length - 1 : false;
  });

  readonly timerPercent = computed<number>(() => {
    const q = this.currentQuestion();
    if (!q || q.timeLimitSeconds <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(100, (this.secondsLeft() / q.timeLimitSeconds) * 100));
  });

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.clearTimer());
    this.beginExam();
  }

  moduleStatus(section: number): 'completed' | 'active' | 'upcoming' {
    const activeSection = this.currentQuestion()?.section ?? 1;
    if (section < activeSection) return 'completed';
    if (section === activeSection) return 'active';
    return 'upcoming';
  }

  onStartModule(): void {
    this.showingModuleIntro.set(false);
    this.startQuestionTimer();
  }

  onTextInput(event: Event): void {
    this.textAnswer.set((event.target as HTMLInputElement).value);
  }

  selectOption(key: string): void {
    this.selectedOptionKey.set(key);
  }

  onCellSelected(index: number): void {
    this.selectedCellIndex.set(index);
  }

  onCanvasSolved(isSolved: boolean): void {
    this.canvasSolved.set(isSolved);
  }

  advanceQuestion(): void {
    if (this.submitting()) return;
    const q = this.currentQuestion();
    const s = this.session();
    if (!q || !s) return;

    this.clearTimer();
    this.answers.push(this.buildAnswerPayload(q));

    if (this.currentIndex() >= s.questions.length - 1) {
      this.submitAllAnswers(s.attemptId);
      return;
    }

    const nextIdx = this.currentIndex() + 1;
    const nextQuestion = s.questions[nextIdx];
    this.currentIndex.set(nextIdx);
    this.resetQuestionInputs();

    if (nextQuestion && nextQuestion.section !== q.section) {
      this.completedModuleTitle.set(getModuleMeta(q.section).title);
      this.showingModuleIntro.set(true);
      return;
    }
    this.startQuestionTimer();
  }

  private beginExam(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.examApi.startExam().subscribe({
      next: (res) => {
        this.loading.set(false);
        this.session.set(res.data);
        this.answers = [];
        this.currentIndex.set(0);
        this.completedModuleTitle.set('');
        this.showingModuleIntro.set(true);
        this.resetQuestionInputs();
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const parsed = parseHttpError(err, 'تعذر بدء الاختبار');
        if (parsed.status === 402) {
          void this.router.navigate(['/payment']);
          return;
        }
        this.errorMessage.set(parsed.message);
      }
    });
  }

  private submitAllAnswers(attemptId: string): void {
    this.submitting.set(true);
    this.examApi.submitExam(attemptId, this.answers).subscribe({
      next: (res) => {
        this.submitting.set(false);
        void this.router.navigate(['/result', res.data?.attemptId || attemptId]);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(parseHttpError(err, 'حدث خطأ أثناء تسليم الاختبار').message);
      }
    });
  }

  private buildAnswerPayload(q: StudentQuestion): ExamAnswerPayload {
    if (q.questionType === 'mcq') {
      return { questionId: q._id, selectedOptionKey: this.selectedOptionKey() || undefined };
    }
    if (q.questionType === 'memory_grid') {
      return { questionId: q._id, selectedCellIndex: this.selectedCellIndex() ?? undefined };
    }
    if (q.questionType === 'canvas_connect') {
      return { questionId: q._id, solved: this.canvasSolved() };
    }
    return { questionId: q._id, answer: this.textAnswer().trim() };
  }

  private resetQuestionInputs(): void {
    this.textAnswer.set('');
    this.selectedOptionKey.set('');
    this.selectedCellIndex.set(null);
    this.canvasSolved.set(false);
  }

  private startQuestionTimer(): void {
    this.clearTimer();
    const q = this.currentQuestion();
    if (!q) return;
    this.secondsLeft.set(q.timeLimitSeconds);
    this.timerId = setInterval(() => {
      const next = this.secondsLeft() - 1;
      this.secondsLeft.set(Math.max(0, next));
      if (next <= 0) {
        this.advanceQuestion();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
