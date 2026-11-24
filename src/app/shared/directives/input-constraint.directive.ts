import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';
import { InputConstraint } from '../../core/models/question.model';

@Directive({
  selector: '[appInputConstraint]'
})
export class InputConstraintDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  readonly constraint = input<InputConstraint>('any', { alias: 'appInputConstraint' });

  @HostListener('input')
  onInput(): void {
    const mode = this.constraint();
    if (mode === 'any') {
      return;
    }
    const inputEl = this.elementRef.nativeElement;
    const filtered = this.filterValue(inputEl.value, mode);
    if (filtered !== inputEl.value) {
      inputEl.value = filtered;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  private filterValue(value: string, mode: InputConstraint): string {
    if (mode === 'numbers_only') {
      return value.replace(/[^0-9\u0660-\u0669\u06F0-\u06F9]/g, '');
    }
    if (mode === 'letters_only') {
      return value.replace(/[0-9\u0660-\u0669\u06F0-\u06F9]/g, '');
    }
    return value;
  }
}
