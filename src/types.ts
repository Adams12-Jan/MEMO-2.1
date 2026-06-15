/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum RequestType {
  MEMO = "Internal Memo",
  CASH_ADVANCE = "Cash Advance Request",
  RETIREMENT = "Cash Advance Retirement",
}

export enum RequestStatus {
  DRAFT = "Draft",
  PENDING = "Pending Approval",
  CLARIFICATION = "Clarification Required",
  CORRECTION = "Returned for Correction",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  
  // Finance specific:
  PAID = "Paid",
  RELEASED = "CASH ADVANCE RELEASED",
  COMPLETED = "Completed",
  
  // Retirement specific:
  SUBMITTED = "Submitted",
  UNDER_REVIEW = "Under Review",
  CLOSED = "Closed",
}

export enum UserRole {
  INITIATOR = "Initiator",
  LINE_MANAGER = "Line Manager",
  INTERNAL_CONTROL = "Internal Control Officer",
  EXECUTIVE_DIRECTOR = "Executive Director",
  FINANCE = "Finance Unit",
  AUDITOR = "Audit Officer",
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  department: string;
  email: string;
  signatureUrl?: string; // base64 or placeholder url
}

export interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  description: string;
}

export interface WorkflowApproval {
  role: UserRole;
  approverName: string;
  designation: string;
  action: "Approve" | "Reject" | "Request Clarification" | "Returned for Correction" | "Respond";
  comments: string;
  date: string;
  time: string;
  signatureUrl?: string; // e-signature placed
}

export interface PaymentDetails {
  processedBy: string;
  paymentRef: string;
  paymentDate: string;
  paymentMethod: "Bank Transfer" | "Cash" | "Cheque";
  amountPaid: number;
  beneficiary: string;
  budgetAvailable: boolean;
  paymentEvidenceName?: string;
  remarks?: string;
}

export interface MemoRequest {
  id: string; // Document ID (MEMO-YYYY-XXXX)
  refNo: string; // Auto-generated
  title: string;
  department: string;
  type: RequestType;
  purpose: string;
  amountRequested: number;
  amountApproved?: number;
  vendorInfo?: string;
  paymentDetails: string; // Initiator's bank/remittance details
  dateCreated: string;
  priorityLevel: "Low" | "Medium" | "High";
  status: RequestStatus;
  initiator: {
    name: string;
    email: string;
    department: string;
  };
  
  // Sequence tracker:
  // 0 = Draft, 1 = Line Manager, 2 = Internal Control, 3 = Executive Director, 4 = Finance Unit, 5 = Approved/Completed
  currentWorkflowStep: number;
  workflowSequence: UserRole[];
  
  // Approval history
  approvals: WorkflowApproval[];
  
  // Attachments
  supportingDocs?: { name: string; size: string }[];
  
  // Clarification state
  pendingClarificationFromInitiator: boolean;
  clarificationRequestBy?: UserRole;
  clarificationQuestion?: string;
  clarificationResponse?: string;
  
  // Cash Advance / Retirement specific fields:
  periodCovered?: string; // e.g., "15-Jun-2026 to 22-Jun-2026"
  cashAdvanceRefNo?: string; // ties retirement to cash advance
  amountCollected?: number;
  amountUtilized?: number;
  balanceReturned?: number;
  expenseBreakdown?: ExpenseItem[];
  receiptsAttachmentName?: string;
  
  // Finance processing
  payment?: PaymentDetails;
}

export interface AuditLog {
  id: string;
  user: string;
  role: UserRole;
  action: string;
  date: string;
  time: string;
  ipAddress: string;
  memoRef: string;
}

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  time: string;
  read: boolean;
  memosRef: string;
}
