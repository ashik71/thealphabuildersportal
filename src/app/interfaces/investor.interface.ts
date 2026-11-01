export type InvestorStatus = 'active' | 'inactive';

export interface Investor {
  _id: string;
  Name: string;
  Email?: string;
  Phone: string;
  Notes?: string;
  Status: InvestorStatus;
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
