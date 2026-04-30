import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, Microscope, Pill, Stethoscope, FileText, ChevronRight, X, Download, Receipt, AlertCircle, Clock, Loader2, ShieldCheck } from "lucide-react";
import { useNotificationStore, useAuthStore } from "../lib/store";
import { API_ENDPOINTS } from "../config/api";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

interface Bill {
  id: string;
  title: string;
  category: string;
  amount: number;
  billDate: string;
  status: string;
  description?: string;
  receiptUrl?: string;
  createdAt?: string;
}

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isFullScreenReceipt, setIsFullScreenReceipt] = useState(false);
  const [insurers, setInsurers] = useState<any[]>([]);
  const [userClaims, setUserClaims] = useState<any[]>([]);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [selectedInsurerId, setSelectedInsurerId] = useState("");
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = useAuthStore.getState().token;
        if (!token) {
          addNotification("Please log in to view your bills.", "error");
          return;
        }
        
        // Fetch bills, claims, and insurers in parallel
        const [billsRes, claimsRes, insurersRes] = await Promise.all([
          fetch(API_ENDPOINTS.BILLS_MY, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(API_ENDPOINTS.CLAIMS_MY, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(API_ENDPOINTS.ORGANIZATIONS_INSURANCE, { headers: { Authorization: `Bearer ${token}` } })
        ]).catch(() => [null, null, null]);

        if (billsRes?.ok) {
          const billsData = await billsRes.json();
          setBills(billsData);
        }
        
        if (claimsRes?.ok) {
          const claimsData = await claimsRes.json();
          setUserClaims(claimsData);
        }

        if (insurersRes?.ok) {
          const insurersData = await insurersRes.json();
          const orgsArray = Array.isArray(insurersData) ? insurersData : (insurersData.organizations || []);
          setInsurers(orgsArray);
          if (orgsArray.length > 0) setSelectedInsurerId(orgsArray[0].id || orgsArray[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        addNotification("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [addNotification]);

  const categories = ["All", "consultation", "surgery", "medication", "tests", "imaging", "other"];
  
  const filteredBills = bills
    .filter(b => filter === "All" || b.category === filter)
    .filter(b => !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.category.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleClaimSubmission = async (billId: string) => {
    if (!selectedInsurerId) {
      addNotification("Please select an insurance provider", "error");
      return;
    }

    try {
      setIsSubmittingClaim(true);
      const token = useAuthStore.getState().token;
      if (!token) {
        addNotification("Authentication token not found. Please login again.", "error");
        return;
      }
      const response = await fetch(API_ENDPOINTS.CLAIMS, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          billId,
          insuranceOrgId: selectedInsurerId
        })
      });

      if (response.ok) {
        addNotification("Claim submitted successfully!", "success");
        // Update user claims list
        const newClaim = await response.json();
        setUserClaims([...userClaims, newClaim]);
        setSelectedBill(null);
        navigate("/claims");
      } else {
        const error = await response.json();
        addNotification(error.error || "Failed to submit claim", "error");
      }
    } catch (error) {
      console.error("Claim submission error", error);
      addNotification("Network error. Please try again.", "error");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const navigate = useNavigate();

  const downloadBillPDF = (bill: Bill) => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Medical Bill Receipt", pageWidth / 2, yPosition, { align: "center" });

      yPosition += 15;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("ClaimEase Healthcare Platform", pageWidth / 2, yPosition, { align: "center" });

      // Divider
      yPosition += 15;
      pdf.setDrawColor(200);
      pdf.line(15, yPosition, pageWidth - 15, yPosition);

      // Bill Info
      yPosition += 10;
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Bill Information", 20, yPosition);

      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Bill ID: #${bill.id.substring(0, 8).toUpperCase()}`, 20, yPosition);

      yPosition += 6;
      pdf.text(`Date: ${new Date(bill.billDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, yPosition);

      yPosition += 6;
      pdf.text(`Title: ${bill.title}`, 20, yPosition);

      yPosition += 6;
      pdf.text(`Category: ${bill.category.charAt(0).toUpperCase() + bill.category.slice(1)}`, 20, yPosition);

      yPosition += 6;
      pdf.text(`Status: ${bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}`, 20, yPosition);

      // Amount Section
      yPosition += 12;
      pdf.setFillColor(240, 253, 250);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 15, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(`Total Amount: ₹${bill.amount.toLocaleString('en-IN')}`, pageWidth / 2, yPosition + 5, { align: "center" });

      // Description if available
      if (bill.description) {
        yPosition += 25;
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("Description:", 20, yPosition);

        yPosition += 6;
        pdf.setFont("helvetica", "normal");
        const splitText = pdf.splitTextToSize(bill.description, pageWidth - 40);
        pdf.text(splitText, 20, yPosition);
      }

      // Footer
      yPosition = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(150);
      pdf.text(`Downloaded on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, pageWidth / 2, yPosition, { align: "center" });

      pdf.save(`bill-${bill.id.substring(0, 8)}.pdf`);
      addNotification("Bill downloaded successfully!", "success");
    } catch (error) {
      console.error("Failed to download bill", error);
      addNotification("Failed to download bill", "error");
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
      className="p-6 pt-12 space-y-6 pb-24 bg-gray-50 min-h-screen"
    >
      <header>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Bill Wallet</h1>
        <p className="text-sm text-slate-500">Manage and track your medical expenses.</p>
      </header>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search bills..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
        <button className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
          <Filter size={18} />
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === cat 
                ? 'bg-teal-700 text-white shadow-md shadow-teal-900/10' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {filteredBills.map((bill: Bill, i: number) => (
          <motion.div 
            key={bill.id}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-10px" }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
            onClick={() => setSelectedBill(bill)}
            className={`p-4 rounded-2xl flex items-center justify-between shadow-sm border cursor-pointer hover:border-teal-100 active:scale-[0.98] transition-all relative overflow-hidden ${
              bill.status === 'rejected' ? 'bg-rose-50/30 border-rose-100' :
              bill.status === 'submitted' ? 'bg-amber-50/30 border-amber-100' :
              'bg-white border-slate-100'
            }`}
          >
            {/* Subtle left border highlight */}
            {(bill.status === 'rejected' || bill.status === 'submitted') && (
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                bill.status === 'rejected' ? 'bg-rose-400' : 'bg-amber-400'
              }`} />
            )}
            
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                bill.category === 'tests' ? 'bg-blue-50 text-blue-600' :
                bill.category === 'medication' ? 'bg-purple-50 text-purple-600' :
                bill.category === 'surgery' ? 'bg-red-50 text-red-600' :
                bill.category === 'imaging' ? 'bg-orange-50 text-orange-600' :
                'bg-emerald-50 text-emerald-600'
              }`}>
                {bill.category === 'tests' ? <Microscope size={24} /> :
                 bill.category === 'medication' ? <Pill size={24} /> :
                 <Stethoscope size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-medium text-slate-800 text-sm">{bill.title}</h4>
                  {bill.status === 'rejected' && <AlertCircle size={14} className="text-rose-500" />}
                  {bill.status === 'submitted' && <Clock size={14} className="text-amber-500" />}
                </div>
                <p className="text-xs text-slate-500">{new Date(bill.billDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold text-slate-800">₹{bill.amount.toLocaleString('en-IN')}</p>
                <p className={`text-[10px] font-medium uppercase tracking-wider ${
                  bill.status === 'verified' ? 'text-emerald-500' :
                  bill.status === 'submitted' ? 'text-amber-500' :
                  'text-rose-500'
                }`}>
                  {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                </p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </motion.div>
        ))}
        {filteredBills.length === 0 && (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No bills found</p>
            <p className="text-sm text-slate-400 mt-1">Try uploading a bill from the Dashboard.</p>
          </div>
        )}
      </div>

      {/* Bill Details Modal / Bottom Sheet */}
      <AnimatePresence>
        {selectedBill && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelectedBill(null)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 pb-safe shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center">
                    <Receipt size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Bill Details</h3>
                </div>
                <button 
                  onClick={() => setSelectedBill(null)} 
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="text-center pb-6 border-b border-slate-100 border-dashed">
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">₹{selectedBill.amount.toLocaleString('en-IN')}</h2>
                  <p className="text-slate-500 text-sm">{selectedBill.title}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-slate-50 border border-slate-100">
                    <span className={`w-2 h-2 rounded-full ${
                      selectedBill.status === 'verified' ? 'bg-emerald-500' :
                      selectedBill.status === 'submitted' ? 'bg-amber-500' :
                      'bg-rose-500'
                    }`}></span>
                    <span className={
                      selectedBill.status === 'verified' ? 'text-emerald-700' :
                      selectedBill.status === 'submitted' ? 'text-amber-700' :
                      'text-rose-700'
                    }>{selectedBill.status.charAt(0).toUpperCase() + selectedBill.status.slice(1)}</span>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-4">
                  <DetailRow label="Date" value={new Date(selectedBill.billDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                  <DetailRow label="Bill ID" value={`#${selectedBill.id.substring(0, 8).toUpperCase()}`} />
                  <DetailRow label="Category" value={selectedBill.category.charAt(0).toUpperCase() + selectedBill.category.slice(1)} />
                  
                  {selectedBill.description && (
                    <DetailRow label="Description" value={selectedBill.description} />
                  )}
                  
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-slate-800">Amount</span>
                      <span className="font-bold text-slate-800">₹{selectedBill.amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Receipt Image */}
                {selectedBill.receiptUrl && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Attached Receipt</h4>
                    <div 
                      className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative aspect-[3/4] max-h-64 mx-auto cursor-pointer group"
                      onClick={() => setIsFullScreenReceipt(true)}
                    >
                      {selectedBill.receiptUrl.toLowerCase().includes('.pdf') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                          <FileText size={48} className="text-rose-400" />
                          <span className="text-sm font-medium">PDF Document</span>
                          <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">Tap to view</span>
                        </div>
                      ) : (
                        <>
                          <img 
                            src={selectedBill.receiptUrl} 
                            alt="Bill Receipt" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">Tap to expand</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  {/* Show Submit to Insurance if no claim exists for this bill */}
                  {!userClaims.some(c => c.billId === selectedBill.id) ? (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Insurance Provider</label>
                      <select 
                        value={selectedInsurerId}
                        onChange={(e) => setSelectedInsurerId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      >
                        {insurers.map(ins => (
                          <option key={ins.id || ins._id} value={ins.id || ins._id}>{ins.name}</option>
                        ))}
                        {insurers.length === 0 && <option value="">No insurers available</option>}
                      </select>
                      <button 
                        disabled={isSubmittingClaim || insurers.length === 0}
                        onClick={() => handleClaimSubmission(selectedBill.id)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-900/10 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {isSubmittingClaim ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                        Submit to Insurance
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setSelectedBill(null);
                        navigate('/claims');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-900/10 transition-all"
                    >
                      <ShieldCheck size={18} /> View Claim Status
                    </button>
                  )}

                  <button 
                    onClick={() => downloadBillPDF(selectedBill)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors border border-teal-100"
                  >
                    <Download size={18} /> Download Receipt PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Receipt Modal */}
      <AnimatePresence>
        {isFullScreenReceipt && selectedBill?.receiptUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex flex-col"
          >
            <div className="flex justify-between items-center p-4 text-white">
              <h3 className="font-medium truncate pr-4">{selectedBill.title} Receipt</h3>
              <button 
                onClick={() => setIsFullScreenReceipt(false)}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden relative p-4 flex items-center justify-center">
              {selectedBill.receiptUrl.toLowerCase().includes('.pdf') ? (
                <iframe 
                  src={selectedBill.receiptUrl} 
                  className="w-full h-full rounded-xl bg-white"
                  title="PDF Receipt"
                />
              ) : (
                <img 
                  src={selectedBill.receiptUrl} 
                  alt="Full screen receipt" 
                  className="max-w-full max-h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
