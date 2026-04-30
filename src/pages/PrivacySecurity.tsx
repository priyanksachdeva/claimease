import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Shield, Eye, EyeOff, Database, Share2, BarChart3, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import { useNotificationStore, useAuthStore } from "../lib/store";

export default function PrivacySecurity() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [privacy, setPrivacy] = useState({
    shareDataWithInsurer: true,
    shareDataWithHospital: true,
    analyticsOptIn: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = useAuthStore.getState().token;
        if (!token) {
          addNotification("Session expired. Please log in again.", "error");
          setLoading(false);
          return;
        }
        const res = await fetch(API_ENDPOINTS.SETTINGS, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null);
        if (res?.ok) {
          const data = await res.json();
          if (data.privacy) setPrivacy(data.privacy);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const toggle = async (key: keyof typeof privacy) => {
    const prevValue = privacy[key];
    const updated = { ...privacy, [key]: !prevValue };
    setPrivacy(updated);
    setSaving(true);
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        setPrivacy({ ...privacy, [key]: prevValue });
        addNotification("Session expired. Please log in again.", "error");
        setSaving(false);
        return;
      }
      const res = await fetch(API_ENDPOINTS.SETTINGS, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ privacy: updated }),
      });
      if (res.ok) {
        addNotification("Privacy settings updated", "success");
      } else {
        const text = await res.text();
        setPrivacy({ ...privacy, [key]: prevValue });
        addNotification(`Failed to update settings: ${text}`, "error");
      }
    } catch (e) { 
      setPrivacy({ ...privacy, [key]: prevValue });
      addNotification("Failed to update settings", "error"); 
    }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F6F9F9] flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#0D8B95]" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-28 min-h-full bg-[#F6F9F9]">
      <div className="px-5 pt-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B2239] shadow-sm border border-slate-100">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h1 className="text-[22px] font-extrabold text-[#0B2239] tracking-tight">Privacy & Security</h1>
          {saving && <Loader2 size={16} className="animate-spin text-[#0D8B95] ml-auto" />}
        </div>

        {/* Info Card */}
        <div className="bg-[#0D8B95] rounded-[20px] p-5 mb-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="relative z-10 flex items-start gap-3">
            <Shield size={24} />
            <div>
              <h3 className="font-bold text-[15px] mb-1">Your data is protected</h3>
              <p className="text-[12px] text-white/80 leading-relaxed">All your medical records and personal information are encrypted with AES-256 encryption, both in transit and at rest.</p>
            </div>
          </div>
        </div>

        {/* Data Sharing */}
        <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Data Sharing</h2>
        <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 overflow-hidden mb-5">
          <ToggleRow 
            icon={<Share2 size={18} />} iconBg="bg-blue-50" iconColor="text-blue-500" 
            label="Share with Insurance Provider" 
            desc="Allow your insurer to access bill and claim data"
            value={privacy.shareDataWithInsurer} onChange={() => toggle("shareDataWithInsurer")} 
          />
          <ToggleRow 
            icon={<Database size={18} />} iconBg="bg-purple-50" iconColor="text-purple-500" 
            label="Share with Hospital" 
            desc="Allow linked hospitals to view your records"
            value={privacy.shareDataWithHospital} onChange={() => toggle("shareDataWithHospital")} 
          />
          <ToggleRow 
            icon={<BarChart3 size={18} />} iconBg="bg-emerald-50" iconColor="text-emerald-500" 
            label="Analytics & Improvements" 
            desc="Help us improve by sharing anonymous usage data"
            value={privacy.analyticsOptIn} onChange={() => toggle("analyticsOptIn")} border={false}
          />
        </div>

        {/* Security Actions */}
        <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Account Security</h2>
        <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 overflow-hidden mb-5">
          <button onClick={() => addNotification("Change password feature coming soon", "success")} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] bg-amber-50 rounded-[10px] flex items-center justify-center text-amber-500"><Eye size={18} /></div>
              <div className="text-left">
                <span className="font-semibold text-[#0B2239] text-[14px] block">Change Password</span>
                <span className="text-[11px] text-slate-400">Update your account password</span>
              </div>
            </div>
          </button>
          <button onClick={() => addNotification("Delete account feature coming soon", "success")} className="w-full flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] bg-red-50 rounded-[10px] flex items-center justify-center text-red-500"><Trash2 size={18} /></div>
              <div className="text-left">
                <span className="font-semibold text-red-600 text-[14px] block">Delete Account</span>
                <span className="text-[11px] text-slate-400">Permanently delete your account and data</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ToggleRow({ icon, iconBg, iconColor, label, desc, value, onChange, border = true }: { icon: React.ReactNode; iconBg: string; iconColor: string; label: string; desc: string; value: boolean; onChange: () => void; border?: boolean }) {
  return (
    <button 
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={onChange}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(); } }}
      className={`w-full flex items-center justify-between px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#0D8B95] ${border ? 'border-b border-slate-50' : ''}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>{icon}</div>
        <div className="text-left min-w-0">
          <span className="font-semibold text-[#0B2239] text-[14px] block">{label}</span>
          <span className="text-[11px] text-slate-400 block truncate">{desc}</span>
        </div>
      </div>
      <div className={`w-[44px] h-[26px] rounded-full transition-colors flex items-center px-0.5 shrink-0 ml-3 ${value ? 'bg-[#0D8B95]' : 'bg-slate-200'}`}>
        <div className={`w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0'}`} />
      </div>
    </button>
  );
}
