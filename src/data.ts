/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, UserRole, RequestType, RequestStatus, MemoRequest, AuditLog, EmailNotification } from "./types";

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: "U001",
    name: "John Doe",
    role: UserRole.INITIATOR,
    designation: "Senior Associate, Corporate Finance",
    department: "Corporate Finance & Advisory",
    email: "john.doe@vetiva.com",
    signatureUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50'><path d='M10,25 Q30,10 50,30 T90,20 T130,25' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>"
  },
  {
    id: "U002",
    name: "Sarah Smith",
    role: UserRole.LINE_MANAGER,
    designation: "VP, Corporate Finance & Advisory Head",
    department: "Corporate Finance & Advisory",
    email: "sarah.smith@vetiva.com",
    signatureUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50'><path d='M15,30 Q35,5 55,35 T95,15 T135,28 M20,15 L120,38' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>"
  },
  {
    id: "U003",
    name: "David Vance",
    role: UserRole.INTERNAL_CONTROL,
    designation: "Chief Compliance & Internal Control Officer",
    department: "Internal Control & Compliance",
    email: "david.vance@vetiva.com",
    signatureUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50'><path d='M12,20 Q40,35 60,10 T100,30 T140,15' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>"
  },
  {
    id: "U004",
    name: "Elizabeth Taylor",
    role: UserRole.EXECUTIVE_DIRECTOR,
    designation: "Executive Director, Markets & Advisory",
    department: "Executive Suite",
    email: "elizabeth.taylor@vetiva.com",
    signatureUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50'><path d='M10,15 Q60,5 50,40 T110,25 T140,35 M5,42 L145,28' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>"
  },
  {
    id: "U005",
    name: "Michael Sterling",
    role: UserRole.FINANCE,
    designation: "CFO & Finance Operations Director",
    department: "Finance & Operations",
    email: "michael.sterling@vetiva.com",
    signatureUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50'><path d='M15,35 C30,35 40,15 50,15 C60,15 70,30 80,30 C90,30 110,15 130,25' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>"
  },
  {
    id: "U006",
    name: "Sophia Jenkins",
    role: UserRole.AUDITOR,
    designation: "Principal Internal Auditor",
    department: "Internal Audit & Risk",
    email: "sophia.jenkins@vetiva.com"
  }
];

export const INITIAL_MEMOS: MemoRequest[] = [
  {
    id: "MEMO-2026-0001",
    refNo: "VCM/2026/MEMO/1004",
    title: "Subscription for Bloomberg Terminal Licences Q3-Q4 2026",
    department: "Corporate Finance & Advisory",
    type: RequestType.MEMO,
    purpose: "Approval is sought to renew our subscription for Bloomberg Professional Services Terminals utilized by the research and corporate finance teams. Secure market data feeds are critical for Valuation models, trading analytics, and transaction comps.",
    amountRequested: 15400,
    priorityLevel: "High",
    vendorInfo: "Bloomberg Finance L.P. (New York Office)",
    paymentDetails: "Bloomberg LP, Citibank NY, Account No: *******8821, ABA: 021000021",
    dateCreated: "2026-06-12",
    status: RequestStatus.DRAFT,
    initiator: {
      name: "John Doe",
      email: "john.doe@vetiva.com",
      department: "Corporate Finance & Advisory"
    },
    currentWorkflowStep: 0,
    workflowSequence: [UserRole.LINE_MANAGER, UserRole.INTERNAL_CONTROL, UserRole.EXECUTIVE_DIRECTOR, UserRole.FINANCE],
    approvals: [],
    supportingDocs: [
      { name: "Bloomberg_Renewal_Invoice_#48721.pdf", size: "342 KB" },
      { name: "Usage_Analytics_CorporateFinance_2026.xlsx", size: "128 KB" }
    ],
    pendingClarificationFromInitiator: false
  },
  {
    id: "MEMO-2026-0002",
    refNo: "VCM/2026/MEMO/1001",
    title: "FGN Bond Auction Roadshow Logistics and Hotel Reservations",
    department: "Corporate Finance & Advisory",
    type: RequestType.MEMO,
    purpose: "Hotel room bookings, flights, and local transit transfers for the Vetiva 5-man advisory delegation attending the Debt Management Office (DMO) FGN Bond Roadshow in Abuja.",
    amountRequested: 2450,
    priorityLevel: "Medium",
    vendorInfo: "Transcorp Hilton Abuja & Max Air Nigeria",
    paymentDetails: "Vetiva Corporate Visa Card / Payee direct bank transfer",
    dateCreated: "2026-06-14",
    status: RequestStatus.PENDING,
    initiator: {
      name: "John Doe",
      email: "john.doe@vetiva.com",
      department: "Corporate Finance & Advisory"
    },
    currentWorkflowStep: 1, // At Line Manager
    workflowSequence: [UserRole.LINE_MANAGER, UserRole.INTERNAL_CONTROL, UserRole.EXECUTIVE_DIRECTOR, UserRole.FINANCE],
    approvals: [],
    supportingDocs: [
      { name: "Hilton_Accommodation_Quote.pdf", size: "1.1 MB" },
      { name: "Advisory_Delegation_Itinerary_Abuja.pdf", size: "85 KB" }
    ],
    pendingClarificationFromInitiator: false
  },
  {
    id: "MEMO-2026-0003",
    refNo: "VCM/2026/CADV/3001",
    title: "Due Diligence Site Inspection - GreenPower Solar Plant Project",
    department: "Asset Management",
    type: RequestType.CASH_ADVANCE,
    purpose: "Cash advance requested for fuel, site transit logistics, lodging, and stakeholder consultation meetings on-site in Enugu for physical verification of the 50MW GreenPower Solar project.",
    amountRequested: 1800,
    priorityLevel: "High",
    paymentDetails: "John Doe - Access Bank, Account No: 0023485122",
    dateCreated: "2026-06-10",
    status: RequestStatus.RELEASED, // Paid & Released in cash advance lifecycle
    initiator: {
      name: "John Doe",
      email: "john.doe@vetiva.com",
      department: "Asset Management"
    },
    currentWorkflowStep: 5, // Fully complete Cash Advance Process
    workflowSequence: [UserRole.LINE_MANAGER, UserRole.INTERNAL_CONTROL, UserRole.EXECUTIVE_DIRECTOR, UserRole.FINANCE],
    approvals: [
      {
        role: UserRole.LINE_MANAGER,
        approverName: "Sarah Smith",
        designation: "VP, Corporate Finance & Advisory Head",
        action: "Approve",
        comments: "Recommended for immediate site visit. Field due diligence is a critical condition precedent for asset onboarding.",
        date: "2026-06-11",
        time: "09:30 AM",
        signatureUrl: DEFAULT_USERS[1].signatureUrl
      },
      {
        role: UserRole.INTERNAL_CONTROL,
        approverName: "David Vance",
        designation: "Chief Compliance & Internal Control Officer",
        action: "Approve",
        comments: "Budget conforms to project advisory allocation code VCM-2026-SOL-09. Internal Control cleared.",
        date: "2026-06-11",
        time: "11:45 AM",
        signatureUrl: DEFAULT_USERS[2].signatureUrl
      },
      {
        role: UserRole.EXECUTIVE_DIRECTOR,
        approverName: "Elizabeth Taylor",
        designation: "Executive Director, Markets & Advisory",
        action: "Approve",
        comments: "Approved. Ensure clear ledger accounting and retire immediately after trip completion.",
        date: "2026-06-11",
        time: "02:15 PM",
        signatureUrl: DEFAULT_USERS[3].signatureUrl
      },
      {
        role: UserRole.FINANCE,
        approverName: "Michael Sterling",
        designation: "CFO & Finance Operations Director",
        action: "Approve",
        comments: "Disbursed. Account debited: Corporate Advisory Operational Float.",
        date: "2026-06-12",
        time: "10:00 AM",
        signatureUrl: DEFAULT_USERS[4].signatureUrl
      }
    ],
    periodCovered: "18-Jun-2026 to 21-Jun-2026",
    supportingDocs: [
      { name: "Field_Inspection_Agenda_Enugu.docx", size: "45 KB" }
    ],
    pendingClarificationFromInitiator: false,
    payment: {
      processedBy: "Michael Sterling",
      paymentRef: "PAY-2026-0819",
      paymentDate: "2026-06-12",
      paymentMethod: "Bank Transfer",
      amountPaid: 1800,
      beneficiary: "John Doe (Access Bank 0023485122)",
      budgetAvailable: true,
      remarks: "Fully disbursed in preparation for physical due diligence site visits."
    }
  },
  {
    id: "MEMO-2026-0004",
    refNo: "VCM/2026/MEMO/1002",
    title: "Regulatory Filing Fees - SEC Phase 2 Mutual Fund Registration",
    department: "Wealth Management",
    type: RequestType.MEMO,
    purpose: "Direct bank transfer to the SEC TSA Treasury account for registration, ledger listing, and administrative authorization fees for the new Vetiva ESG growth Mutual Fund.",
    amountRequested: 8500,
    priorityLevel: "High",
    vendorInfo: "Securities & Exchange Commission, Nigeria",
    paymentDetails: "SEC TSA Treasury Central Bank of Nigeria Account",
    dateCreated: "2026-06-08",
    status: RequestStatus.PAID,
    initiator: {
      name: "John Doe",
      email: "john.doe@vetiva.com",
      department: "Wealth Management"
    },
    currentWorkflowStep: 5, // Fully complete
    workflowSequence: [UserRole.LINE_MANAGER, UserRole.INTERNAL_CONTROL, UserRole.EXECUTIVE_DIRECTOR, UserRole.FINANCE],
    approvals: [
      {
        role: UserRole.LINE_MANAGER,
        approverName: "Sarah Smith",
        designation: "VP, Corporate Finance & Advisory Head",
        action: "Approve",
        comments: "Critical regulatory step. Highly recommended for payment execution.",
        date: "2026-06-08",
        time: "02:40 PM",
        signatureUrl: DEFAULT_USERS[1].signatureUrl
      },
      {
        role: UserRole.INTERNAL_CONTROL,
        approverName: "David Vance",
        designation: "Chief Compliance & Internal Control Officer",
        action: "Approve",
        comments: "Verified valid regulatory claim. Complies with SEC mutual fund framework rules.",
        date: "2026-06-09",
        time: "10:15 AM",
        signatureUrl: DEFAULT_USERS[2].signatureUrl
      },
      {
        role: UserRole.EXECUTIVE_DIRECTOR,
        approverName: "Elizabeth Taylor",
        designation: "Executive Director, Markets & Advisory",
        action: "Approve",
        comments: "Approved for direct release to the SEC TSA.",
        date: "2026-06-09",
        time: "03:50 PM",
        signatureUrl: DEFAULT_USERS[3].signatureUrl
      },
      {
        role: UserRole.FINANCE,
        approverName: "Michael Sterling",
        designation: "CFO & Finance Operations Director",
        action: "Approve",
        comments: "Processed transfer. Paid to Central Bank of Nigeria SEC Account.",
        date: "2026-06-10",
        time: "11:20 AM",
        signatureUrl: DEFAULT_USERS[4].signatureUrl
      }
    ],
    supportingDocs: [
      { name: "SEC_Mutual_Fund_Assessment_Form.pdf", size: "620 KB" }
    ],
    pendingClarificationFromInitiator: false,
    payment: {
      processedBy: "Michael Sterling",
      paymentRef: "PAY-2026-0775",
      paymentDate: "2026-06-10",
      paymentMethod: "Bank Transfer",
      amountPaid: 8500,
      beneficiary: "Securities & Exchange Commission, TSA CBN",
      budgetAvailable: true,
      remarks: "Direct TSA payment for mutual fund registration."
    }
  },
  {
    id: "MEMO-2026-0005",
    refNo: "VCM/2026/RET/4501",
    title: "Retirement: Lagos State Revenue Service Tax Audit Consultations",
    department: "Corporate Finance & Advisory",
    type: RequestType.RETIREMENT,
    purpose: "Retirement of the cash advance of 1,200 collected for stakeholder tax audit consultations. Travel, printing workpapers, and guest catering fees are catalogued below.",
    amountRequested: 1200,
    priorityLevel: "Medium",
    paymentDetails: "N/A - Cash retirement balancing",
    dateCreated: "2026-06-13",
    status: RequestStatus.SUBMITTED,
    initiator: {
      name: "John Doe",
      email: "john.doe@vetiva.com",
      department: "Corporate Finance & Advisory"
    },
    currentWorkflowStep: 2, // At Internal Control for review
    workflowSequence: [UserRole.LINE_MANAGER, UserRole.INTERNAL_CONTROL, UserRole.EXECUTIVE_DIRECTOR, UserRole.FINANCE],
    approvals: [
      {
        role: UserRole.LINE_MANAGER,
        approverName: "Sarah Smith",
        designation: "VP, Corporate Finance & Advisory Head",
        action: "Approve",
        comments: "Reviewed and confirmed receipts match expense list. Balance returned of 150 must be credited to Operations ledger.",
        date: "2026-06-14",
        time: "11:10 AM",
        signatureUrl: DEFAULT_USERS[1].signatureUrl
      }
    ],
    cashAdvanceRefNo: "VCM/2026/CADV/2899",
    amountCollected: 1200,
    amountUtilized: 1050,
    balanceReturned: 150,
    expenseBreakdown: [
      { id: "E01", category: "Transport & Logistics", amount: 450, description: "Local Uber cabs to LIRS secretariat, Alausa" },
      { id: "E02", category: "Catering & Protocol", amount: 400, description: "Working lunches during joint advisory sessions" },
      { id: "E03", category: "Secretarial & Binding", amount: 200, description: "Reprographics and binding for voluminous audit response dossier" }
    ],
    receiptsAttachmentName: "LIRS_Consultations_Receipts_Merged.pdf",
    pendingClarificationFromInitiator: false
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "LOG-001",
    user: "John Doe",
    role: UserRole.INITIATOR,
    action: "CREATED Mutual Fund Fee Memo",
    date: "2026-06-08",
    time: "10:30 AM",
    ipAddress: "192.168.10.22",
    memoRef: "VCM/2026/MEMO/1002"
  },
  {
    id: "LOG-002",
    user: "Sarah Smith",
    role: UserRole.LINE_MANAGER,
    action: "APPROVED Mutual Fund Fee Memo",
    date: "2026-06-08",
    time: "02:40 PM",
    ipAddress: "192.168.10.45",
    memoRef: "VCM/2026/MEMO/1002"
  },
  {
    id: "LOG-003",
    user: "David Vance",
    role: UserRole.INTERNAL_CONTROL,
    action: "APPROVED Mutual Fund Fee Memo",
    date: "2026-06-09",
    time: "10:15 AM",
    ipAddress: "192.168.10.12",
    memoRef: "VCM/2026/MEMO/1002"
  },
  {
    id: "LOG-004",
    user: "Elizabeth Taylor",
    role: UserRole.EXECUTIVE_DIRECTOR,
    action: "APPROVED Mutual Fund Fee Memo",
    date: "2026-06-09",
    time: "03:50 PM",
    ipAddress: "192.168.12.3",
    memoRef: "VCM/2026/MEMO/1002"
  },
  {
    id: "LOG-005",
    user: "Michael Sterling",
    role: UserRole.FINANCE,
    action: "PROCESSED PAYMENT Mutual Fund Fee Memo",
    date: "2026-06-10",
    time: "11:20 AM",
    ipAddress: "192.168.10.6",
    memoRef: "VCM/2026/MEMO/1002"
  },
  {
    id: "LOG-006",
    user: "John Doe",
    role: UserRole.INITIATOR,
    action: "CREATED Due Diligence Site Trip Advance",
    date: "2026-06-10",
    time: "11:30 AM",
    ipAddress: "192.168.10.22",
    memoRef: "VCM/2026/CADV/3001"
  }
];

export const INITIAL_NOTIFICATIONS: EmailNotification[] = [
  {
    id: "N01",
    to: "sarah.smith@vetiva.com",
    subject: "Action Required: Memo Awaiting approval [VCM/2026/MEMO/1001]",
    body: "An Internal Memo for 'FGN Bond Auction Roadshow Logistics and Hotel Reservations' has been submitted by John Doe and is awaiting your review as Line Manager.",
    date: "2026-06-14",
    time: "02:00 PM",
    read: false,
    memosRef: "VCM/2026/MEMO/1001"
  },
  {
    id: "N02",
    to: "john.doe@vetiva.com",
    subject: "Payment Disbursed: SEC Phase 2 Mutual Fund Fees [VCM/2026/MEMO/1002]",
    body: "Funds for SEC Mutual Fund Registration Fees (Amount: 8,500) have been successfully processed and paid via Bank Transfer by Finance.",
    date: "2026-06-10",
    time: "11:20 AM",
    read: true,
    memosRef: "VCM/2026/MEMO/1002"
  }
];

// Local Storage Sync Helpers
const MEMOS_KEY = "vetiva_approval_memos";
const AUDIT_LOG_KEY = "vetiva_approval_audit_logs";
const NOTIFICATIONS_KEY = "vetiva_approval_notifications";
const SIGNATURES_KEYS = "vetiva_user_signatures";

export function loadStoredData() {
  const memosParsed = localStorage.getItem(MEMOS_KEY);
  const auditParsed = localStorage.getItem(AUDIT_LOG_KEY);
  const notifParsed = localStorage.getItem(NOTIFICATIONS_KEY);
  
  // Custom user signature maps
  const signaturesParsed = localStorage.getItem(SIGNATURES_KEYS);
  let savedSignatures: Record<string, string> = {};
  if (signaturesParsed) {
    try {
      savedSignatures = JSON.parse(signaturesParsed);
    } catch (e) {
      console.error(e);
    }
  }

  // Inject loaded user signatures into default user list if they exist in localStorage
  const usersWithSigs = DEFAULT_USERS.map(user => {
    if (savedSignatures[user.id]) {
      return { ...user, signatureUrl: savedSignatures[user.id] };
    }
    return user;
  });

  return {
    memos: memosParsed ? JSON.parse(memosParsed) : INITIAL_MEMOS,
    auditLogs: auditParsed ? JSON.parse(auditParsed) : INITIAL_AUDIT_LOGS,
    notifications: notifParsed ? JSON.parse(notifParsed) : INITIAL_NOTIFICATIONS,
    users: usersWithSigs
  };
}

export function saveStoredData(memos: MemoRequest[], auditLogs: AuditLog[], notifications: EmailNotification[], users: UserProfile[]) {
  localStorage.setItem(MEMOS_KEY, JSON.stringify(memos));
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(auditLogs));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  
  // Save custom user signatures specifically
  const signaturesMap: Record<string, string> = {};
  users.forEach(u => {
    if (u.signatureUrl) {
      signaturesMap[u.id] = u.signatureUrl;
    }
  });
  localStorage.setItem(SIGNATURES_KEYS, JSON.stringify(signaturesMap));
}
