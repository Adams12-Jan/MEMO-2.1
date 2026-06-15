/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Mail, MailOpen, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { EmailNotification } from "../types";

interface NotificationCenterProps {
  notifications: EmailNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  actingUserEmail: string;
  onSelectMemoByRef: (ref: string) => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onClearAll,
  actingUserEmail,
  onSelectMemoByRef
}: NotificationCenterProps) {
  
  // Filter notifications sent specifically to the currently acting user
  const myNotifications = notifications.filter(
    (n) => n.to.toLowerCase() === actingUserEmail.toLowerCase()
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm h-full flex flex-col" id="notification-center">
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center bg-radial from-slate-800 to-slate-950">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-amber-400" />
          <h3 className="font-display font-semibold text-sm">Simulated Corporate Email Inbox</h3>
        </div>
        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-semibold py-0.5 px-2 rounded border border-amber-500/30">
          {actingUserEmail}
        </span>
      </div>

      <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-xs">
        <span className="text-slate-500 font-medium">
          {myNotifications.length === 0 ? "No active notifications" : `${myNotifications.filter(n => !n.read).length} unread email triggers`}
        </span>
        {myNotifications.length > 0 && (
          <button
            id="btn-clear-notifications"
            type="button"
            onClick={onClearAll}
            className="text-amber-700 hover:text-amber-900 font-semibold text-xs bg-transparent border-none cursor-pointer"
          >
            Clear Inbox Log
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-[180px] max-h-[380px] lg:max-h-[none]">
        {myNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 h-full">
            <MailOpen size={32} className="stroke-1 mb-2 text-slate-300" />
            <p className="text-xs font-medium">Inbox Empty</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              No automated alerts received for this role profile yet. Maintain the workflows to trigger notifications.
            </p>
          </div>
        ) : (
          myNotifications.map((notif) => {
            const isRead = notif.read;
            const isAlert = notif.subject.includes("Action Required");
            
            return (
              <div
                id={`notification-${notif.id}`}
                key={notif.id}
                onClick={() => {
                  onMarkAsRead(notif.id);
                  if (notif.memosRef) {
                    onSelectMemoByRef(notif.memosRef);
                  }
                }}
                className={`p-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors relative flex gap-3 items-start ${
                  !isRead ? "bg-amber-50/15 font-medium border-l-2 border-amber-500" : ""
                }`}
              >
                <div className="mt-0.5">
                  {isAlert ? (
                    <AlertCircle size={14} className="text-amber-600 shrink-0" />
                  ) : notif.subject.includes("Disbursed") || notif.subject.includes("Approved") ? (
                    <CheckCircle size={14} className="text-green-600 shrink-0" />
                  ) : (
                    <Clock size={14} className="text-slate-500 shrink-0" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2 mb-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
                      Internal Server SMTP Mailer
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {notif.time}
                    </span>
                  </div>
                  <h4 className={`text-xs text-slate-800 tracking-tight ${!isRead ? "font-semibold" : ""}`}>
                    {notif.subject}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-normal select-none leading-relaxed">
                    {notif.body}
                  </p>
                  
                  {notif.memosRef && (
                    <div className="mt-2 text-[10px] font-mono text-amber-800 hover:underline flex items-center gap-1 font-semibold">
                      <span>📌 View Document:</span>
                      <span className="bg-amber-100 px-1 py-0.5 rounded text-[9px] font-bold text-amber-900 border border-amber-200/50">
                        {notif.memosRef}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 bg-amber-50/50 border-t border-slate-100 text-[10px] text-slate-500 no-print">
        <p className="text-center font-medium">
          ⚙️ Live Simulation: Try switching user accounts from the top bar to test notifications on downstream roles.
        </p>
      </div>
    </div>
  );
}
