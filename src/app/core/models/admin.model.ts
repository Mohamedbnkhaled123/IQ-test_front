import { ExamResult, GrantSummary } from './exam.model';
import { PaymentRecord } from './payment.model';
import { UserProfile } from './user.model';

export interface IqBands {
  lowMax: number;
  averageMax: number;
}

export interface PlatformSettings {
  _id?: string;
  examTitle: string;
  baseExamPrice: number;
  retakeMultiplier: number;
  iqScaleMin: number;
  iqScaleMax: number;
  iqBands: IqBands;
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalAttempts: number;
  availableGrants: number;
  totalPayments: number;
  totalRevenue: number;
}

export interface AdminOverview {
  stats: AdminOverviewStats;
  settings: PlatformSettings;
  users: UserProfile[];
  attempts: ExamResult[];
  grants: GrantSummary[];
  payments: PaymentRecord[];
}

export interface CreateGrantPayload {
  nomineeName: string;
  nomineePhone: string;
  source: 'admin_complimentary' | 'manual_admin';
  amountPaid?: number;
}

export interface UploadedImageResponse {
  imageUrl: string;
}
