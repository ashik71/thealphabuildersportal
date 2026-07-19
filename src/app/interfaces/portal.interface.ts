/**
 * Shapes returned by /api/me — the shareholder-scoped API.
 *
 * These deliberately carry only the signed-in shareholder's own figures. No
 * project totals, expenses, or other shareholders appear here, because the
 * server never sends them.
 */

export interface PortalSummary {
  ProjectCount: number;
  Committed: number;
  Paid: number;
  Remaining: number;
}

export interface PortalProject {
  ProjectId: string;
  Name: string;
  Location?: string;
  Status: string;
  StartDate?: string;
  EndDate?: string;
  Committed: number;
  Paid: number;
  Remaining: number;
}

export interface PortalPayment {
  PaymentId: string;
  Amount: number;
  Date: string;
  CategoryName: string | null;
  SubCategoryName: string | null;
  Notes?: string;
}

export interface PortalProjectDetail extends PortalProject {
  Summary?: string;
  Notes?: string;
  Payments: PortalPayment[];
}
