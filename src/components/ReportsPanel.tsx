/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Download, Printer, BarChart2, Calendar, FileText, Check, DollarSign, Wallet, Landmark } from "lucide-react";
import { MemoRequest, AuditLog, RequestType, RequestStatus } from "../types";

interface ReportsPanelProps {
  memos: MemoRequest[];
  logs: AuditLog[];
}

type ReportType = "Memo Approval Report" | "Cash Advance Report" | "Retirement Report" | "Payment Report" | "Audit Report";

export default function ReportsPanel({ memos, logs }: ReportsPanelProps) {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>("Memo Approval Report");
  const [selectedDept, setSelectedDept] = useState("All");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-30");
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState("");

  // Aggregate stats calculations
  const totalInternalMemos = memos.filter(m => m.type === RequestType.MEMO);
  const totalCashAdvances = memos.filter(m => m.type === RequestType.CASH_ADVANCE);
  const totalRetirements = memos.filter(m => m.type === RequestType.RETIREMENT);

  const getFilteredData = () => {
    let baseMemos = memos.filter((m) => {
      const matchDept = selectedDept === "All" || m.department === selectedDept;
      const matchDate = m.dateCreated >= startDate && m.dateCreated <= endDate;
      return matchDept && matchDate;
    });

    if (selectedReportType === "Memo Approval Report") {
      return baseMemos.filter((m) => m.type === RequestType.MEMO);
    } else if (selectedReportType === "Cash Advance Report") {
      return baseMemos.filter((m) => m.type === RequestType.CASH_ADVANCE);
    } else if (selectedReportType === "Retirement Report") {
      return baseMemos.filter((m) => m.type === RequestType.RETIREMENT);
    } else if (selectedReportType === "Payment Report") {
      return baseMemos.filter((m) => m.payment !== undefined);
    } else {
      // Audit Report
      return logs.filter((l) => {
        const matchSearch = selectedDept === "All" || l.action.toLowerCase().includes(selectedDept.toLowerCase());
        const matchDate = l.date >= startDate && l.date <= endDate;
        return matchSearch && matchDate;
      });
    }
  };

  const filteredData = getFilteredData();

  // Excel (CSV) Exporter
  const handleDownloadExcel = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (selectedReportType === "Audit Report") {
      headers = ["Log ID", "User", "Role", "Action Type", "Assoc Memo Reference", "IP Address", "Timestamp"];
      rows = (filteredData as AuditLog[]).map(log => [
        log.id,
        log.user,
        log.role,
        log.action,
        log.memoRef,
        log.ipAddress,
        `${log.date} ${log.time}`
      ]);
    } else {
      headers = ["Reference No", "Claims Category", "Doc Title", "Department", "Initiator", "Amount Requested", "Approval Status", "Date Created", "Settled Reference"];
      rows = (filteredData as MemoRequest[]).map(memo => [
        memo.refNo,
        memo.type,
        memo.title,
        memo.department,
        memo.initiator.name,
        memo.amountRequested.toString(),
        memo.status,
        memo.dateCreated,
        memo.payment?.paymentRef || "N/A"
      ]);
    }

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Vetiva_${selectedReportType.replace(/\s+/g, "_")}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show visual check mark toast
    setDownloadSuccessMessage("Excel file generated and saved successfully!");
    setTimeout(() => setDownloadSuccessMessage(""), 3500);
  };

  // PDF / HTML Print preview (Systematic)
  const handlePrintPDF = () => {
    window.print();
  };

  // Quick report summary calculations
  const summaryTotalAmount = () => {
    if (selectedReportType === "Audit") return 0;
    return (filteredData as MemoRequest[]).reduce((sum, current) => sum + current.amountRequested, 0);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm pt-1" id="reports-panel">
      {/* Settings Grid */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col xl:flex-row gap-5 items-start xl:items-center justify-between no-print">
        <div className="space-y-4 flex-1 w-full">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-2">
              <BarChart2 size={16} className="text-amber-500" />
              Vetiva Regulatory Reporting & Ledger Compilation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select variables to generate structured spreadsheets or printable reports with historic signatures embedded.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Report Format</label>
              <select
                id="select-report-type"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value as ReportType)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 focus:outline-none"
              >
                <option value="Memo Approval Report">Memo Approval Report</option>
                <option value="Cash Advance Report">Cash Advance Report</option>
                <option value="Retirement Report">Retirement Sheet Report</option>
                <option value="Payment Report">Finance Disbursement Report</option>
                <option value="Audit Report">Internal Compliance Audit log</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Department Office</label>
              <select
                id="select-report-dept"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 focus:outline-none"
              >
                <option value="All">All Department Offices</option>
                <option value="Corporate Finance & Advisory">Corporate Finance & Advisory</option>
                <option value="Asset Management">Asset Management</option>
                <option value="Wealth Management">Wealth Management</option>
                <option value="Internal Control & Compliance">Internal Control & Compliance</option>
                <option value="Finance & Operations">Finance & Operations</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Start Date Range</label>
              <div className="relative">
                <input
                  id="select-report-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.2 font-mono text-[11px] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">End Date Range</label>
              <div className="relative">
                <input
                  id="select-report-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.2 font-mono text-[11px] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex sm:flex-row flex-col gap-2 w-full xl:w-auto xl:pt-4">
          <button
            id="btn-download-excel"
            type="button"
            onClick={handleDownloadExcel}
            className="flex-1 bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <Download size={13} />
            Export to Excel
          </button>
          
          <button
            id="btn-print-pdf"
            type="button"
            onClick={handlePrintPDF}
            className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer size={13} />
            Print Report Docket
          </button>
        </div>
      </div>

      {/* Success notifier toast */}
      {downloadSuccessMessage && (
        <div className="bg-green-50 border-b border-green-200 p-2 text-center text-xs text-green-700 font-semibold flex items-center justify-center gap-2 animate-pulse no-print">
          <Check size={14} className="text-green-600" />
          {downloadSuccessMessage}
        </div>
      )}

      {/* Structured Executive Report Preview Card */}
      <div className="p-8 bg-white print:p-0" id="printable-report-canvas">
        {/* Document Header */}
        <div className="border-b-2 border-slate-950 pb-6 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-sm font-bold tracking-widest text-[#0b1a30] uppercase font-display select-none">
              VETIVA CAPITAL MANAGEMENT LIMITED
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest mt-1 uppercase">
              Plot 266B, Kofo Abayomi Street, Victoria Island, Lagos
            </p>
            <h2 className="text-base font-display font-semibold text-slate-800 uppercase tracking-tight mt-3">
              {selectedReportType}
            </h2>
            <div className="flex gap-4 text-[11px] text-slate-500 mt-1">
              <span>Department Filters: <strong>{selectedDept}</strong></span>
              <span>Duty Period: <strong className="font-mono">{startDate} to {endDate}</strong></span>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded inline-block uppercase font-sans tracking-wider border border-amber-600/30">
              Internal Control Approved
            </span>
            <div className="text-[10px] text-slate-400 mt-2 font-mono">
              Generation Date: 15-Jun-2026
            </div>
          </div>
        </div>

        {/* Aggregates Summary Boxes for Financials */}
        {selectedReportType !== "Audit Report" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scope Records Count</span>
              <span className="text-2xl font-display font-bold text-slate-900 block mt-1">{filteredData.length}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Active matching claims</span>
              <Landmark size={44} className="absolute right-2 bottom-0 text-slate-200/50 stroke-1 pointer-events-none" />
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aggregate Funds Involved</span>
              <span className="text-2xl font-display font-bold text-slate-900 block mt-1">${summaryTotalAmount().toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Accumulated dockets total</span>
              <DollarSign size={44} className="absolute right-2 bottom-0 text-slate-200/50 stroke-1 pointer-events-none" />
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative overflow-hidden font-sans">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block block">General Ledger Status</span>
              <span className="text-sm font-bold text-green-700 flex items-center gap-1.5 mt-2 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg w-max">
                <Check size={14} className="text-green-600" /> LEDGER AUDITED
              </span>
              <span className="text-[10px] text-slate-500 mt-2 block">Matched to bank statements</span>
              <Wallet size={44} className="absolute right-2 bottom-0 text-slate-200/50 stroke-1 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Data list Table */}
        {selectedReportType === "Audit Report" ? (
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-[10px] uppercase font-bold tracking-wider text-slate-700 bg-slate-100/50">
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">Acting User / Role</th>
                <th className="py-2.5 px-3">System Event Action</th>
                <th className="py-2.5 px-3">Docket Target</th>
                <th className="py-2.5 px-3">Terminal IP</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {filteredData.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-mono text-[11px]">{log.id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {log.user} <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-1 py-0.5 rounded ml-1">{log.role}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">{log.action}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-amber-900 font-bold">{log.memoRef}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
                  <td className="py-3 px-3 font-mono text-[11px] font-medium">{log.date} {log.time}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium italic">
                    No matching compliance logs recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-[10px] uppercase font-bold tracking-wider text-slate-700 bg-slate-100/30">
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Document Title</th>
                <th className="py-2.5 px-3">Dept</th>
                <th className="py-2.5 px-3">Requester</th>
                <th className="py-2.5 px-3 text-right">Fund Value ($)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {(filteredData as MemoRequest[]).map((memo) => (
                <tr key={memo.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-mono font-bold text-amber-950 text-[11px]">{memo.refNo}</td>
                  <td className="py-3 px-3 text-[11px] font-medium text-slate-500 whitespace-nowrap">{memo.type}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900 leading-tight">
                    {memo.title}
                  </td>
                  <td className="py-3 px-3 text-[11px] whitespace-nowrap">{memo.department.replace(" & Advisory", "").replace(" & Compliance", "")}</td>
                  <td className="py-3 px-3 text-slate-600">{memo.initiator.name}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    ${memo.amountRequested.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      memo.status === RequestStatus.PAID || memo.status === RequestStatus.RELEASED || memo.status === RequestStatus.COMPLETED
                        ? "bg-green-100 text-green-800 border border-green-200/50"
                        : memo.status === RequestStatus.REJECTED
                        ? "bg-red-100 text-red-800 border border-red-200/50"
                        : "bg-amber-100 text-amber-800 border border-amber-200/50"
                    }`}>
                      {memo.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">{memo.dateCreated}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium italic">
                    No active requests matched current criteria parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Closing declaration (formal print layout style) */}
        <div className="mt-12 pt-8 border-t border-slate-400 grid grid-cols-2 gap-8">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ledger Certified By:</span>
            <div className="mt-4 flex items-center gap-3">
              <img
                src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50'><path d='M10,25 Q30,10 50,30 T90,20 T130,25' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>"
                alt="David Vance Signature"
                className="max-h-10 opacity-75 inline"
                referrerPolicy="no-referrer"
              />
              <div>
                <strong className="text-xs text-slate-900 block font-display">David Vance, CICA</strong>
                <span className="text-[10px] text-slate-500 block">Chief Compliance & Internal Control Officer</span>
                <span className="text-[9px] font-mono text-slate-400">Fingerprint SHA: 28f9a2e</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Executive Authorization:</span>
            <div className="mt-4 flex items-center gap-3 justify-end">
              <div className="text-right">
                <strong className="text-xs text-slate-900 block font-display">Elizabeth Taylor</strong>
                <span className="text-[10px] text-slate-500 block">Executive Director, Markets</span>
                <span className="text-[9px] font-mono text-slate-400">Timestamp: 15-Jun-2026 @ 11:03 AM</span>
              </div>
              <img
                src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50'><path d='M10,15 Q60,5 50,40 T110,25 T140,35 M5,42 L145,28' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>"
                alt="Elizabeth Taylor Signature"
                className="max-h-10 opacity-75 inline"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
