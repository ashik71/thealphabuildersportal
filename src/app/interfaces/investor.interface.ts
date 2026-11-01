export type InvestorStatus = 'active' | 'inactive';
export type InvestorProjectStatus = 'pending' | 'paid' | 'overdue';
export type InvestorPaymentMethod = 'Bank' | 'Mobile Banking' | 'Cash';

export interface InvestorProjectSummary {
  ProjectId: string;
  ProjectName: string;
}

export interface InvestorProject {
  _id: string;
  InvestorId: string;
  ProjectId: string | { _id: string; Name: string };
  Amount: number;
  DurationMonths: number;
  Paid: number;
  Due: number;
  ProfitMargin: number;
  Deadline: string;
  PaymentMethod?: InvestorPaymentMethod;
  Notes?: string;
  Status: InvestorProjectStatus;
}

export interface InvestorProjectInput {
  InvestorId: string;
  ProjectId: string;
  Amount: number;
  DurationMonths: number;
  ProfitMargin: number;
  Deadline: string;
  Notes?: string;
  Status: InvestorProjectStatus;
}

export interface InvestorPaymentInput {
  Amount: number;
  PaymentMethod: InvestorPaymentMethod;
  Notes?: string;
}

export interface Investor {
  _id: string;
  Name: string;
  Email?: string;
  Phone: string;
  Notes?: string;
  Status: InvestorStatus;
  Projects?: InvestorProjectSummary[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestorInput {
  Name: string;
  Email?: string;
  Phone: string;
  Notes?: string;
  Status: InvestorStatus;
}
