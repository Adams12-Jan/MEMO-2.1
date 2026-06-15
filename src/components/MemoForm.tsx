/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Trash, Check, Save, FileText, Landmark, Users, Calendar, AlertTriangle, Coins, FileCheck } from "lucide-react";
import { RequestType, RequestStatus, MemoRequest, ExpenseItem, UserProfile } from "../types";

interface MemoFormProps {
  actingUser: UserProfile;
  releasedAdvances: MemoRequest[]; // All active released cash advances for retirement reference
  onSaveDraft: (formData: Partial<MemoRequest>) => void;
  onSubmit: (formData: Partial<MemoRequest>) => void;
  onCancel: () => void;
  initialData?: MemoRequest | null;
}

export default function MemoForm({
  actingUser,
  releasedAdvances,
  onSaveDraft,
  onSubmit,
  onCancel,
  initialData,
}: MemoFormProps) {
  const [type, setType] = useState<RequestType>(initialData?.type || RequestType.MEMO);
  const [title, setTitle] = useState(initialData?.title || "");
  const [department, setDepartment] = useState(initialData?.department || actingUser.department);
  const [purpose, setPurpose] = useState(initialData?.purpose || "");
  const [amountRequested, setAmountRequested] = useState<number>(initialData?.amountRequested || 0);
  const [vendorInfo, setVendorInfo] = useState(initialData?.vendorInfo || "");
  const [paymentDetails, setPaymentDetails] = useState(
    initialData?.paymentDetails || `${actingUser.name} - GTBank Account No: 0142273812`
  );
  const [priorityLevel, setPriorityLevel] = useState<"Low" | "Medium" | "High">(initialData?.priorityLevel || "Medium");
  
  // File Upload Sim (Module 1, 8, 9)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string }[]>(
    initialData?.supportingDocs || []
  );
  const [dragging, setDragging] = useState(false);

  // Cash Advance specific
  const [periodCovered, setPeriodCovered] = useState(initialData?.periodCovered || "");

  // Retirement specific
  const [selectedAdvanceRef, setSelectedAdvanceRef] = useState(initialData?.cashAdvanceRefNo || "");
  const [amountCollected, setAmountCollected] = useState<number>(initialData?.amountCollected || 0);
  const [amountUtilized, setAmountUtilized] = useState<number>(initialData?.amountUtilized || 0);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseItem[]>(
    initialData?.expenseBreakdown || [
      { id: "1", category: "Transport & Logistics", amount: 0, description: "" }
    ]
  );
  const [receiptsAttachmentName, setReceiptsAttachmentName] = useState(
    initialData?.receiptsAttachmentName || ""
  );

  // Auto-fill retirement collected value if active advance reference is selected
  useEffect(() => {
    if (type === RequestType.RETIREMENT && selectedAdvanceRef) {
      const match = releasedAdvances.find((adv) => adv.refNo === selectedAdvanceRef);
      if (match) {
        setAmountCollected(match.amountRequested);
        setTitle(`Retirement: ${match.title}`);
        setPurpose(`Retirement of cash advance reference ${match.refNo} for: ${match.purpose}`);
        const totalUti = expenseBreakdown.reduce((sum, item) => sum + item.amount, 0);
        if (totalUti === 0) {
          setAmountUtilized(match.amountRequested);
        }
      }
    }
  }, [selectedAdvanceRef, type]);

  // Recalculate amountUtilized whenever expense breakdowns change
  useEffect(() => {
    const totalUti = expenseBreakdown.reduce((sum, item) => sum + item.amount, 0);
    setAmountUtilized(totalUti);
    if (type === RequestType.RETIREMENT) {
      setAmountRequested(totalUti);
    }
  }, [expenseBreakdown, type]);

  const handleAddExpenseRow = () => {
    setExpenseBreakdown([
      ...expenseBreakdown,
      { id: Date.now().toString(), category: "Misc Business Expenses", amount: 0, description: "" }
    ]);
  };

  const handleRemoveExpenseRow = (id: string) => {
    if (expenseBreakdown.length > 1) {
      setExpenseBreakdown(expenseBreakdown.filter((item) => item.id !== id));
    }
  };

  const handleExpenseChange = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenseBreakdown(
      expenseBreakdown.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Support drag-and-drop file upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    addSimulatedFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = (e.target.files ? Array.from(e.target.files) : []) as File[];
    addSimulatedFiles(files);
  };

  const addSimulatedFiles = (files: File[]) => {
    const newFiles = files.map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const removeUploadedFile = (idx: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx));
  };

  const gatherFormData = () => {
    const base: Partial<MemoRequest> = {
      title,
      department,
      type,
      purpose,
      amountRequested: Number(amountRequested),
      paymentDetails,
      priorityLevel,
      supportingDocs: uploadedFiles,
    };

    if (type === RequestType.MEMO) {
      base.vendorInfo = vendorInfo;
    }

    if (type === RequestType.CASH_ADVANCE) {
      base.periodCovered = periodCovered;
    }

    if (type === RequestType.RETIREMENT) {
      base.cashAdvanceRefNo = selectedAdvanceRef;
      base.amountCollected = Number(amountCollected);
      base.amountUtilized = Number(amountUtilized);
      base.balanceReturned = Math.max(0, Number(amountCollected) - Number(amountUtilized));
      base.expenseBreakdown = expenseBreakdown;
      base.receiptsAttachmentName = receiptsAttachmentName || (uploadedFiles[0]?.name || "Receipt_Invoices.pdf");
      base.amountRequested = Number(amountCollected); // Retirement checks the full amount
    }

    return base;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSaveDraft(gatherFormData());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !purpose.trim()) {
      alert("Please enter a Title and Purpose / Description.");
      return;
    }
    
    if (type === RequestType.RETIREMENT && !selectedAdvanceRef) {
      alert("Please select a valid released Cash Advance Reference Number.");
      return;
    }

    if (type === RequestType.RETIREMENT && expenseBreakdown.some(e => e.amount <= 0 || !e.description.trim())) {
      alert("Please fill in the expense items details and positive cost amounts.");
      return;
    }

    onSubmit(gatherFormData());
  };

  const balanceReturned = Math.max(0, amountCollected - amountUtilized);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md max-w-4xl mx-auto" id="memo-form-container">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between bg-radial from-slate-800 to-slate-950">
        <div>
          <h2 className="text-lg font-display font-semibold text-white tracking-tight flex items-center gap-2">
            <FileText className="text-amber-400" />
            {initialData ? `Edit Draft Request: ${initialData.refNo}` : "Initiate Corporate Ledger Claim"}
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Vetiva Capital Management Group Internal Approval Docket
          </p>
        </div>
        <span className="text-xs bg-slate-800 border border-slate-700 font-semibold px-3 py-1 rounded-full text-amber-500">
          Initiator: {actingUser.name}
        </span>
      </div>

      <form className="p-6 space-y-6">
        {/* Row 1: Request Type & Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5" id="field-request-type">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Transaction Claim Category *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[RequestType.MEMO, RequestType.CASH_ADVANCE, RequestType.RETIREMENT].map((rType) => (
                <button
                  id={`btn-select-type-${rType.replace(/\s+/g, "-").toLowerCase()}`}
                  key={rType}
                  type="button"
                  onClick={() => setType(rType)}
                  className={`py-2 px-3 text-2xs md:text-xs font-semibold rounded-lg border-2 transition-all text-center ${
                    type === rType
                      ? "border-amber-500 bg-amber-500/10 text-amber-900"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {rType}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Department Office *
            </label>
            <select
              id="form-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="Corporate Finance & Advisory">Corporate Finance & Advisory</option>
              <option value="Asset Management">Asset Management</option>
              <option value="Wealth Management">Wealth Management</option>
              <option value="Securities & Brokerage">Securities & Brokerage</option>
              <option value="Internal Control & Compliance">Internal Control & Compliance</option>
              <option value="Finance & Operations">Finance & Operations</option>
              <option value="Executive Suite">Executive Suite</option>
            </select>
          </div>
        </div>

        {/* Dynamic Fields Based on Type */}
        {type === RequestType.RETIREMENT && (
          <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-200/50 space-y-4" id="retirement-specific-fields">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs border-b border-amber-200/50 pb-2 mb-2">
              <Coins size={14} className="text-amber-700" />
              Cash Advance Retirement Audit Integration
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Select Released Cash Advance *
                </label>
                <select
                  id="select-released-advance"
                  value={selectedAdvanceRef}
                  onChange={(e) => {
                    setSelectedAdvanceRef(e.target.value);
                  }}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Choose Released Advance --</option>
                  {releasedAdvances.map((adv) => (
                    <option key={adv.id} value={adv.refNo}>
                      {adv.refNo} - {adv.title} (${adv.amountRequested})
                    </option>
                  ))}
                  {releasedAdvances.length === 0 && (
                    <option disabled value="">No active released cash advances found from John Doe</option>
                  )}
                </select>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Connect this retirement ledger with past cash advance releases.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Amount Collected
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono font-semibold">$</span>
                    <input
                      id="retirement-amount-collected"
                      type="number"
                      readOnly
                      value={amountCollected}
                      className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg py-2 pl-7 pr-3 focus:outline-none font-semibold text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Refund Due
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono font-semibold">$</span>
                    <input
                      id="retirement-balance-returned"
                      type="number"
                      disabled
                      value={balanceReturned}
                      className={`w-full text-xs border rounded-lg py-2 pl-7 pr-3 focus:outline-none font-bold ${
                        balanceReturned > 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-100 border-slate-200 text-slate-500"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Expense Breakdown Table (Module 9) */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Expense Utilization Breakdown *</span>
                <button
                  id="btn-add-expense-row"
                  type="button"
                  onClick={handleAddExpenseRow}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Add Row Item
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 text-left w-1/3">Expense Category</th>
                      <th className="py-2.5 px-3 text-left w-1/4">Amount ($)</th>
                      <th className="py-2.5 px-3 text-left">Description / Voucher Details</th>
                      <th className="py-2.5 px-3 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenseBreakdown.map((item, index) => (
                      <tr key={item.id}>
                        <td className="p-2">
                          <select
                            id={`expense-cat-${index}`}
                            value={item.category}
                            onChange={(e) => handleExpenseChange(item.id, "category", e.target.value)}
                            className="bg-white border border-slate-200 rounded py-1 px-1.5 w-full text-xs"
                          >
                            <option value="Transport & Logistics">Transport & Logistics</option>
                            <option value="Catering & Protocol">Catering & Protocol</option>
                            <option value="Secretarial & Binding">Secretarial & Binding</option>
                            <option value="Regulatory Filing">Regulatory Filing</option>
                            <option value="Client Development">Client Development</option>
                            <option value="Misc Business Expenses">Misc Business Expenses</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <div className="relative">
                            <span className="absolute left-1.5 top-1.5 text-xs text-slate-400">$</span>
                            <input
                              id={`expense-amount-${index}`}
                              type="number"
                              value={item.amount || ""}
                              onChange={(e) => handleExpenseChange(item.id, "amount", parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="border border-slate-200 rounded py-1 pl-4 pr-1.5 w-full text-xs text-right font-mono"
                            />
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            id={`expense-desc-${index}`}
                            type="text"
                            value={item.description}
                            onChange={(e) => handleExpenseChange(item.id, "description", e.target.value)}
                            placeholder="Describe physical receipt/voucher particulars"
                            className="border border-slate-200 rounded py-1 px-2 w-full text-xs"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            id={`btn-remove-expense-${index}`}
                            type="button"
                            onClick={() => handleRemoveExpenseRow(item.id)}
                            disabled={expenseBreakdown.length === 1}
                            className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                          >
                            <Trash size={14} className="mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between text-xs px-3 py-2 bg-slate-50 border-t border-slate-100 font-semibold rounded-b-lg">
                <span className="text-slate-500">Total Utilized Amount (calculated):</span>
                <span className="text-slate-950 font-mono">${amountUtilized}</span>
              </div>
            </div>
          </div>
        )}

        {/* Normal Memos & Cash Advances fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Request Header / Title *
            </label>
            <input
              id="form-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === RequestType.CASH_ADVANCE
                  ? "e.g. Due Diligence Site Trip - GreenPower Solar Plant"
                  : "e.g. Subscription for Bloomberg Terminal Licences Q3 2026"
              }
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {type === RequestType.CASH_ADVANCE && (
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Duty Period Covered *
                </label>
                <input
                  id="form-period"
                  type="text"
                  required
                  value={periodCovered}
                  onChange={(e) => setPeriodCovered(e.target.value)}
                  placeholder="e.g. 18-Jun-2026 to 22-Jun-2026"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {type === RequestType.MEMO && (
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Third Party Vendor (if applicable)
                </label>
                <input
                  id="form-vendor"
                  type="text"
                  value={vendorInfo}
                  onChange={(e) => setVendorInfo(e.target.value)}
                  placeholder="e.g. Bloomberg Finance L.P."
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            <div className={`space-y-1.5 ${type === RequestType.RETIREMENT ? "col-span-2" : "col-span-1"}`}>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Amount Requested ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold font-mono">$</span>
                <input
                  id="form-amount"
                  type="number"
                  required
                  disabled={type === RequestType.RETIREMENT}
                  value={amountRequested || ""}
                  onChange={(e) => setAmountRequested(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full text-xs font-bold font-mono bg-white border border-slate-200 rounded-lg py-2 pl-7 pr-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Priority Allocation Level
              </label>
              <select
                id="form-priority"
                value={priorityLevel}
                onChange={(e) => setPriorityLevel(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Purpose / Core Project Justification *
            </label>
            <textarea
              id="form-purpose"
              required
              rows={4}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Provide exhaustive project details, operational reasons, and business justifications for this claim."
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Beneficiary Payment & Settlement Particulars *
            </label>
            <input
              id="form-payment-details"
              type="text"
              required
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              placeholder="e.g. Recipient Account Name, Bank, Account Number"
              className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Drag and Drop Supporting Docs uploading (Module 1/8/9) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Supporting Documentary Proofs (Vouchers, Quotations, Invoices)
          </label>
          <div
            id="drag-and-drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all relative ${
              dragging
                ? "border-amber-500 bg-amber-50/10"
                : "border-slate-200 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            <input
              id="form-file-picker"
              type="file"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Plus size={20} className="text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-600">Drag & drop files or click to upload</p>
            <p className="text-[10px] text-slate-400 mt-1">Conforms to organization compliance rules</p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 divide-y divide-slate-200 text-xs">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck size={14} className="text-green-600" />
                    <span className="font-medium text-slate-700">{f.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({f.size})</span>
                  </div>
                  <button
                    id={`btn-remove-attachment-${i}`}
                    type="button"
                    onClick={() => removeUploadedFile(i)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            id="btn-cancel-memo"
            type="button"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-800 text-xs font-semibold bg-transparent border-none cursor-pointer"
          >
            Cancel Claims Setup
          </button>
          
          <div className="flex gap-2">
            <button
              id="btn-save-draft"
              type="button"
              onClick={handleSave}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save size={14} />
              Save to Drafts Folder
            </button>
            <button
              id="btn-submit-for-approval"
              type="submit"
              onClick={handleSubmit}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 px-5 rounded-lg flex items-center gap-1.5 transition-shadow shadow-sm cursor-pointer"
            >
              <Check size={14} />
              Submit to Workflows
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
