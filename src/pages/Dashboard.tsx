import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Bell, ShieldAlert, Activity, Pill, FileText, ChevronRight, Upload, Calendar, CheckCircle, AlertCircle, Clock, Download } from "lucide-react";
import { useAuthStore, useNotificationStore } from "../lib/store";
import { API_ENDPOINTS } from "../config/api";

interface Bill {
  id: string;
  title: string;
  category: string;
  amount: number;
  billDate: string;
  status: string;
}

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
  details: any;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimEvents, setClaimEvents] = useState<Map<string, ClaimEvent[]>>(new Map());
  const [uploadingBill, setUploadingBill] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [billFormData, setBillFormData] = useState({
    title: "",
    category: "consultation",
    amount: "",
    billDate: new Date().toISOString().split("T")[0],
    description: "",
  });

  // Handle Escape key for notifications
  useEffect(() => {
    if (!showNotifications) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowNotifications(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showNotifications]);

  // Fetch user's bills and claims on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = useAuthStore.getState().token;
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch user's bills
        const billsRes = await fetch(
          API_ENDPOINTS.BILLS_MY,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch(() => null);

        if (billsRes?.ok) {
          const billsData = await billsRes.json();
          setBills(billsData);
        }

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
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        addNotification("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addNotification]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = useAuthStore.getState().token;
        if (!token) return;

        const [notifRes, countRes] = await Promise.all([
          fetch(API_ENDPOINTS.NOTIFICATIONS, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
          fetch(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
        ]);

        if (notifRes?.ok) {
          const data = await notifRes.json();
          setNotifications(Array.isArray(data) ? data : []);
        }
        if (countRes?.ok) {
          const data = await countRes.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (e) {
        console.error("Failed to fetch notifications", e);
      }
    };
    fetchNotifications();
  }, []);

  const handleUploadBill = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      addNotification("Please select a file to upload", "error");
      return;
    }

    // Validate file size (10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > MAX_FILE_SIZE) {
      addNotification("File size exceeds 10MB limit", "error");
      setSelectedFile(null);
      return;
    }

    if (!billFormData.title || !billFormData.amount || !billFormData.category) {
      addNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      setUploadingBill(true);
      // Get token from Zustand store (persisted in localStorage)
      const token = useAuthStore.getState().token;
      
      if (!token) {
        addNotification("Authentication token not found. Please login again.", "error");
        return;
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", billFormData.title);
      formData.append("category", billFormData.category);
      formData.append("amount", billFormData.amount);
      formData.append("billDate", billFormData.billDate);
      formData.append("description", billFormData.description);

      const savedHospitalStr = localStorage.getItem("claimEase_selectedHospital");
      if (savedHospitalStr) {
        try {
          const savedHospital = JSON.parse(savedHospitalStr);
          if (savedHospital.id) {
            formData.append("hospitalOrgId", savedHospital.id);
          }
        } catch (e) {
          // ignore parse error
        }
      }

      const response = await fetch(API_ENDPOINTS.BILLS_UPLOAD, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newBill = await response.json();
        setBills([newBill, ...bills]);
        setBillFormData({
          title: "",
          category: "consultation",
          amount: "",
          billDate: new Date().toISOString().split("T")[0],
          description: "",
        });
        setSelectedFile(null);
        addNotification("Bill uploaded successfully", "success");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload bill");
      }
    } catch (error) {
      console.error("Upload bill error:", error);
      addNotification(error instanceof Error ? error.message : "Failed to upload bill", "error");
    } finally {
      setUploadingBill(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Validate file type
      if ([".pdf", ".jpg", ".jpeg", ".png"].some(ext => file.name.toLowerCase().endsWith(ext) || file.type.includes(ext.slice(1)))) {
        setSelectedFile(file);
      } else {
        addNotification("Only PDF, JPG, or PNG files are allowed", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalBillAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const pendingClaims = claims.filter((c) => c.status === "submitted").length;
  const approvedClaims = claims.filter((c) => c.status === "approved").length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 pt-10 space-y-5 pb-28 bg-[#F6F9F9] min-h-screen relative"
    >
      {/* Notification Panel Overlay */}
      {showNotifications && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowNotifications(false)} />
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 right-4 left-4 max-w-md mx-auto bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden z-10"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-[16px] font-bold text-[#0B2239]">Notifications</h3>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-slate-400 hover:text-slate-600 text-[13px] font-semibold"
              >Close</button>
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell size={32} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-[14px] font-semibold text-slate-500">No notifications</p>
                  <p className="text-[12px] text-slate-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div key={notif.id} className={`px-5 py-3.5 border-b border-slate-50 ${!notif.isRead ? 'bg-[#F4FCFB]' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!notif.isRead ? 'bg-[#0D8B95]' : 'bg-slate-200'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#0B2239]">{notif.title || notif.message}</p>
                        {notif.body && <p className="text-[11px] text-slate-500 mt-0.5">{notif.body}</p>}
                        <p className="text-[10px] text-slate-400 mt-1">{notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-start mb-2">
        <div>
          <p className="text-[15px] font-medium text-slate-600 mb-0.5">Good morning,</p>
          <h1 className="text-[32px] font-extrabold text-[#0B2239] tracking-tight leading-none mb-1.5">{user?.firstName || "User"}</h1>
          <p className="text-[13px] text-slate-500">Take charge of your health, we've got your back.</p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={() => navigate("/messages")}
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 relative text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path><path d="M8 12h.01"></path><path d="M12 12h.01"></path><path d="M16 12h.01"></path></svg>
          </button>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 relative text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Bell size={22} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute top-[9px] right-[9px] w-2.5 h-2.5 bg-[#FF3B30] rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        <motion.div role="button" tabIndex={0} onClick={() => navigate("/bills")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/bills"); }} className="bg-white rounded-[20px] p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 flex items-center relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform focus:outline-none focus:ring-2 focus:ring-teal-500">
          <div className="w-[42px] h-[42px] bg-[#0D8B95] rounded-[14px] flex items-center justify-center text-white shrink-0 mr-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" fill="currentColor" fillOpacity="0.2"/><path d="M9 9h6"/><path d="M9 13h6"/><path d="M12 17L12 9"/></svg>
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-[#0D8B95] mb-0.5">Total Bills</p>
            <p className="text-[22px] font-bold text-[#0B2239] leading-none mb-1">₹{totalBillAmount.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400 font-medium">{bills.length} bills</p>
          </div>
          <div className="w-[22px] h-[22px] bg-[#E6F5F4] rounded-full flex items-center justify-center text-[#0D8B95] shrink-0 ml-1">
            <ChevronRight size={14} strokeWidth={3} />
          </div>
        </motion.div>

        <motion.div role="button" tabIndex={0} onClick={() => navigate("/claims")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/claims"); }} className="bg-white rounded-[20px] p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 flex items-center relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform focus:outline-none focus:ring-2 focus:ring-teal-500">
          <div className="w-[42px] h-[42px] bg-[#3B82F6] rounded-[14px] flex items-center justify-center text-white shrink-0 mr-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.2"/></svg>
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-[#3B82F6] mb-0.5">Active Claims</p>
            <p className="text-[22px] font-bold text-[#0B2239] leading-none mb-1">{claims.length}</p>
            <p className="text-[10px] text-slate-400 font-medium">{pendingClaims} pending, {approvedClaims} approved</p>
          </div>
          <div className="w-[22px] h-[22px] bg-[#EFF6FF] rounded-full flex items-center justify-center text-[#3B82F6] shrink-0 ml-1">
            <ChevronRight size={14} strokeWidth={3} />
          </div>
        </motion.div>
      </div>

      {/* Bill Upload Section */}
      <section className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/80">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-[46px] h-[46px] bg-[#E6F5F4] rounded-full flex items-center justify-center text-[#0D8B95]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 16 4-4 4 4"/></svg>
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-[#0B2239]">Upload Medical Bill</h2>
            <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Submit your bill details for quick processing</p>
          </div>
        </div>
        
        <form onSubmit={handleUploadBill} className="space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-bold text-[#0B2239] mb-1.5">Bill Title *</label>
              <input
                type="text"
                value={billFormData.title}
                onChange={(e) => setBillFormData({ ...billFormData, title: e.target.value })}
                placeholder="e.g., Consultation Charges"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] text-[#0B2239] placeholder:text-slate-400 focus:outline-none focus:border-[#0D8B95] focus:ring-1 focus:ring-[#0D8B95] transition-shadow"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#0B2239] mb-1.5">Category *</label>
              <div className="relative">
                <select
                  value={billFormData.category}
                  onChange={(e) => setBillFormData({ ...billFormData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] text-[#0B2239] focus:outline-none focus:border-[#0D8B95] focus:ring-1 focus:ring-[#0D8B95] appearance-none bg-white transition-shadow"
                >
                  <option value="consultation">Consultation</option>
                  <option value="surgery">Surgery</option>
                  <option value="medication">Medication</option>
                  <option value="tests">Tests / Lab</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-bold text-[#0B2239] mb-1.5">Amount (₹) *</label>
              <input
                type="number"
                value={billFormData.amount}
                onChange={(e) => setBillFormData({ ...billFormData, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] text-[#0B2239] placeholder:text-slate-400 focus:outline-none focus:border-[#0D8B95] focus:ring-1 focus:ring-[#0D8B95] transition-shadow"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#0B2239] mb-1.5">Date *</label>
              <div className="relative">
                <input
                  type="date"
                  value={billFormData.billDate}
                  onChange={(e) => setBillFormData({ ...billFormData, billDate: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl text-[13px] text-[#0B2239] focus:outline-none focus:border-[#0D8B95] focus:ring-1 focus:ring-[#0D8B95] appearance-none bg-white transition-shadow"
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 bg-white pl-2">
                  <Calendar size={16} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#0B2239] mb-1.5">Description</label>
            <textarea
              value={billFormData.description}
              onChange={(e) => setBillFormData({ ...billFormData, description: e.target.value })}
              placeholder="Add any additional details..."
              rows={2}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] text-[#0B2239] placeholder:text-slate-400 focus:outline-none focus:border-[#0D8B95] focus:ring-1 focus:ring-[#0D8B95] resize-none transition-shadow"
            />
          </div>

          {/* File Upload Field */}
          <div 
            className="border-[1.5px] border-dashed border-[#86D2C8] bg-[#F4FCFB] rounded-[16px] p-3 flex items-center justify-between transition-colors hover:border-[#0D8B95]"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
             <div className="flex items-center gap-3">
               <div className="w-[38px] h-[38px] bg-[#0D8B95] rounded-[10px] flex items-center justify-center text-white shrink-0">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>
               </div>
               <div className="flex flex-col justify-center max-w-[120px] sm:max-w-[200px]">
                 <p className="text-[13px] font-bold text-[#0B2239] truncate">
                   {selectedFile ? selectedFile.name : "Upload Bill"}
                 </p>
                 <p className="text-[10px] font-medium text-slate-500 truncate">JPG, PNG or PDF (Max. 5MB)</p>
               </div>
             </div>
             <button 
               type="button" 
               className="text-[#0D8B95] border-[1.5px] border-[#0D8B95] px-3.5 py-1.5 rounded-[10px] text-[12px] font-bold bg-white active:scale-95 transition-transform shrink-0" 
               onClick={() => document.getElementById('fileInput')?.click()}
             >
               {selectedFile ? "Change" : "Choose File"}
             </button>
             <input type="file" id="fileInput" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          </div>

          <button
            type="submit"
            disabled={uploadingBill}
            className="w-full bg-[#0D8B95] hover:bg-[#0A7A83] disabled:opacity-70 text-white font-bold py-3.5 rounded-[14px] text-[15px] transition-colors flex items-center justify-center gap-2 mt-2 shadow-[0_4px_14px_rgba(13,139,149,0.25)]"
          >
            {uploadingBill ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : "Submit Bill"}
          </button>
        </form>
      </section>

      {/* Need Help Banner */}
      <div onClick={() => navigate("/guidelines")} className="bg-white border border-slate-100/80 rounded-[18px] p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:border-teal-100 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0D8B95] rounded-full flex items-center justify-center text-white font-serif italic font-bold text-lg shrink-0">i</div>
          <div>
            <p className="text-[14px] font-bold text-[#0B2239]">Need help?</p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Check our guidelines for valid bill requirements.</p>
          </div>
        </div>
        <div className="text-[#0D8B95] text-[12px] font-bold flex items-center gap-0.5 shrink-0 ml-2">
          View Guidelines <ChevronRight size={14} strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Existing content shifted below... */}
      {claims.length > 0 && (
        <section className="mt-8">
          <h3 className="text-[17px] font-bold text-[#0B2239] mb-4">Recent Claims</h3>
          <div className="space-y-3">
            {claims.slice(0, 3).map((claim) => (
              <div key={claim.id} className="bg-white rounded-[20px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
                <div className="flex justify-between items-center mb-3">
                   <div className="flex items-center gap-3">
                     <div className={`w-[38px] h-[38px] rounded-[12px] flex items-center justify-center ${
                        claim.status === "approved" ? "bg-[#E6F5F4] text-[#0D8B95]" : 
                        claim.status === "rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-500"
                     }`}>
                       {claim.status === "approved" ? <CheckCircle size={20} strokeWidth={2.5} /> :
                        claim.status === "rejected" ? <AlertCircle size={20} strokeWidth={2.5} /> :
                        <Clock size={20} strokeWidth={2.5} />}
                     </div>
                     <div>
                       <h4 className="font-bold text-[#0B2239] text-[14px]">Claim #{claim.claimNumber}</h4>
                       <p className="text-[11px] font-medium text-slate-400">{new Date(claim.submittedAt).toLocaleDateString()}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-[#0B2239] text-[15px]">₹{claim.totalAmount.toLocaleString('en-IN')}</p>
                     <p className={`text-[10px] font-bold uppercase tracking-wider ${
                        claim.status === "approved" ? "text-[#0D8B95]" : 
                        claim.status === "rejected" ? "text-red-500" : "text-amber-500"
                     }`}>{claim.status}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
