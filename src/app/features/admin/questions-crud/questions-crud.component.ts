import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AdminQuestion,
  InputConstraint,
  QuestionOption,
  QuestionPayload,
  QuestionType
} from '../../../core/models/question.model';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { parseHttpError } from '../../../core/utils/http-error.util';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-questions-crud',
  imports: [ReactiveFormsModule, AlertBannerComponent, LoadingSpinnerComponent],
  templateUrl: './questions-crud.component.html',
  styleUrl: './questions-crud.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionsCrudComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminApi = inject(AdminApiService);

  readonly questions = this.adminApi.questions;
  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);
  readonly uploading = signal<boolean>(false);
  readonly sectionFilter = signal<number>(0);
  readonly editingId = signal<string | null>(null);
  readonly editingOptions = signal<QuestionOption[]>([]);
  readonly successMessage = signal<string>('');
  readonly errorMessage = signal<string>('');

  readonly filteredQuestions = computed<AdminQuestion[]>(() => {
    const sec = this.sectionFilter();
    const list = this.questions();
    return sec === 0 ? list : list.filter((q) => q.section === sec);
  });

  readonly form = this.fb.nonNullable.group({
    section: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
    sectionTitle: ['المهارات والتركيز والذاكرة البصرية', [Validators.required]],
    order: [1, [Validators.required, Validators.min(1)]],
    prompt: ['', [Validators.required]],
    imageUrl: [''],
    questionType: ['text' as QuestionType, [Validators.required]],
    inputConstraint: ['any' as InputConstraint, [Validators.required]],
    timeLimitSeconds: [15, [Validators.required, Validators.min(1)]],
    points: [2, [Validators.required, Validators.min(0)]],
    acceptedAnswersText: [''],
    isActive: [true],
    adminNote: ['']
  });

  ngOnInit(): void {
    this.reloadQuestions();
  }

  reloadQuestions(): void {
    this.loading.set(true);
    this.adminApi.loadQuestions().subscribe({
      next: () => this.loading.set(false),
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(parseHttpError(err, 'تعذر تحميل الأسئلة').message);
      }
    });
  }

  setFilter(section: number): void {
    this.sectionFilter.set(section);
  }

  startEdit(q: AdminQuestion): void {
    this.editingId.set(q._id);
    this.editingOptions.set(q.options.map((opt) => ({ ...opt })));
    this.form.patchValue({
      section: q.section,
      sectionTitle: q.sectionTitle,
      order: q.order,
      prompt: q.prompt,
      imageUrl: q.imageUrl ?? '',
      questionType: q.questionType,
      inputConstraint: q.inputConstraint,
      timeLimitSeconds: q.timeLimitSeconds,
      points: q.points,
      acceptedAnswersText: q.acceptedAnswers.join('\n'),
      isActive: q.isActive,
      adminNote: q.adminNote
    });
    this.clearFeedback();
  }

  resetEditor(): void {
    this.editingId.set(null);
    this.editingOptions.set([]);
    this.form.reset({
      section: 1,
      sectionTitle: 'المهارات والتركيز والذاكرة البصرية',
      order: 1,
      prompt: '',
      imageUrl: '',
      questionType: 'text',
      inputConstraint: 'any',
      timeLimitSeconds: 15,
      points: 2,
      acceptedAnswersText: '',
      isActive: true,
      adminNote: ''
    });
  }

  addOption(): void {
    const idx = this.editingOptions().length + 1;
    this.editingOptions.update((opts) => [
      ...opts,
      { key: `opt_${idx}`, label: '', isCorrect: false, traitImpacts: [] }
    ]);
  }

  updateOption(index: number, field: 'key' | 'label' | 'isCorrect', event: Event): void {
    const target = event.target as HTMLInputElement;
    this.editingOptions.update((opts) =>
      opts.map((opt, i) => {
        if (i !== index) return opt;
        if (field === 'isCorrect') return { ...opt, isCorrect: target.checked };
        return { ...opt, [field]: target.value };
      })
    );
  }

  removeOption(index: number): void {
    this.editingOptions.update((opts) => opts.filter((_, i) => i !== index));
  }

  onImageFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.clearFeedback();
    this.adminApi.uploadQuestionImage(file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.form.patchValue({ imageUrl: res.data.imageUrl });
        this.successMessage.set('تم رفع صورة السؤال بنجاح.');
      },
      error: (err: unknown) => {
        this.uploading.set(false);
        this.errorMessage.set(parseHttpError(err, 'تعذر رفع الصورة').message);
      }
    });
  }

  saveQuestion(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.clearFeedback();
    const payload = this.buildPayload();
    const id = this.editingId();
    const req$ = id
      ? this.adminApi.updateQuestion(id, payload)
      : this.adminApi.createQuestion(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set(id ? 'تم تحديث السؤال بنجاح.' : 'تمت إضافة السؤال بنجاح.');
        this.resetEditor();
        this.reloadQuestions();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorMessage.set(parseHttpError(err, 'تعذر حفظ السؤال').message);
      }
    });
  }

  toggleActive(q: AdminQuestion): void {
    this.clearFeedback();
    this.adminApi.updateQuestion(q._id, { isActive: !q.isActive }).subscribe({
      next: () => {
        this.successMessage.set(`تم ${!q.isActive ? 'تفعيل' : 'تعطيل'} السؤال بنجاح.`);
        this.reloadQuestions();
      },
      error: (err: unknown) => {
        this.errorMessage.set(parseHttpError(err, 'تعذر تغيير حالة السؤال').message);
      }
    });
  }

  deleteQuestion(id: string): void {
    this.clearFeedback();
    this.adminApi.deleteQuestion(id).subscribe({
      next: () => {
        this.successMessage.set('تم حذف السؤال.');
        this.reloadQuestions();
      },
      error: (err: unknown) => {
        this.errorMessage.set(parseHttpError(err, 'تعذر حذف السؤال').message);
      }
    });
  }

  private buildPayload(): QuestionPayload {
    const raw = this.form.getRawValue();
    const acceptedAnswers = raw.acceptedAnswersText
      .split(/[\n,،]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return {
      section: Number(raw.section),
      sectionTitle: raw.sectionTitle.trim(),
      order: Number(raw.order),
      prompt: raw.prompt.trim(),
      imageUrl: raw.imageUrl.trim() || null,
      questionType: raw.questionType,
      inputConstraint: raw.inputConstraint,
      timeLimitSeconds: Number(raw.timeLimitSeconds),
      points: Number(raw.points),
      acceptedAnswers,
      options: this.editingOptions().filter((o) => o.key.trim() && o.label.trim()),
      isActive: raw.isActive,
      adminNote: raw.adminNote.trim()
    };
  }

  private clearFeedback(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}
