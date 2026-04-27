import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Clock, CheckCircle2, FileText, ChevronRight, AlertCircle, Loader2, Download } from "lucide-react";
import { useNotificationStore } from "../lib/store";
import { API_ENDPOINTS } from "../config/api";

interface Claim {
  id: string;
  claimNumber: string;
  billId: string;
  totalAmount: number;
  status: string;
  submittedAt: string;
  approvedAmount?: number;
  rejectionReason?: string;
}

interface ClaimEvent {
  id: string;
  claimId: string;
  eventType: string;
  timestamp: string;
}

export default function Claims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimEvents, setClaimEvents] = useState<Map<string, ClaimEvent[]>>(new Map());
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch user's claims
        const claimsRes = await fetch(
          API_ENDPOINTS.CLAIMS_MY,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch(() => null);

        if (claimsRes?.ok) {
          const claimsData = await claimsRes.json();
          setClaims(claimsData);

          // Fetch events for each claim in parallel using Promise.all
          try {
            const eventPromises = claimsData.map((claim: Claim) =>
              fetch(
                `${API_ENDPOINTS.CLAIMS}/${claim.id}/events`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
                .then(res => res.ok ? res.json() : [])
                .catch(() => [])
            );

            const allEvents = await Promise.all(eventPromises);
            const eventsMap = new Map<string, ClaimEvent[]>();
            claimsData.forEach((claim: Claim, index: number) => {
              eventsMap.set(claim.id, allEvents[index] || []);
            });
            setClaimEvents(eventsMap);
          } catch (e) {
            console.error("Failed to fetch claim events", e);
          }
        } else {
          addNotification("Failed to load claims", "error");
        }
      } catch (error) {
        console.error("Failed to fetch claims", error);
        addNotification("Failed to load claims", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [addNotification]);

  const exportClaimsToCSV = () => {
    try {
      if (claims.length === 0) {
        addNotification("No claims to export", "error");
        return;
      }

      // CSV Header
      const headers = ["Claim ID", "Claim Number", "Bill ID", "Amount (₹)", "Status", "Submitted Date", "Approved Amount (₹)", "Rejection Reason"];
      
      // CSV Data Rows with proper RFC 4180 escaping
      const rows = claims.map(claim => [
        claim.id.substring(0, 8),
        claim.claimNumber,
        claim.billId.substring(0, 8),
        claim.totalAmount,
        claim.status.charAt(0).toUpperCase() + claim.status.slice(1),
        new Date(claim.submittedAt).toLocaleDateString('en-IN'),
        claim.approvedAmount || "N/A",
        claim.rejectionReason || "N/A"
      ]);

      // Escape CSV values - replace internal quotes with double quotes
      const escapedRows = rows.map(row =>
        row.map(cell => {
          const stringCell = String(cell);
          // If cell contains comma, newline, or quotes, wrap in quotes and escape internal quotes
          if (stringCell.includes('"') || stringCell.includes(',') || stringCell.includes('\n')) {
            return `"${stringCell.replace(/"/g, '""')}"`;
          }
          return `"${stringCell}"`;
        }).join(",")
      );

      // Combine headers and rows
      const csvContent = [
        headers.map(h => `"${h}"`).join(","),
        ...escapedRows
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", `claims-export-${new Date().getTime()}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup the object URL to prevent memory leak
      URL.revokeObjectURL(url);

      addNotification("Claims exported successfully!", "success");
    } catch (error) {
      console.error("Failed to export claims", error);
      addNotification("Failed to export claims", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 pt-12 pb-24 space-y-6 bg-gray-50 min-h-screen"
    >
      <div className="flex justify-between items-start">
        <header>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Claims Tracker</h1>
          <p className="text-sm text-slate-500">Monitor your insurance claim status in real-time.</p>
        </header>
        {claims.length > 0 && (
          <button
            onClick={exportClaimsToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={16} />
            Export CSV
          </button>
        )}
      </div>

      {claims.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <FileText className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-600 font-medium mb-2">No claims yet</p>
          <p className="text-slate-500 text-sm">Upload a bill from the Dashboard to create your first claim.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {claims.map((claim: Claim, i: number) => {
            const events = claimEvents.get(claim.id) || [];
            const statusColor = claim.status === "approved" 
              ? "emerald" 
              : claim.status === "rejected" 
              ? "red" 
              : "amber";

            return (
              <motion.div 
                key={claim.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 overflow-hidden"
              >
                {/* Top Section */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      statusColor === "emerald" ? "bg-emerald-50" :
                      statusColor === "red" ? "bg-red-50" :
                      "bg-amber-50"
                    }`}>
                      {statusColor === "emerald" ? (
                        <CheckCircle2 size={24} className="text-emerald-600" />
                      ) : statusColor === "red" ? (
                        <AlertCircle size={24} className="text-red-600" />
                      ) : (
                        <Clock size={24} className="text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base mb-1">Claim #{claim.claimNumber}</h3>
                      <p className="text-xs font-medium text-slate-400">
                        {new Date(claim.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-lg">₹{claim.totalAmount.toLocaleString('en-IN')}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full mt-1 ${
                      statusColor === "emerald" 
                        ? "text-emerald-600 bg-emerald-50" 
                        : statusColor === "red" 
                        ? "text-red-600 bg-red-50" 
                        : "text-amber-600 bg-amber-50"
                    }`}>
                      {statusColor === "emerald" ? <CheckCircle2 size={10} strokeWidth={3} /> :
                       statusColor === "red" ? <AlertCircle size={10} strokeWidth={3} /> :
                       <Clock size={10} strokeWidth={3} />} 
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Status Messages */}
                {claim.status === "rejected" && claim.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800">
                      <strong>Rejection Reason:</strong> {claim.rejectionReason}
                    </p>
                  </div>
                )}

                {claim.status === "approved" && claim.approvedAmount && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-emerald-800">
                      <strong>Approved Amount:</strong> ₹{claim.approvedAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}

                {/* Timeline */}
                {events.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-5 relative">
                    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                      {events.map((event, index) => (
                        <TimelineItem
                          key={event.id}
                          title={event.eventType.replace(/_/g, " ").charAt(0).toUpperCase() + event.eventType.replace(/_/g, " ").slice(1)}
                          date={new Date(event.timestamp).toLocaleDateString()}
                          status="completed"
                          icon={<CheckCircle2 size={12} strokeWidth={3} />}
                          isLast={index === events.length - 1}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* No events message */}
                {events.length === 0 && (
                  <div className="bg-slate-50 rounded-2xl p-4 text-center text-slate-500 text-sm">
                    No timeline events yet. Check back later for updates.
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function TimelineItem({ title, date, status, icon, isLast = false }: { title: string, date: string, status: 'completed' | 'current' | 'pending', icon: React.ReactNode, isLast?: boolean }) {
  return (
    <div className={`relative flex items-start group ${isLast ? '' : 'pb-6'}`}>
      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white z-10 shrink-0 mt-0.5 ${
        status === 'completed' ? 'border-teal-500 text-teal-500' :
        status === 'current' ? 'border-amber-500 text-amber-500 ring-4 ring-amber-100' :
        'border-slate-200 text-slate-300'
      }`}>
        {icon}
      </div>
      <div className="pl-4 flex-1">
        <h4 className={`text-sm font-bold ${status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>{title}</h4>
        <span className={`text-xs font-medium ${status === 'pending' ? 'text-slate-300' : status === 'current' ? 'text-amber-600' : 'text-slate-500'}`}>{date}</span>
      </div>
    </div>
  );
}
