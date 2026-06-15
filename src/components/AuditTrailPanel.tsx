/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, ShieldAlert, Filter, Clock } from "lucide-react";
import { AuditLog } from "../types";

interface AuditTrailPanelProps {
  logs: AuditLog[];
}

export default function AuditTrailPanel({ logs }: AuditTrailPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.memoRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);
    
    const matchesRole = !selectedRole || log.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="audit-trail-panel">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-500" />
            Compliance Ledger & Zero-Trust Audit Log
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic ledger tracking user action footprints, system logs, and signature hashes.
          </p>
        </div>
        
        {/* Total stats */}
        <span className="text-[10px] bg-slate-200 text-slate-700 font-mono font-semibold py-1 px-2.5 rounded-full border border-slate-300">
          Total Logs: {logs.length} operations
        </span>
      </div>

      {/* Filters bar */}
      <div className="p-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            id="audit-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by User, Action, Memo ID, or IP..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 rounded-lg transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <select
            id="audit-role-filter"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">-- All Active Roles --</option>
            <option value="Initiator">Initiators</option>
            <option value="Line Manager">Line Managers</option>
            <option value="Internal Control Officer">Internal Control</option>
            <option value="Executive Director">Executive Directors</option>
            <option value="Finance Unit">Finance Units</option>
          </select>
        </div>
      </div>

      {/* Grid listing */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-500">
              <th className="py-3 px-4 font-semibold">User Acting</th>
              <th className="py-3 px-4 font-semibold">Role Designation</th>
              <th className="py-3 px-4 font-semibold">Activity Ledger Description</th>
              <th className="py-3 px-4 font-semibold">Docket Association</th>
              <th className="py-3 px-4 font-semibold">IP Origin</th>
              <th className="py-3 px-4 font-semibold">Date / Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  No matching log entries found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{log.user}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[10px]">
                    <span className="bg-slate-100 border border-slate-200/60 rounded px-1.5 py-0.5 text-slate-600 block w-max">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-700 font-medium">{log.action}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                      {log.memoRef}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {log.ipAddress}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock size={12} className="text-slate-400" />
                      <span>{log.date} @ {log.time}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
