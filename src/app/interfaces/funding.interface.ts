import { Shareholder } from './shareholder.interface';
import { CostCategory } from './expense.interface';

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
  CostCategoryId?: CostCategory | string | null;
  SubCategoryId?: CostCategory | string | null;
  AmountPaid: number;
  Date?: string;
  Notes?: string;
  createdAt?: string;
}

export interface PaymentInput {
  ProjectId: string;
  ShareholderId: string;
  CostCategoryId?: string | null;
  SubCategoryId?: string | null;
  AmountPaid: number;
  Notes?: string;
}

export interface ShareholderCategorySpend {
  CategoryId: string | null;
  CategoryName: string;
  SubCategoryId: string | null;
  SubCategoryName: string | null;
  Amount: number;
}

export interface ShareholderFunding {
  ShareholderId: string;
  CommitmentId: string | null;
  ShareholderName: string | null;
  Committed: number;
  Paid: number;
  Remaining: number;
  Categories: ShareholderCategorySpend[];
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

export interface ShareholderViewLinkResponse {
  url: string;
  expiresAt: string;
}

export interface ShareholderViewCategorySpend {
  CategoryName: string;
  SubCategoryName: string | null;
  Amount: number;
}

export interface ShareholderView {
  ProjectName: string;
  ProjectLocation?: string;
  ProjectStatus: string;
  ShareholderName: string;
  Committed: number;
  Paid: number;
  Remaining: number;
  Categories: ShareholderViewCategorySpend[];
}
