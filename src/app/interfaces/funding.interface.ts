import { Shareholder } from './shareholder.interface';

export interface Commitment {
  _id: string;
  ProjectId: string;
  ShareholderId: Shareholder | string;
  CommittedAmount: number;
  Notes?: string;
  createdAt?: string;
}

export interface CommitmentInput {
  ProjectId: string;
  ShareholderId: string;
  CommittedAmount: number;
  Notes?: string;
}

export interface Payment {
  _id: string;
  ProjectId: string;
  ShareholderId: Shareholder | string;
  CostCategoryId?: string | null;
  AmountPaid: number;
  Date?: string;
  Notes?: string;
  createdAt?: string;
}

export interface PaymentInput {
  ProjectId: string;
  ShareholderId: string;
  AmountPaid: number;
  Notes?: string;
}

export interface ShareholderFunding {
  ShareholderId: string;
  ShareholderName: string | null;
  Committed: number;
  Paid: number;
  Remaining: number;
}

export interface ProjectFunding {
  ProjectId: string;
  Shareholders: ShareholderFunding[];
  Totals: {
    Committed: number;
    Paid: number;
    Remaining: number;
  };
}
