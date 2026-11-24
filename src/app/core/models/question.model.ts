export type QuestionType =
  | 'mcq'
  | 'text'
  | 'memory_preview'
  | 'memory_grid'
  | 'canvas_connect';

export type InputConstraint = 'any' | 'numbers_only' | 'letters_only';

export type TraitPriority = 'primary' | 'fallback';

export interface TraitImpact {
  traitName: string;
  traitValue: string;
  priority: TraitPriority;
}

export interface QuestionOption {
  key: string;
  label: string;
  isCorrect?: boolean;
  traitImpacts?: TraitImpact[];
}

export interface GridConfig {
  rows: number;
  cols: number;
  correctCellIndex?: number | null;
}

export interface CanvasConfig {
  colors: string[];
  requiredPairs: number;
}

export interface StudentQuestion {
  _id: string;
  section: number;
  sectionTitle: string;
  order: number;
  prompt: string;
  imageUrl: string | null;
  questionType: QuestionType;
  inputConstraint: InputConstraint;
  timeLimitSeconds: number;
  points: number;
  options: QuestionOption[];
  gridConfig?: GridConfig | null;
  canvasConfig?: CanvasConfig | null;
}

export interface AdminQuestion extends StudentQuestion {
  acceptedAnswers: string[];
  isActive: boolean;
  adminNote: string;
}

export interface QuestionPayload {
  section: number;
  sectionTitle: string;
  order: number;
  prompt: string;
  imageUrl: string | null;
  questionType: QuestionType;
  inputConstraint: InputConstraint;
  timeLimitSeconds: number;
  points: number;
  acceptedAnswers: string[];
  options: QuestionOption[];
  gridConfig?: GridConfig;
  canvasConfig?: CanvasConfig;
  isActive: boolean;
  adminNote: string;
}
