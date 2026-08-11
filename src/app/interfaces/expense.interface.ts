export interface CostCategory {
  _id: string;
  Name: string;
  ParentCategoryId?: string | null;
  Description?: string;
}

export interface CostCategoryInput {
  Name: string;
  ParentCategoryId?: string | null;
  Description?: string;
}

export interface Expense {
  _id: string;
  ProjectId: string;
  CostCategoryId: CostCategory | string;
  SubCategoryId?: CostCategory | string | null;
  Description?: string;
  Amount: number;
  Date?: string;
  PaidTo?: string;
  Notes?: string;
  IsDeleted?: boolean;
  DeletedAt?: string | null;
  /** True if this expense was split across shareholders (has ExpenseShare records). */
  HasShares?: boolean;
  /** True if HasShares and every share was marked paid. */
  SharesArePaid?: boolean;
}

export interface ExpenseInput {
  ProjectId: string;
  CostCategoryId: string;
  SubCategoryId?: string | null;
  Description?: string;
  Amount: number;
  PaidTo?: string;
  Notes?: string;
  /** Splits Amount equally across every shareholder committed to this project. */
  SplitAmongShareholders?: boolean;
  /** Only meaningful alongside SplitAmongShareholders — records each share as already paid. */
  MarkSharesPaid?: boolean;
}
