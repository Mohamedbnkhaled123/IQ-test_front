import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-memory-grid',
  templateUrl: './memory-grid.component.html',
  styleUrl: './memory-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemoryGridComponent {
  readonly rows = input<number>(2);
  readonly cols = input<number>(3);
  readonly selectedCellIndex = input<number | null>(null);
  readonly cellSelected = output<number>();

  readonly cellIndices = computed<number[]>(() => {
    const total = this.rows() * this.cols();
    return Array.from({ length: total }, (_, idx) => idx);
  });

  selectCell(index: number): void {
    this.cellSelected.emit(index);
  }
}
