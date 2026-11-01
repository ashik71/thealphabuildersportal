export type InvestorStatus = 'active' | 'inactive';

export interface Investor {
  _id: string;
  Name: string;
  Email?: string;
  Phone: string;
  InvestmentAmount: number;
  Status: InvestorStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestorInput {
  Name: string;
  Email: string;
  Phone: string;
  InvestmentAmount: number;
  Status: InvestorStatus;
}
