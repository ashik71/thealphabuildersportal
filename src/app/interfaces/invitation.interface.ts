export type InviteExpiryHours = 24 | 48 | 72;

export interface Invitation {
  _id: string;
  Email: string;
  ShareholderId: { _id: string; Name: string; Email?: string } | string;
  ExpiresAt: string;
  AcceptedAt: string | null;
  RevokedAt: string | null;
  createdAt: string;
}

export interface InvitationCreated {
  message: string;
  emailSent: boolean;
  /** Shown once at creation — the raw token is never stored, so it cannot be re-fetched. */
  inviteUrl: string;
  expiresAt: string;
}

/** What the public accept page is allowed to know before an account exists. */
export interface InvitationPreview {
  email: string;
  shareholderName: string | null;
  expiresAt: string;
}
