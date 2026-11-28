import { GrantSummary } from './exam.model';

export type PaymentMethod = 'instapay';

export interface PaymentInfo {
  instapayHandle: string;
  instapayPhone: string;
  whatsappNumber: string;
  baseExamPrice: number;
  retakeMultiplier: number;
  retakePrice: number;
}

export interface NomineeInput {
  name: string;
  phone: string;
}

export interface PaymentRecord {
  _id: string;
  buyerUserId?: string | { _id: string; name: string; phone: string };
  paymentType: 'self_purchase' | 'bulk_purchase';
  expectedAmount: number;
  detectedAmount: number;
  method: PaymentMethod;
  referenceId?: string;
  isLikelyAuthentic: boolean;
  aiConfidence: number;
  aiReason: string;
  status: 'verified' | 'rejected';
  createdAt: string;
}

export interface PaymentVerifySelfResponse {
  payment: PaymentRecord;
  grant: GrantSummary;
}

export interface PaymentVerifyBulkResponse {
  payment: PaymentRecord;
  grants: GrantSummary[];
}

export interface PaymentFailureInfo {
  message: string;
  reason?: string;
  whatsappUrl?: string;
}
