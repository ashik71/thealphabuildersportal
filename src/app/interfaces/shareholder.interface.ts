export interface ShareholderProject {
  ProjectId: string;
  ProjectName: string;
}

export interface Shareholder {
  _id: string;
  Name: string;
  Phone?: string;
  Email?: string;
  Projects?: ShareholderProject[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ShareholderInput {
  Name: string;
  Phone?: string;
  Email?: string;
}
