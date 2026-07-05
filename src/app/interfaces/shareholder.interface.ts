export interface Shareholder {
  _id: string;
  Name: string;
  Phone?: string;
  Email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShareholderInput {
  Name: string;
  Phone?: string;
  Email?: string;
}
