import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, CreditCard, Plus, Trash2, Star, X, Loader2, Smartphone, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import { useNotificationStore } from "../lib/store";

interface PaymentMethod {
  id: string;
  type: "card" | "upi" | "bank";
  last4?: string;
  cardHolder?: string;
  expiryMonth?: string;
  expiryYear?: string;
  brand?: string;
  upiId?: string;
  bankName?: string;
  isDefault: boolean;
}

export default function PaymentMethods() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<"card" | "upi" | "bank">("card");
  const [formData, setFormData] = useState({ cardNumber: "", cardHolder: "", expiryMonth: "", expiryYear: "", upiId: "", bankName: "" });
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  const fetchMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await fetch(API_ENDPOINTS.PAYMENT_METHODS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMethods(data);
      } else {
        const text = await res.text();
        setError(`Failed to fetch: ${text}`);
        console.error("Failed to fetch methods:", text);
      }
    } catch (e: any) { 
      setError(e.message || "Network error");
      console.error(e); 
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMethods(); }, []);

  const addMethod = async () => {
    setSaving(true);
    try {
      const res = await fetch(API_ENDPOINTS.PAYMENT_METHODS, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: addType, ...formData }),
      });
      if (res.ok) {
        addNotification("Payment method added!", "success");
        setShowAdd(false);
        setFormData({ cardNumber: "", cardHolder: "", expiryMonth: "", expiryYear: "", upiId: "", bankName: "" });
        fetchMethods();
      } else {
        addNotification("Failed to add payment method", "error");
      }
    } catch (e) { addNotification("Failed to add payment method", "error"); }
    finally { setSaving(false); }
  };

  const deleteMethod = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.PAYMENT_METHODS}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addNotification("Payment method removed", "success");
        fetchMethods();
      } else {
        const msg = await res.text();
        addNotification(`Failed to remove: ${msg}`, "error");
      }
    } catch (e) { addNotification("Failed to remove", "error"); }
  };

  const setDefault = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.PAYMENT_METHODS}/${id}/default`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addNotification("Default payment method updated", "success");
        fetchMethods();
      } else {
        const msg = await res.text();
        addNotification(`Failed to update: ${msg}`, "error");
      }
    } catch (e) { addNotification("Failed to update", "error"); }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F6F9F9] flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#0D8B95]" /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F9F9] flex flex-col items-center justify-center gap-3">
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={fetchMethods} className="bg-[#0D8B95] text-white px-4 py-2 rounded">Retry</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-28 min-h-full bg-[#F6F9F9]">
      <div className="px-5 pt-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button aria-label="Go back" onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B2239] shadow-sm border border-slate-100">
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <h1 className="text-[22px] font-extrabold text-[#0B2239] tracking-tight">Payment Methods</h1>
          </div>
          <button aria-label="Add payment method" onClick={() => setShowAdd(true)} className="w-10 h-10 bg-[#0D8B95] text-white rounded-[12px] flex items-center justify-center shadow-[0_4px_12px_rgba(13,139,149,0.25)]">
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>

        {methods.length === 0 ? (
          <div className="bg-white rounded-[22px] p-10 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
            <div className="w-16 h-16 bg-[#E6F5F4] rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard size={28} className="text-[#0D8B95]" />
            </div>
            <p className="text-[15px] font-bold text-[#0B2239] mb-1.5">No payment methods</p>
            <p className="text-[12px] text-slate-500 mb-5">Add a card, UPI, or bank account for claim settlements</p>
            <button onClick={() => setShowAdd(true)} className="bg-[#0D8B95] text-white px-5 py-2.5 rounded-[12px] text-[13px] font-bold shadow-[0_4px_12px_rgba(13,139,149,0.25)]">
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.map((m) => (
              <div key={m.id} className="bg-white rounded-[20px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 flex items-center gap-3.5">
                <div className={`w-[42px] h-[42px] rounded-[14px] flex items-center justify-center shrink-0 ${
                  m.type === "card" ? "bg-blue-50 text-blue-500" : m.type === "upi" ? "bg-purple-50 text-purple-500" : "bg-emerald-50 text-emerald-500"
                }`}>
                  {m.type === "card" ? <CreditCard size={20} /> : m.type === "upi" ? <Smartphone size={20} /> : <Building2 size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#0B2239] text-[14px] truncate">
                      {m.type === "card" ? `${m.brand || "Card"} •••• ${m.last4}` : m.type === "upi" ? m.upiId : m.bankName}
                    </p>
                    {m.isDefault && <span className="bg-[#E6F5F4] text-[#0D8B95] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Default</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {m.type === "card" ? `${m.cardHolder} · ${m.expiryMonth}/${m.expiryYear}` : m.type === "upi" ? "UPI ID" : "Bank Account"}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {!m.isDefault && (
                    <button onClick={() => setDefault(m.id)} className="w-8 h-8 rounded-[8px] bg-[#E6F5F4] text-[#0D8B95] flex items-center justify-center" title="Set as default">
                      <Star size={14} strokeWidth={2.5} />
                    </button>
                  )}
                  <button onClick={() => deleteMethod(m.id)} className="w-8 h-8 rounded-[8px] bg-red-50 text-red-500 flex items-center justify-center" title="Delete">
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} className="w-full max-w-md bg-white rounded-t-[24px] p-5 pb-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] font-bold text-[#0B2239]">Add Payment Method</h2>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X size={16} /></button>
              </div>

              {/* Type Tabs */}
              <div className="flex gap-2 mb-5">
                {(["card", "upi", "bank"] as const).map(t => (
                  <button key={t} onClick={() => setAddType(t)} className={`flex-1 py-2 rounded-[10px] text-[13px] font-bold transition-colors ${addType === t ? 'bg-[#0D8B95] text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {t === "card" ? "Card" : t === "upi" ? "UPI" : "Bank"}
                  </button>
                ))}
              </div>

              {addType === "card" && (
                <div className="space-y-3">
                  <input placeholder="Card Number" value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value})} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:border-[#0D8B95]" />
                  <input placeholder="Card Holder Name" value={formData.cardHolder} onChange={e => setFormData({...formData, cardHolder: e.target.value})} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:border-[#0D8B95]" />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="MM" value={formData.expiryMonth} onChange={e => setFormData({...formData, expiryMonth: e.target.value})} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:border-[#0D8B95]" />
                    <input placeholder="YYYY" value={formData.expiryYear} onChange={e => setFormData({...formData, expiryYear: e.target.value})} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:border-[#0D8B95]" />
                  </div>
                </div>
              )}
              {addType === "upi" && (
                <input placeholder="UPI ID (e.g. name@upi)" value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:border-[#0D8B95]" />
              )}
              {addType === "bank" && (
                <input placeholder="Bank Name" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:border-[#0D8B95]" />
              )}

              <button onClick={addMethod} disabled={saving} className="w-full bg-[#0D8B95] text-white font-bold py-3 rounded-[14px] mt-5 shadow-[0_4px_14px_rgba(13,139,149,0.25)] disabled:opacity-70 flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Add Payment Method"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
