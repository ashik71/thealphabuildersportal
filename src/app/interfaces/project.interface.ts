export type ProjectStatus = 'planned' | 'in-progress' | 'completed' | 'on-hold';

export interface Project {
  _id: string;
  Name: string;
  Location?: string;
  Summary?: string;
  EstimatedCost: number;
  ActualCost: number;
  StartDate?: string;
  EndDate?: string;
  Status: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectInput {
  Name: string;
  Location?: string;
  Summary?: string;
  EstimatedCost?: number;
  StartDate?: string;
  EndDate?: string;
  Status?: ProjectStatus;
}

export interface CostBreakdownItem {
  CategoryId: string;
  CategoryName: string;
  SubcategoryId: string | null;
  SubcategoryName: string | null;
  EstimatedCost: number;
  ActualCost: number;
}

export interface ProjectCostReport {
  _id: string;
  ProjectId: string;
  Summary: {
    EstimatedTotal: number;
    ActualTotal: number;
    Difference: number;
  };
  Breakdown: CostBreakdownItem[];
  GeneratedAt: string;
}

export interface ViewLinkResponse {
  url: string;
  expiresAt: string;
}
