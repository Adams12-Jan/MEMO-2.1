/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  FileText,
  Users,
  ShieldCheck,
  CreditCard,
  Layers,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  Inbox,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  Printer,
  Coins,
  Send,
  Lock,
  Download,
  Check,
  UserCheck
} from "lucide-react";
import {
  RequestType,
  RequestStatus,
  UserRole,
  UserProfile,
  MemoRequest,
  AuditLog,
  EmailNotification,
  ExpenseItem,
  WorkflowApproval,
  PaymentDetails
} from "./types";
import { loadStoredData, saveStoredData, DEFAULT_USERS } from "./data";
import SignaturePad from "./components/SignaturePad";
import NotificationCenter from "./components/NotificationCenter";
import MemoForm from "./components/MemoForm";
import AuditTrailPanel from "./components/AuditTrailPanel";
import ReportsPanel from "./components/ReportsPanel";

export default function App() {
  // --- Persistent State Hooks ---
  const [users, setUsers] = useState<UserProfile[]>(DEFAULT_USERS);
  const [memos, setMemos] = useState<MemoRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  
  // Active Simulated Session Profile
  const [activeUserIdx, setActiveUserIdx] = useState<number>(0);
  const activeUser = users[activeUserIdx];

  // System Active Tab
  const [activeTab, setActiveTab] = useState<"dashboard" | "reports" | "audit">("dashboard");

  // Selection Desk State
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);
  const [isCreatingMemo, setIsCreatingMemo] = useState(false);
  const [editingMemo, setEditingMemo] = useState<MemoRequest | null>(null);

  // Global search filters
  const [searchDocId, setSearchDocId] = useState("");
  const [searchDept, setSearchDept] = useState("All");
  const [searchStatus, setSearchStatus] = useState("All");

  // Approval Form Local States
  const [approvalComment, setApprovalComment] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  // Clarification Forms
  const [clarificationQueryText, setClarificationQueryText] = useState("");
  const [clarificationResponseText, setClarificationResponseText] = useState("");

  // Finance form states
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Bank Transfer" | "Cash" | "Cheque">("Bank Transfer");
  const [budgetAvailable, setBudgetAvailable] = useState(true);
  const [payeeDetails, setPayeeDetails] = useState("");
  const [financeRemarks, setFinanceRemarks] = useState("");
  const [evidenceFileName, setEvidenceFileName] = useState("");

  // Load state from local storage on bootstrap
  useEffect(() => {
    const data = loadStoredData();
    setMemos(data.memos);
    setAuditLogs(data.auditLogs);
    setNotifications(data.notifications);
    setUsers(data.users);
  }, []);

  // Sync state changes with localStorage
  const syncAndSetState = (
    updatedMemos: MemoRequest[],
    updatedLogs: AuditLog[],
    updatedNotifs: EmailNotification[],
    updatedUsersList = users
  ) => {
    setMemos(updatedMemos);
    setAuditLogs(updatedLogs);
    setNotifications(updatedNotifs);
    setUsers(updatedUsersList);
    saveStoredData(updatedMemos, updatedLogs, updatedNotifs, updatedUsersList);
  };

  // --- Core Simulated Business IP Trigger ---
  const getIpAddress = () => {
    const actingBase = activeUserIdx + 1;
    return `192.168.10.${10 + actingBase * 3}`;
  };

  // Helper: Append a central audit log (Module 12)
  const auditAction = (actionDesc: string, memoRef: string, logsList = auditLogs) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      user: activeUser.name,
      role: activeUser.role,
      action: actionDesc,
      date: new Date().toISOString().substring(0, 10),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ipAddress: getIpAddress(),
      memoRef
    };
    return [newLog, ...logsList];
  };

  // Helper: SMTP notification mail triggering (Module 5)
  const sendEmailAlert = (toEmail: string, subject: string, body: string, memoRefNo: string, notifsList = notifications) => {
    const newMail: EmailNotification = {
      id: `N-${Date.now().toString().slice(-4)}`,
      to: toEmail,
      subject,
      body,
      date: new Date().toISOString().substring(0, 10),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
      memosRef: memoRefNo
    };
    return [newMail, ...notifsList];
  };

  // --- Business Logic: Automated Notification Flow (Module 5) ---
  const triggerWorkflowEmailNotification = (memo: MemoRequest, action: "submit" | "approve" | "reject" | "clarify" | "payment" | "retirement", nextRole?: UserRole, notifsList = notifications) => {
    const ref = memo.refNo;
    const title = memo.title;
    const author = memo.initiator.name;

    if (action === "submit") {
      // Initiator submitted -> line manager
      const lm = users.find(u => u.role === UserRole.LINE_MANAGER);
      if (lm) {
        return sendEmailAlert(
          lm.email,
          `Action Required: Claims docket awaiting your review [${ref}]`,
          `Dear ${lm.name},\nAn Internal docket request titled '${title}' has been submitted by ${author} and is awaiting your Line Manager signature review.`,
          ref,
          notifsList
        );
      }
    } else if (action === "approve" && nextRole) {
      // Approved to next validator
      const targetUser = users.find(u => u.role === nextRole);
      if (targetUser) {
        return sendEmailAlert(
          targetUser.email,
          `Action Required: Claim docket forwarded for processing [${ref}]`,
          `Dear ${targetUser.name},\nA Vetiva docket request titled '${title}' has been signed & approved and forwarded to your desk as ${nextRole} for processing.`,
          ref,
          notifsList
        );
      }
    } else if (action === "clarify") {
      // Sent back to initiator
      return sendEmailAlert(
        memo.initiator.email,
        `Action Required: Clarification sought for claim [${ref}]`,
        `Dear ${author},\nAn approver has requested clarification regarding your claim docket '${title}'. Please log on, read comments, and respond.`,
        ref,
        notifsList
      );
    } else if (action === "payment") {
      // Settled notification
      return sendEmailAlert(
        memo.initiator.email,
        `Claims docket settled & paid successfully [${ref}]`,
        `Dear ${author},\nFunds matching your claim '${title}' (Amount: $${memo.amountRequested}) have been processed and disbursed by CFO Sterling. Check accounts.`,
        ref,
        notifsList
      );
    } else if (action === "reject") {
      // Rejected notification
      return sendEmailAlert(
        memo.initiator.email,
        `Claims Request Rejected: [${ref}]`,
        `Dear ${author},\nWe regret to inform you that your claim docket '${title}' has been declined during workflow assessments. Read approval comments.`,
        ref,
        notifsList
      );
    } else if (action === "retirement") {
      // Approved retirement notification
      return sendEmailAlert(
        memo.initiator.email,
        `Cash Advance Retirement Audited & Closed [${ref}]`,
        `Dear ${author},\nYour Cash Advance retirement submission for green-slotted docket '${memo.cashAdvanceRefNo}' has been fully verified and closed. Audit completed.`,
        ref,
        notifsList
      );
    }

    return notifsList;
  };

  // Get active pending workload for a specific user role
  const getDeskWorkloadCount = (role: UserRole) => {
    return memos.filter((m) => {
      if (m.status === RequestStatus.DRAFT) return false;
      
      // Clarification belongs to Initiator
      if (m.status === RequestStatus.CLARIFICATION) {
        return role === UserRole.INITIATOR && m.pendingClarificationFromInitiator;
      }
      
      if (m.status === RequestStatus.CORRECTION) {
        return role === UserRole.INITIATOR;
      }

      // Check current sequential workspace desk
      if (role === UserRole.LINE_MANAGER && m.currentWorkflowStep === 1) return true;
      if (role === UserRole.INTERNAL_CONTROL && m.currentWorkflowStep === 2) return true;
      if (role === UserRole.EXECUTIVE_DIRECTOR && m.currentWorkflowStep === 3) return true;
      if (role === UserRole.FINANCE && m.currentWorkflowStep === 4) return true;
      
      return false;
    }).length;
  };

  // Save acting user signature changes
  const handleSaveActingUserSignature = (dataUrl: string) => {
    const updatedUsers = users.map((u, idx) => {
      if (idx === activeUserIdx) {
        return { ...u, signatureUrl: dataUrl };
      }
      return u;
    });
    setUsers(updatedUsers);
    
    // Add compliance footprint log
    const updatedLogs = auditAction(`UPDATED digital signature blueprint`, "USER_SIG");
    syncAndSetState(memos, updatedLogs, notifications, updatedUsers);
  };

  // --- Module 1/8/9: Create / Submission logic ---
  const handleCreateOrSubmitMemo = (formData: Partial<MemoRequest>, isDraft: boolean) => {
    const isNew = !formData.id;
    const year = new Date().getFullYear();
    const docId = isNew ? `MEMO-${year}-${Date.now().toString().slice(-4)}` : formData.id!;
    const numericSuffix = docId.split("-").pop();
    
    // Auto generate VCM Reference (Module 1/8/9)
    const refCode = formData.type === RequestType.MEMO ? "MEMO" : formData.type === RequestType.CASH_ADVANCE ? "CADV" : "RET";
    const refNo = isNew ? `VCM/${year}/${refCode}/${1000 + Number(numericSuffix || 1)}` : memos.find(m => m.id === docId)?.refNo || "";

    const newMemo: MemoRequest = {
      id: docId,
      refNo,
      title: formData.title || "Untitled Docket Document",
      department: formData.department || activeUser.department,
      type: formData.type || RequestType.MEMO,
      purpose: formData.purpose || "",
      amountRequested: formData.amountRequested || 0,
      vendorInfo: formData.vendorInfo,
      paymentDetails: formData.paymentDetails || "",
      dateCreated: new Date().toISOString().substring(0, 10),
      priorityLevel: formData.priorityLevel || "Medium",
      status: isDraft ? RequestStatus.DRAFT : (formData.type === RequestType.RETIREMENT ? RequestStatus.SUBMITTED : RequestStatus.PENDING),
      initiator: {
        name: activeUser.name,
        email: activeUser.email,
        department: activeUser.department
      },
      currentWorkflowStep: isDraft ? 0 : 1, // Start sequential workflows
      workflowSequence: [UserRole.LINE_MANAGER, UserRole.INTERNAL_CONTROL, UserRole.EXECUTIVE_DIRECTOR, UserRole.FINANCE],
      approvals: [],
      supportingDocs: formData.supportingDocs,
      pendingClarificationFromInitiator: false,
      periodCovered: formData.periodCovered,
      cashAdvanceRefNo: formData.cashAdvanceRefNo,
      amountCollected: formData.amountCollected,
      amountUtilized: formData.amountUtilized,
      balanceReturned: formData.balanceReturned,
      expenseBreakdown: formData.expenseBreakdown,
      receiptsAttachmentName: formData.receiptsAttachmentName
    };

    let updatedMemos: MemoRequest[] = [];
    if (isNew) {
      updatedMemos = [newMemo, ...memos];
    } else {
      updatedMemos = memos.map((m) => (m.id === docId ? { ...m, ...newMemo } : m));
    }

    // Capture compliance trails
    const auditText = isDraft ? `SAVED DRAFT claims docket [${refNo}]` : `SUBMITTED claims docket for workflow approvals [${refNo}]`;
    let updatedLogs = auditAction(auditText, refNo);
    
    // Trigger notification mails (Module 5)
    let updatedNotifs = notifications;
    if (!isDraft) {
      updatedNotifs = triggerWorkflowEmailNotification(newMemo, "submit", undefined, notifications);
    }

    syncAndSetState(updatedMemos, updatedLogs, updatedNotifs);
    setIsCreatingMemo(false);
    setEditingMemo(null);
  };

  // --- Module 3: Approver Actions Engine ---
  const handleExecuteApprovalStep = (
    memo: MemoRequest,
    action: "Approve" | "Reject" | "Request Clarification" | "Returned for Correction" | "Respond"
  ) => {
    // Requirements validation checks
    if (!approvalComment.trim() && action !== "Respond") {
      alert("Please provide a supportive comment for compliance audits.");
      return;
    }

    if (action === "Approve" && !activeUser.signatureUrl) {
      alert("Please draw or upload your e-signature first inside your profile.");
      setShowSignaturePad(true);
      return;
    }

    let updatedMemos = [...memos];
    let updatedLogs = [...auditLogs];
    let updatedNotifs = [...notifications];

    const updatedMemo = { ...memo };
    const currentStepRole = activeUser.role;

    if (action === "Respond") {
      // Initiator responds back on requested clarification
      updatedMemo.pendingClarificationFromInitiator = false;
      const originalRequestingApprover = updatedMemo.clarificationRequestBy || UserRole.LINE_MANAGER;
      updatedMemo.clarificationResponse = clarificationResponseText;
      updatedMemo.status = RequestStatus.PENDING;

      // Add feedback approval block
      const approvalResponse: WorkflowApproval = {
        role: UserRole.INITIATOR,
        approverName: activeUser.name,
        designation: activeUser.designation,
        action: "Respond",
        comments: `Submitted response: ${clarificationResponseText}`,
        date: new Date().toISOString().substring(0, 10),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        signatureUrl: activeUser.signatureUrl
      };
      updatedMemo.approvals = [...updatedMemo.approvals, approvalResponse];

      updatedLogs = auditAction(`SUBMITTED response to clarification questions regarding docket`, updatedMemo.refNo, updatedLogs);
      
      // Notify targeting approver who asked
      updatedNotifs = sendEmailAlert(
        users.find(u => u.role === originalRequestingApprover)?.email || "",
        `Response Submitted: Clarification response received for claims [${updatedMemo.refNo}]`,
        `Dear Approver,\nThe initiator has submitted a response explanation for their claims docket: '${updatedMemo.title}' and returned it to your desk.`,
        updatedMemo.refNo,
        updatedNotifs
      );

      setClarificationResponseText("");
    } else {
      // Sequential Validator steps tracking (Line Manager -> Internal Control -> Executive Director -> Finance)
      // Save signature Placement (Module 4)
      const approvalItem: WorkflowApproval = {
        role: currentStepRole,
        approverName: activeUser.name,
        designation: activeUser.designation,
        action: action as any,
        comments: approvalComment,
        date: new Date().toISOString().substring(0, 10),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        signatureUrl: activeUser.signatureUrl
      };

      updatedMemo.approvals = [...updatedMemo.approvals, approvalItem];

      if (action === "Approve") {
        const nextStep = updatedMemo.currentWorkflowStep + 1;
        updatedMemo.currentWorkflowStep = nextStep;

        if (nextStep === 5) {
          // Fully approved by Executive Director, transfering to Finance
          updatedMemo.status = RequestStatus.APPROVED;
          updatedMemo.amountApproved = updatedMemo.amountRequested;
          updatedLogs = auditAction(`SIGNED & EXECUTIVE DIRECTED APPROVED claims docket`, updatedMemo.refNo, updatedLogs);
          
          // Notify Finance CFO
          updatedNotifs = triggerWorkflowEmailNotification(updatedMemo, "approve", UserRole.FINANCE, updatedNotifs);
        } else {
          // Normal next sequence validator
          const nextRole = updatedMemo.workflowSequence[nextStep - 1];
          updatedLogs = auditAction(`APPROVED & SIGNED claims docket sequentially`, updatedMemo.refNo, updatedLogs);
          updatedNotifs = triggerWorkflowEmailNotification(updatedMemo, "approve", nextRole, updatedNotifs);
        }
      } else if (action === "Reject") {
        updatedMemo.status = RequestStatus.REJECTED;
        updatedMemo.currentWorkflowStep = 5; // End workflows
        updatedLogs = auditAction(`DECLINED & SHUT DOWN claims docket`, updatedMemo.refNo, updatedLogs);
        updatedNotifs = triggerWorkflowEmailNotification(updatedMemo, "reject", undefined, updatedNotifs);
      } else if (action === "Request Clarification") {
        updatedMemo.status = RequestStatus.CLARIFICATION;
        updatedMemo.pendingClarificationFromInitiator = true;
        updatedMemo.clarificationRequestBy = currentStepRole;
        updatedMemo.clarificationQuestion = approvalComment;
        updatedLogs = auditAction(`REQUESTED clarification explanations regarding docket`, updatedMemo.refNo, updatedLogs);
        updatedNotifs = triggerWorkflowEmailNotification(updatedMemo, "clarify", undefined, updatedNotifs);
      } else if (action === "Returned for Correction") {
        updatedMemo.status = RequestStatus.CORRECTION;
        updatedMemo.currentWorkflowStep = 0; // Goes back to draft adjustments
        updatedLogs = auditAction(`RETURNED docket for correction adjustments`, updatedMemo.refNo, updatedLogs);
        
        // Custom Mail alert return
        updatedNotifs = sendEmailAlert(
          updatedMemo.initiator.email,
          `Claims docket returned for correction [${updatedMemo.refNo}]`,
          `Dear ${updatedMemo.initiator.name},\nYour claims request '${updatedMemo.title}' has been returned to your draft folder for essential adjustments and amendments.`,
          updatedMemo.refNo,
          updatedNotifs
        );
      }
    }

    // Refresh memory
    updatedMemos = updatedMemos.map(m => m.id === memo.id ? updatedMemo : m);
    syncAndSetState(updatedMemos, updatedLogs, updatedNotifs);
    setApprovalComment("");
    // Keep selecting active details
    setSelectedMemoId(updatedMemo.id);
  };

  // --- Module 6: Finance Payment Desk triggers ---
  const handleProcessFinanceDisbursement = (memo: MemoRequest) => {
    if (!paymentRef.trim()) {
      alert("Please generate or enter a valid Bank Transfer/Cheque payment reference.");
      return;
    }

    if (!budgetAvailable) {
      alert("Payment processing requires valid verified budget allocation codes.");
      return;
    }

    const paymentDetails: PaymentDetails = {
      processedBy: activeUser.name,
      paymentRef,
      paymentDate: new Date().toISOString().substring(0, 10),
      paymentMethod,
      amountPaid: memo.amountRequested,
      beneficiary: payeeDetails || memo.paymentDetails,
      budgetAvailable: true,
      paymentEvidenceName: evidenceFileName || "Bank_Transfer_Slip.pdf",
      remarks: financeRemarks
    };

    const updatedMemo = { ...memo };
    updatedMemo.payment = paymentDetails;
    updatedMemo.currentWorkflowStep = 5; // Finish fully

    // Set statuses according to type
    if (updatedMemo.type === RequestType.CASH_ADVANCE) {
      updatedMemo.status = RequestStatus.RELEASED; // Released
    } else {
      updatedMemo.status = RequestStatus.PAID; // Paid
    }

    let updatedLogs = auditAction(`PROCESSED & SETTLED claim funds with payment ref ${paymentRef}`, updatedMemo.refNo);
    let updatedNotifs = triggerWorkflowEmailNotification(updatedMemo, "payment", undefined, notifications);

    // Update state lists
    const updatedMemos = memos.map(m => m.id === memo.id ? updatedMemo : m);
    syncAndSetState(updatedMemos, updatedLogs, updatedNotifs);

    // Reset local finance variables
    setPaymentRef("");
    setPayeeDetails("");
    setFinanceRemarks("");
    setEvidenceFileName("");
  };

  // --- Module 9: Retirement Direct Audit verification ---
  const handleVerifyRetirementClosure = (memo: MemoRequest) => {
    const updatedMemo = { ...memo };
    updatedMemo.status = RequestStatus.CLOSED;
    updatedMemo.currentWorkflowStep = 5;

    // Connect and close the parent cash advance as well
    const updatedMemos = memos.map((m) => {
      if (m.id === memo.id) {
        return updatedMemo;
      }
      // Set the cash advance status as completed as well
      if (m.refNo === memo.cashAdvanceRefNo) {
        return { ...m, status: RequestStatus.COMPLETED };
      }
      return m;
    });

    let updatedLogs = auditAction(`AUDITED & CLOSED cash advance retirement ledger`, updatedMemo.refNo);
    let updatedNotifs = triggerWorkflowEmailNotification(updatedMemo, "retirement", undefined, notifications);

    syncAndSetState(updatedMemos, updatedLogs, updatedNotifs);
  };

  // Notifications drawer controls helpers
  const handleMarkAsRead = (id: string) => {
    const updatedNotifs = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    syncAndSetState(memos, auditLogs, updatedNotifs);
  };

  const handleClearNotifications = () => {
    const updatedNotifs = notifications.filter(n => n.to.toLowerCase() !== activeUser.email.toLowerCase());
    syncAndSetState(memos, auditLogs, updatedNotifs);
  };

  const handleSelectMemoFromRef = (refNo: string) => {
    const match = memos.find(m => m.refNo === refNo);
    if (match) {
      setSelectedMemoId(match.id);
      setIsCreatingMemo(false);
      setEditingMemo(null);
    }
  };

  // --- Global list search filters (Module 7) ---
  const filteredMemos = memos.filter((memo) => {
    const matchesDocId =
      !searchDocId.trim() ||
      memo.refNo.toLowerCase().includes(searchDocId.toLowerCase()) ||
      memo.title.toLowerCase().includes(searchDocId.toLowerCase()) ||
      memo.initiator.name.toLowerCase().includes(searchDocId.toLowerCase());

    const matchesDept = searchDept === "All" || memo.department === searchDept;
    
    const matchesStatus =
      searchStatus === "All" ||
      memo.status.toLowerCase() === searchStatus.toLowerCase();

    return matchesDocId && matchesDept && matchesStatus;
  });

  const selectedMemo = memos.find((m) => m.id === selectedMemoId) || null;

  // List of released cash advances eligible for retirement
  const johnDoeReleasedAdvances = memos.filter(
    (m) =>
      m.type === RequestType.CASH_ADVANCE &&
      m.status === RequestStatus.RELEASED &&
      m.initiator.email === "john.doe@vetiva.com"
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800" id="main-system-app">
      
      {/* 1. Header & Role Sandbox Switcher (Module 10 Role based simulation) */}
      <header className="bg-[#0b1a30] text-white border-b border-slate-800 shrink-0 shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-[#c39c4a] p-2 rounded-lg text-[#0b1a30]">
                <Layers size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#c39c4a] font-bold font-mono">
                  Executive Terminal
                </span>
                <h1 className="text-md md:text-lg font-display font-bold tracking-tight text-white mt-0.5">
                  VETIVA M-Approval Ledger Solutions
                </h1>
              </div>
            </div>

            {/* Sandbox Tester Controls */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#c39c4a] font-bold uppercase tracking-wider block">
                  Simulate Acting Profile:
                </span>
                <select
                  id="sandbox-user-role-select"
                  value={activeUserIdx}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setActiveUserIdx(idx);
                    setSelectedMemoId(null);
                    setIsCreatingMemo(false);
                    setEditingMemo(null);
                  }}
                  className="bg-slate-950 text-xs font-semibold text-white border border-slate-800 rounded-lg py-1 px-2 focus:ring-1 focus:ring-amber-500/50"
                >
                  {users.map((profile, i) => {
                    const workload = getDeskWorkloadCount(profile.role);
                    const workloadIndicator = workload > 0 ? ` (${workload} Actionable)` : "";
                    return (
                      <option key={profile.id} value={i}>
                        {profile.name} - [{profile.role}]{workloadIndicator}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-2 border-l border-slate-800">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                <span className="text-[11px] font-mono pr-1">{activeUser.email}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Signature Setup Alert Banner */}
      {!activeUser.signatureUrl && activeUser.role !== UserRole.AUDITOR && (
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-700/5 border-b border-amber-500/20 p-3 text-center no-print text-xs text-amber-900 font-medium flex items-center justify-center gap-2 flex-wrap">
          <AlertCircle size={15} className="text-amber-600 animate-bounce" />
          <span>No digital signature configured for <strong>{activeUser.name}</strong>. Create signature to authorize claims.</span>
          <button
            id="btn-trigger-banner-sig"
            type="button"
            onClick={() => {
              setShowSignaturePad(true);
            }}
            className="text-2xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 rounded-full shadow-sm transition-colors cursor-pointer"
          >
            Configure Signature Now
          </button>
        </div>
      )}

      {/* 2. Secondary Application Tabs Menu */}
      <div className="bg-white border-b border-slate-200 shrink-0 no-print">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex space-x-6 text-xs md:text-sm font-semibold text-slate-500 my-1">
            <button
              id="top-nav-dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`py-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "dashboard"
                  ? "border-[#c39c4a] text-[#0b1a30] font-bold"
                  : "border-transparent hover:text-slate-800"
              }`}
            >
              <Layers size={15} />
              Workflows Control Room
            </button>
            <button
              id="top-nav-reports"
              onClick={() => {
                setActiveTab("reports");
                setSelectedMemoId(null);
                setIsCreatingMemo(false);
              }}
              className={`py-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "reports"
                  ? "border-[#c39c4a] text-[#0b1a30] font-bold"
                  : "border-transparent hover:text-slate-800"
              }`}
            >
              <FileText size={15} />
              Regulatory Ledger Reports
            </button>
            <button
              id="top-nav-audit"
              onClick={() => {
                setActiveTab("audit");
                setSelectedMemoId(null);
                setIsCreatingMemo(false);
              }}
              className={`py-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "audit"
                  ? "border-[#c39c4a] text-[#0b1a30] font-bold"
                  : "border-transparent hover:text-slate-800"
              }`}
            >
              <ShieldCheck size={15} />
              Zero-Trust Audit Logs
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 overflow-hidden flex flex-col gap-6">

        {/* Global Signature Configuration Modal popup (Drawer interface) */}
        {showSignaturePad && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4" id="signature-configurator-overlay">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-slate-200">
              <div className="p-4 bg-[#0b1a30] text-white flex justify-between items-center">
                <span className="font-display font-bold text-sm flex items-center gap-2">
                  <UserCheck size={16} className="text-amber-400" />
                  E-Signature Configuration Dashboard
                </span>
                <button
                  type="button"
                  id="btn-close-sig-config"
                  onClick={() => setShowSignaturePad(false)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-amber-100/30 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-900">
                  Configure the signature blueprint model for <strong>{activeUser.name} ({activeUser.role})</strong>.
                  All authorization approvals sequentially stamped with your credential profile will reflect this physical image.
                </div>
                
                <SignaturePad
                  userName={activeUser.name}
                  savedSignature={activeUser.signatureUrl}
                  onSave={(dataUrl) => {
                    handleSaveActingUserSignature(dataUrl);
                    setShowSignaturePad(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: Workflows Control Room */}
        {activeTab === "dashboard" && (
          <div className="flex-1 lg:grid lg:grid-cols-3 gap-6 overflow-hidden min-h-0">
            
            {/* COLUMN 1 & Column 2: Dashboard Content grids */}
            <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-0 lg:pr-1">
              
              {/* Conditional Screen A: Drawing Claims document */}
              {isCreatingMemo ? (
                <MemoForm
                  actingUser={activeUser}
                  releasedAdvances={johnDoeReleasedAdvances}
                  initialData={editingMemo}
                  onCancel={() => {
                    setIsCreatingMemo(false);
                    setEditingMemo(null);
                  }}
                  onSaveDraft={(data) => handleCreateOrSubmitMemo(data, true)}
                  onSubmit={(data) => handleCreateOrSubmitMemo(data, false)}
                />
              ) : (
                <>
                  {/* Executive Counters Widgets */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between relative overflow-hidden">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Desk Workload</span>
                        <span className="text-2xl font-display font-bold text-[#0b1a30] block mt-1">
                          {getDeskWorkloadCount(activeUser.role)}
                        </span>
                        <span className="text-[9px] text-[#c39c4a] font-semibold mt-1 block">Awaiting sign-off</span>
                      </div>
                      <Inbox size={32} className="text-[#0b1a30]/10 stroke-1 pointer-events-none" />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between relative overflow-hidden">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Memos</span>
                        <span className="text-2xl font-display font-bold text-slate-900 block mt-1">
                          {memos.filter(m => m.type === RequestType.MEMO).length}
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold mt-1 block">Internal circulars</span>
                      </div>
                      <FileTitleIcon type={RequestType.MEMO} count />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between relative overflow-hidden">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cash Advances</span>
                        <span className="text-2xl font-display font-bold text-slate-900 block mt-1">
                          {memos.filter(m => m.type === RequestType.CASH_ADVANCE).length}
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold mt-1 block">Advances disbursed</span>
                      </div>
                      <FileTitleIcon type={RequestType.CASH_ADVANCE} count />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between relative overflow-hidden">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Retirements</span>
                        <span className="text-2xl font-display font-bold text-slate-900 block mt-1">
                          {memos.filter(m => m.type === RequestType.RETIREMENT).length}
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold mt-1 block">Audit balances</span>
                      </div>
                      <FileTitleIcon type={RequestType.RETIREMENT} count />
                    </div>
                  </div>

                  {/* Operational Search filter docket lists */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col no-print" id="dashboard-claims-panel">
                    
                    {/* Header */}
                    <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex justify-between items-center">
                      <div>
                        <h2 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                          <Layers size={15} />
                          Worklist Ledger Dossier
                        </h2>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Review existing approvals, drafts, or create new funding claim templates to begin.
                        </span>
                      </div>

                      {/* Claim Button */}
                      {activeUser.role === UserRole.INITIATOR && (
                        <button
                          id="btn-create-memo-claim"
                          onClick={() => {
                            setEditingMemo(null);
                            setIsCreatingMemo(true);
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-shadow shadow-sm cursor-pointer"
                        >
                          <Plus size={14} className="stroke-[2.5]" />
                          Initiate Claim
                        </button>
                      )}
                    </div>

                    {/* Filters Row */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-2.5 text-slate-450" />
                        <input
                          id="memo-search-input"
                          type="text"
                          value={searchDocId}
                          onChange={(e) => setSearchDocId(e.target.value)}
                          placeholder="Search Memo No, Department, Requester name..."
                          className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-lg bg-white"
                        />
                      </div>

                      <div className="flex gap-2">
                        <select
                          id="memo-dept-filter"
                          value={searchDept}
                          onChange={(e) => setSearchDept(e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        >
                          <option value="All">All Offices</option>
                          <option value="Corporate Finance & Advisory">Corporate Finance</option>
                          <option value="Asset Management">Asset Management</option>
                          <option value="Wealth Management">Wealth Mgmt</option>
                          <option value="Internal Control & Compliance">Internal Control</option>
                        </select>

                        <select
                          id="memo-status-filter"
                          value={searchStatus}
                          onChange={(e) => setSearchStatus(e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium text-slate-700"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Draft">Draft</option>
                          <option value="Pending Approval">Pending</option>
                          <option value="Clarification Required">Clarification</option>
                          <option value="Approved">Approved</option>
                          <option value="Paid">Paid</option>
                          <option value="CASH_ADVANCE_RELEASED">Released</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    {/* Table Listings */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[#0b1a30] text-[10px] uppercase font-bold tracking-wider">
                            <th className="py-2.5 px-4 font-semibold">Ref Number</th>
                            <th className="py-2.5 px-4 font-semibold">Document Title</th>
                            <th className="py-2.5 px-4 font-semibold">Requester</th>
                            <th className="py-2.5 px-4 font-semibold text-right">Value ($)</th>
                            <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                            <th className="py-2.5 px-4 text-center font-bold text-amber-800">Action Desk</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredMemos.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-405 font-semibold bg-white italic">
                                No claims dockets recorded under these search parameters.
                              </td>
                            </tr>
                          ) : (
                            filteredMemos.map((memo) => {
                              const isSelected = memo.id === selectedMemoId;
                              const pendingAtDesk =
                                (activeUser.role === UserRole.LINE_MANAGER && memo.currentWorkflowStep === 1 && memo.status === RequestStatus.PENDING) ||
                                (activeUser.role === UserRole.INTERNAL_CONTROL && memo.currentWorkflowStep === 2 && (memo.status === RequestStatus.PENDING || memo.status === RequestStatus.SUBMITTED)) ||
                                (activeUser.role === UserRole.EXECUTIVE_DIRECTOR && memo.currentWorkflowStep === 3 && memo.status === RequestStatus.PENDING) ||
                                (activeUser.role === UserRole.FINANCE && memo.currentWorkflowStep === 4 && memo.status === RequestStatus.APPROVED) ||
                                (activeUser.role === UserRole.INITIATOR && memo.status === RequestStatus.CLARIFICATION && memo.pendingClarificationFromInitiator);

                              return (
                                <tr
                                  id={`claims-table-row-${memo.id}`}
                                  key={memo.id}
                                  className={`hover:bg-amber-100/10 cursor-pointer transition-colors ${
                                    isSelected ? "bg-amber-500/5 font-medium border-l-2 border-amber-500" : ""
                                  }`}
                                  onClick={() => {
                                    setSelectedMemoId(memo.id);
                                    setIsCreatingMemo(false);
                                    setEditingMemo(null);
                                  }}
                                >
                                  <td className="py-3 px-4 font-semibold text-slate-900 font-mono text-[11px]">
                                    {memo.refNo}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                      <FileTitleIcon type={memo.type} />
                                      {memo.title}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block mt-0.5">
                                      {memo.department.replace(" & Advisory", "")} • Priority: {memo.priorityLevel}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-slate-600 block sm:inline-block pr-1">
                                    <span className="block font-medium truncate">{memo.initiator.name}</span>
                                    <span className="text-[9px] text-slate-400 font-mono leading-none block">{memo.initiator.email}</span>
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-[11px] pr-4">
                                    ${memo.amountRequested.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      memo.status === RequestStatus.PAID || memo.status === RequestStatus.RELEASED || memo.status === RequestStatus.COMPLETED || memo.status === RequestStatus.CLOSED
                                        ? "bg-green-100 text-green-700 border border-green-200/50"
                                        : memo.status === RequestStatus.REJECTED
                                        ? "bg-red-100 text-red-800 border border-red-200/50"
                                        : memo.status === RequestStatus.CLARIFICATION || memo.status === RequestStatus.CORRECTION
                                        ? "bg-amber-100 text-amber-700 border border-amber-200/50"
                                        : "bg-blue-100 text-blue-700 border border-blue-200/50"
                                    }`}>
                                      {memo.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {pendingAtDesk ? (
                                      <span className="text-[9px] bg-amber-500/20 text-amber-800 border border-amber-500/30 px-2 py-0.5 rounded font-bold animate-pulse whitespace-nowrap block w-max mx-auto">
                                        ⚡ Action Pending
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap block w-max mx-auto">
                                        {memo.status === RequestStatus.DRAFT ? "Draft Form" : memo.currentWorkflowStep === 5 ? "Archived Closed" : `Signed (${memo.currentWorkflowStep}/4)`}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* COLUMN 3: Active Selection detailed review Sheets & timelines */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm shrink-0 flex flex-col overflow-hidden h-full">
              
              {/* Conditional Display: Detailed claims pane */}
              {selectedMemo ? (
                <div className="flex flex-col h-full overflow-y-auto" id="claim-detail-sheet">
                  
                  {/* Detailed Title */}
                  <div className="p-4 bg-[#0b1a30] text-white flex justify-between items-start select-none">
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase text-[#c39c4a] tracking-widest bg-[#c39c4a]/10 border border-[#c39c4a]/20 px-1.5 py-0.5 rounded">
                        {selectedMemo.type}
                      </span>
                      <h2 className="text-sm font-display font-bold mt-1.5 tracking-tight leading-tight">
                        {selectedMemo.title}
                      </h2>
                      <span className="text-[10px] font-mono text-slate-400 block mt-1">
                        Docket Index: <strong>{selectedMemo.refNo}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMemoId(null)}
                      className="text-slate-400 hover:text-white font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-5 flex-1 space-y-6">
                    {/* Basic details */}
                    <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[#a1a1aa] uppercase font-bold text-[9px] tracking-wider block">Initiated By</span>
                        <span className="font-semibold text-slate-800 tracking-tight block mt-0.5">{selectedMemo.initiator.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono block leading-none">{selectedMemo.initiator.department}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#a1a1aa] uppercase font-bold text-[9px] tracking-wider block">Claim Balance</span>
                        <strong className="text-md text-[#0b1a30] font-mono block mt-0.5">
                          ${selectedMemo.amountRequested.toLocaleString()}
                        </strong>
                        <span className="text-[10px] text-slate-500 font-mono block leading-none">Priority: {selectedMemo.priorityLevel}</span>
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className="space-y-1.5">
                      <span className="text-[#a1a1aa] uppercase font-bold text-[9px] tracking-wider block">Purpose & Project Alignment</span>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 rounded-lg p-3 whitespace-pre-line font-medium shadow-2xs">
                        {selectedMemo.purpose}
                      </p>
                    </div>

                    {/* Cash Advance Retirement Details (Module 9 table print) */}
                    {selectedMemo.type === RequestType.RETIREMENT && selectedMemo.expenseBreakdown && (
                      <div className="space-y-3 pt-2 bg-amber-50/20 border border-amber-200/50 rounded-xl p-3">
                        <span className="font-semibold text-xs text-amber-900 block flex items-center gap-1">
                          <Coins size={14} className="text-amber-700 font-bold" />
                          Expense Utilization Audits
                        </span>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center text-[11px] text-slate-500">
                            <span>Parent Cash Advance No:</span>
                            <span className="font-mono font-bold text-slate-800">{selectedMemo.cashAdvanceRefNo}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-slate-500">
                            <span>Amount Disbursed Collected:</span>
                            <span className="font-mono text-slate-800 font-medium">${selectedMemo.amountCollected}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-slate-500 border-b border-dashed pb-1.5 border-amber-200">
                            <span>Total Utilized Spent:</span>
                            <span className="font-mono text-amber-950 font-bold">${selectedMemo.amountUtilized}</span>
                          </div>
                          <div className="flex justify-between items-center font-bold text-xs">
                            <span className="text-slate-600">Credit Balance Returned:</span>
                            <span className="font-mono text-green-700">${selectedMemo.balanceReturned}</span>
                          </div>
                        </div>

                        {/* Petty expenses breakdown */}
                        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden/50 mt-1">
                          <table className="w-full text-left font-sans text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-100">
                                <th className="py-1 px-2.5">Expense Item</th>
                                <th className="py-1 px-2.5 text-right w-16">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {selectedMemo.expenseBreakdown.map((item) => (
                                <tr key={item.id}>
                                  <td className="py-1.5 px-2.5 leading-snug">
                                    <div className="font-semibold text-slate-800">{item.category}</div>
                                    <span className="text-[10px] text-slate-500 block">{item.description}</span>
                                  </td>
                                  <td className="py-1.5 px-2.5 text-right font-mono text-slate-700">${item.amount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Vendor and Settlement info */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 border border-slate-100 rounded-lg p-3">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Beneficiary Target</span>
                        <p className="font-semibold text-slate-900 mt-0.5 leading-tight">{selectedMemo.vendorInfo || "N/A - Direct payout"}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Settlement Ledger</span>
                        <p className="font-mono font-medium text-[11px] text-slate-700 mt-0.5 leading-tight">{selectedMemo.paymentDetails}</p>
                      </div>
                    </div>

                    {/* Attachments list (Module 1, 8, 9) */}
                    {selectedMemo.supportingDocs && selectedMemo.supportingDocs.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[#a1a1aa] uppercase font-bold text-[9px] tracking-wider block">Attached Compliant Evidence</span>
                        <div className="space-y-1">
                          {selectedMemo.supportingDocs.map((doc, i) => (
                            <div key={i} className="bg-slate-50 hover:bg-slate-100/50 rounded-lg py-1.5 px-2.5 border border-slate-100 flex items-center justify-between text-xs transition-colors">
                              <span className="text-slate-600 font-medium truncate">{doc.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono pr-1">{doc.size}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Sequential Stepper Timeline (Module 2 sequence) */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <span className="text-[#a1a1aa] uppercase font-bold text-[9px] tracking-wider block">Sequential Workflows Log</span>
                      <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200">
                        
                        {/* 1. Initiator step */}
                        <div className="flex gap-3 text-xs relative">
                          <div className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-xs">
                            <CheckCircle size={14} className="stroke-[2.5]" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">Initiator Submitted</div>
                            <div className="text-[11px] text-slate-500">
                              By {selectedMemo.initiator.name} on {selectedMemo.dateCreated}
                            </div>
                          </div>
                        </div>

                        {/* Validators Steps mappings */}
                        {selectedMemo.workflowSequence.map((role, rIdx) => {
                          const stepOrder = rIdx + 1;
                          const activeStep = selectedMemo.currentWorkflowStep;
                          const isComplete = activeStep > stepOrder;
                          const isActive = activeStep === stepOrder && selectedMemo.status !== RequestStatus.REJECTED;
                          
                          // Look for approval record match
                          const matchApproval = selectedMemo.approvals.find(a => a.role === role);
                          
                          let statusColor = "bg-slate-200 text-slate-500";
                          let statusLabel = isComplete ? "Approved Approved" : isActive ? "Action Pending" : "Awaiting Downstream";
                          
                          if (isComplete && matchApproval?.action === "Reject") {
                            statusColor = "bg-red-500 text-white";
                          } else if (isComplete) {
                            statusColor = "bg-green-500 text-white";
                          } else if (isActive) {
                            statusColor = "bg-amber-500 text-slate-950 animate-pulse font-semibold";
                          }

                          return (
                            <div key={role} className="flex gap-3 text-xs relative">
                              <div className={`w-7 h-7 ${statusColor} rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-xs font-mono font-black text-[10px]`}>
                                {isComplete ? "✓" : stepOrder}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-baseline">
                                  <span className={`font-bold ${isActive ? "text-amber-800" : "text-slate-800"}`}>{role}</span>
                                  {matchApproval && (
                                    <span className="text-[9px] bg-slate-100 font-mono px-1 py-0.5 rounded text-slate-500">
                                      Signed {matchApproval.date}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 italic">
                                  {matchApproval ? `"${matchApproval.comments}"` : isComplete ? "Completed sign-off" : statusLabel}
                                </p>
                                
                                {/* Signature display stamp (Module 4) */}
                                {matchApproval?.signatureUrl && (
                                  <div className="mt-2 inline-flex items-center gap-1.5 p-1 bg-slate-50 border rounded text-[10px] select-none font-sans scale-95 origin-left">
                                    <img
                                      src={matchApproval.signatureUrl}
                                      alt={`${role} signature`}
                                      className="max-h-7 max-w-[80px] object-contain border bg-white p-0.5 rounded"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="leading-tight text-slate-455 text-[9px]">
                                      <span className="block font-bold truncate max-w-[100px]">{matchApproval.approverName}</span>
                                      <span className="block text-slate-400 font-mono text-[8px] leading-none">Time: {matchApproval.time}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Clarification responses form (Module 3 loop) */}
                    {selectedMemo.status === RequestStatus.CLARIFICATION && selectedMemo.pendingClarificationFromInitiator && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3" id="clarification-dialogue">
                        <span className="font-bold text-xs text-amber-800 flex items-center gap-1">
                          <HelpCircle size={14} /> Clarification Requested by {selectedMemo.clarificationRequestBy}
                        </span>
                        <div className="text-xs text-slate-700 bg-white border border-amber-500/20 rounded p-2.5 italic">
                          "{selectedMemo.clarificationQuestion}"
                        </div>
                        
                        {activeUser.role === UserRole.INITIATOR ? (
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Your Response Particulars *</label>
                            <textarea
                              id="clarification-response-textarea"
                              rows={3}
                              value={clarificationResponseText}
                              onChange={(e) => setClarificationResponseText(e.target.value)}
                              placeholder="Describe your clarifications here to resume workflow..."
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <div className="flex justify-end pt-1">
                              <button
                                id="btn-submit-clarification-response"
                                type="button"
                                onClick={() => handleExecuteApprovalStep(selectedMemo, "Respond")}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-1.5 px-3 rounded flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Send size={12} /> Submit Explanation Response
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 italic">
                            Waiting for Initiator John Doe to submit clarification explanation.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Active Approval Action controls box on desk (Module 3) */}
                    {((activeUser.role === UserRole.LINE_MANAGER && selectedMemo.currentWorkflowStep === 1 && selectedMemo.status === RequestStatus.PENDING) ||
                      (activeUser.role === UserRole.INTERNAL_CONTROL && selectedMemo.currentWorkflowStep === 2 && (selectedMemo.status === RequestStatus.PENDING || selectedMemo.status === RequestStatus.SUBMITTED)) ||
                      (activeUser.role === UserRole.EXECUTIVE_DIRECTOR && selectedMemo.currentWorkflowStep === 3 && selectedMemo.status === RequestStatus.PENDING)) && (
                      <div className="bg-slate-950 text-white rounded-xl p-4.5 space-y-4 shadow-lg border border-slate-800 select-none no-print" id="approval-actions-card">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                          <span className="font-display font-bold text-xs tracking-tight flex items-center gap-1.5">
                            <ShieldCheck className="text-amber-500 animate-pulse" size={15} />
                            Claims Docket Assessment Form
                          </span>
                          <span className="text-[10px] text-slate-405 font-mono">
                            Acting Profile: {activeUser.role}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Audit Comments *</label>
                          <textarea
                            id="audit-comment-textarea"
                            rows={3}
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                            placeholder="Enter supportive decisions or rejection justifications here..."
                            className="w-full text-xs text-white bg-slate-900 border border-slate-800 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-2xs md:text-xs">
                          <button
                            id="btn-approval-approve"
                            type="button"
                            onClick={() => handleExecuteApprovalStep(selectedMemo, "Approve")}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle size={14} /> Clear & Sign
                          </button>
                          
                          <button
                            id="btn-approval-reject"
                            type="button"
                            onClick={() => handleExecuteApprovalStep(selectedMemo, "Reject")}
                            className="bg-red-650 hover:bg-red-750 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <XCircle size={14} /> Decline Docket
                          </button>
                          
                          <button
                            id="btn-approval-clarify"
                            type="button"
                            onClick={() => handleExecuteApprovalStep(selectedMemo, "Request Clarification")}
                            className="bg-amber-650 hover:bg-amber-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <HelpCircle size={14} /> Seek Clarification
                          </button>

                          <button
                            id="btn-approval-correct"
                            type="button"
                            onClick={() => handleExecuteApprovalStep(selectedMemo, "Returned for Correction")}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <RotateCcw size={14} /> Return to Draft
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Finance processing forms (Module 6) */}
                    {activeUser.role === UserRole.FINANCE && selectedMemo.currentWorkflowStep === 4 && selectedMemo.status === RequestStatus.APPROVED && (
                      <div className="bg-slate-950 text-white rounded-xl p-4.5 space-y-4 shadow-lg border border-slate-800 select-none no-print" id="finance-processing-card">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                          <span className="font-display font-semibold text-xs tracking-tight flex items-center gap-1.5">
                            <CreditCard className="text-amber-500" size={15} />
                            Finance Disbursement Vault Desk
                          </span>
                        </div>

                        <div className="space-y-4 text-xs">
                          {/* Checked history footprint */}
                          <div className="bg-slate-900 rounded p-2.5 space-y-1.5 border border-slate-800 text-[11px]">
                            <div className="text-green-400 font-bold">✓ Historical Signatures Validated</div>
                            <div className="text-slate-400">Line Manager, Internal Control, and Executive Director signatures checked and hashed in cryptographic logs.</div>
                          </div>

                          {/* Budget switcher */}
                          <div className="flex items-center justify-between bg-slate-900 hover:bg-slate-900/80 p-2.5 rounded border border-slate-800">
                            <div>
                              <span className="font-bold block">Assigned Budget Codes Verified</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">VCM-2026-FGN Advisory Allocated</span>
                            </div>
                            <input
                              id="finance-budget-checkbox"
                              type="checkbox"
                              checked={budgetAvailable}
                              onChange={(e) => setBudgetAvailable(e.target.checked)}
                              className="w-4 h-4 text-amber-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Settlement Method</label>
                              <select
                                id="finance-payment-method"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                                className="w-full bg-slate-900 text-white border border-slate-800 rounded px-2 py-1.5 text-xs"
                              >
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cash">Cash Ledger</option>
                                <option value="Cheque">Corporate Cheque</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Payment Reference No</label>
                              <input
                                id="finance-payment-ref"
                                type="text"
                                required
                                value={paymentRef}
                                onChange={(e) => setPaymentRef(e.target.value)}
                                placeholder="PAY-2026-XXXX"
                                className="w-full bg-slate-900 text-white border border-slate-800 rounded px-2 py-1 font-mono text-[11px]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block block">Filing Settlement slips upload</label>
                            <input
                              id="finance-evidence-file"
                              type="text"
                              value={evidenceFileName}
                              onChange={(e) => setEvidenceFileName(e.target.value)}
                              placeholder="e.g. Bank_Transfer_Voucher_#4482.pdf"
                              className="w-full bg-slate-900 text-white border border-slate-800 rounded px-2 py-1"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Disbursements Remarks</label>
                            <textarea
                              id="finance-payment-remarks"
                              rows={2}
                              value={financeRemarks}
                              onChange={(e) => setFinanceRemarks(e.target.value)}
                              placeholder="Debit operational ledger float..."
                              className="w-full bg-slate-900 text-white border border-slate-800 rounded p-2 focus:outline-none"
                            />
                          </div>

                          <button
                            id="btn-finance-payment-commit"
                            type="button"
                            onClick={() => handleProcessFinanceDisbursement(selectedMemo)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle size={15} /> Release Funds & Settle Docket
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Retirement Finance closing desk (Module 9 closure) */}
                    {activeUser.role === UserRole.FINANCE && selectedMemo.type === RequestType.RETIREMENT && selectedMemo.currentWorkflowStep === 2 && selectedMemo.status === RequestStatus.SUBMITTED && (
                      <div className="bg-slate-950 text-white rounded-xl p-4.5 space-y-4 shadow-lg border border-slate-800 select-none no-print" id="retirement-closure-card">
                        <div className="flex justify-between items-center border-b border-slate-805 pb-2 mb-2">
                          <span className="font-display font-semibold text-xs tracking-tight flex items-center gap-1.5">
                            <Coins size={15} className="text-amber-500" />
                            Retirement Audit verification
                          </span>
                        </div>
                        
                        <div className="space-y-3 text-xs">
                          <p className="text-slate-400 text-2xs leading-relaxed">
                            Verify that physical receipts matches listed items above, and corresponding balance of <strong>${selectedMemo.balanceReturned}</strong> has been credited back.
                          </p>
                          <button
                            id="btn-verify-retirement-commit"
                            type="button"
                            onClick={() => handleVerifyRetirementClosure(selectedMemo)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <CheckCircle size={14} /> Verify & Close Retirement Ledger
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 h-full select-none lg:max-h-[500px]">
                  <FileText size={48} className="stroke-1 text-slate-300 mb-3" />
                  <p className="font-display font-semibold text-slate-700 text-sm">No Active Selection</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-[240px] leading-relaxed">
                    Select any claims document card from the list grid to view visual signatures, chronological steppers, and process actions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Printable ledger Reports */}
        {activeTab === "reports" && (
          <div className="flex-1 overflow-y-auto">
            <ReportsPanel memos={memos} logs={auditLogs} />
          </div>
        )}

        {/* TAB 3: Zero-Trust compliance logs */}
        {activeTab === "audit" && (
          <div className="flex-1 overflow-y-auto">
            <AuditTrailPanel logs={auditLogs} />
          </div>
        )}
      </main>

      {/* 4. Automated simulated SMTP Notifications Email Side Tray drawer */}
      <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full no-print">
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#c39c4a] to-slate-900 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative">
            <NotificationCenter
              notifications={notifications}
              onClearAll={handleClearNotifications}
              onMarkAsRead={handleMarkAsRead}
              actingUserEmail={activeUser.email}
              onSelectMemoByRef={handleSelectMemoFromRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Supporting Icon selection helper maps
function FileTitleIcon({ type, count = false }: { type: RequestType; count?: boolean }) {
  let color = "text-amber-500";
  let bg = "bg-amber-500/10";
  
  if (type === RequestType.CASH_ADVANCE) {
    color = "text-blue-500";
    bg = "bg-blue-500/10";
  } else if (type === RequestType.RETIREMENT) {
    color = "text-green-500";
    bg = "bg-green-500/10";
  }

  const iconSize = count ? 32 : 14;

  let Element = FileText;
  if (type === RequestType.CASH_ADVANCE) {
    Element = CreditCard;
  } else if (type === RequestType.RETIREMENT) {
    Element = RotateCcw;
  }

  if (count) {
    return <Element size={iconSize} className={`${color}/10 stroke-1`} />;
  }

  return (
    <div className={`p-1 rounded ${bg} ${color} inline-flex items-center justify-center`}>
      <Element size={iconSize} className="stroke-[2]" />
    </div>
  );
}
