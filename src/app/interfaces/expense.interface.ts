export interface CostCategory {
  _id: string;
  Name: string;
  ParentCategoryId?: string | null;
  Description?: string;
}

export interface Expense {
  _id: string;
  ProjectId: string;
  CostCategoryId: string;
  SubCategoryId?: string | null;
  Description?: string;
  Amount: number;
  Date?: string;
  PaidTo?: string;
  Notes?: string;
}

export interface ExpenseInput {
  ProjectId: string;
  CostCategoryId: string;
  SubCategoryId?: string | null;
  Description?: string;
  Amount: number;
  PaidTo?: string;
  Notes?: string;
}
