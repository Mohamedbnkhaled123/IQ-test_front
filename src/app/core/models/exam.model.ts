import { StudentQuestion } from './question.model';
import { UserProfile } from './user.model';

export type GrantSource =
  | 'self_purchase'
  | 'user_purchase'
  | 'admin_complimentary'
  | 'manual_admin';

export type GrantStatus = 'available' | 'in_use' | 'consumed';

export interface ExamAnswerPayload {
  questionId: string;
  answer?: string;
  selectedOptionKey?: string;
  selectedCellIndex?: number;
  solved?: boolean;
}

export interface StartExamResponse {
  attemptId: string;
  grantId: string;
  startedAt: string;
  examTitle: string;
  questions: StudentQuestion[];
}

export interface SubmitExamResponse {
  attemptId: string;
}

export interface SectionScore {
  earned: number;
  max: number;
}

export interface SectionScoresMap {
  section1: SectionScore;
  section2: SectionScore;
  section3: SectionScore;
}

export interface PersonalityTrait {
  traitName: string;
  traitValue: string;
}

export interface ExamResult {
  attemptId: string;
  examineeName: string;
  attemptNumber: number;
  submittedAt: string;
  sectionScores: SectionScoresMap;
  rawScore: number;
  maxScore: number;
  iqScore: number;
  iqClassification: string;
  personalityProfile: PersonalityTrait[];
}

export interface GrantSummary {
  _id: string;
  nomineeName: string;
  nomineePhone: string;
  source: GrantSource;
  amountPaid: number;
  status: GrantStatus;
  attemptId?: string | null;
  attempt?: ExamResult | null;
  consumedAt?: string | null;
  createdAt: string;
}

export interface DashboardData {
  user: UserProfile;
  hasAvailableGrant: boolean;
  availableGrant: GrantSummary | null;
  nextAttemptPrice: number;
  baseExamPrice: number;
  retakePrice: number;
  myAttempts: ExamResult[];
  purchasedGrants: GrantSummary[];
}
