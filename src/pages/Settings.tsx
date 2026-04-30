import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Bell, BellOff, Mail, MessageSquare, Shield, Moon, Sun, Globe, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import { useNotificationStore, useAuthStore } from "../lib/store";

interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    claimUpdates: boolean;
    billReminders: boolean;
    promotions: boolean;
  };
  privacy: {
    shareDataWithInsurer: boolean;
    shareDataWithHospital: boolean;
    analyticsOptIn: boolean;
  };
  appearance: {
    darkMode: boolean;
    language: string;
  };
}

const defaultSettings: UserSettings = {
  notifications: { push: true, email: true, sms: false, claimUpdates: true, billReminders: true, promotions: false },
  privacy: { shareDataWithInsurer: true, shareDataWithHospital: true, analyticsOptIn: true },
  appearance: { darkMode: false, language: "en" },
};

export default function Settings() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = useAuthStore.getState().token;
        const res = await fetch(API_ENDPOINTS.SETTINGS, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null);
        if (res?.ok) {
          const data = await res.json();
          setSettings(prev => ({
            notifications: { ...prev.notifications, ...data.notifications },
            privacy: { ...prev.privacy, ...data.privacy },
            appearance: { ...prev.appearance, ...data.appearance },
          }));
        }
      } catch (e) {
        console.error("Failed to fetch settings", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async (updated: UserSettings) => {
    const prevSettings = settings;
    setSettings(updated);
    setSaving(true);
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(API_ENDPOINTS.SETTINGS, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        addNotification("Settings saved", "success");
      } else {
        const text = await res.text();
        setSettings(prevSettings);
        addNotification(`Failed to save settings: ${text}`, "error");
      }
    } catch (e) {
      setSettings(prevSettings);
      addNotification("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleNotif = (key: keyof UserSettings["notifications"]) => {
    const updated = { ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } };
    saveSettings(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F9F9] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#0D8B95]" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-28 min-h-full bg-[#F6F9F9]">
      <div className="px-5 pt-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/profile")} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B2239] shadow-sm border border-slate-100">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h1 className="text-[22px] font-extrabold text-[#0B2239] tracking-tight">Settings</h1>
          {saving && <Loader2 size={16} className="animate-spin text-[#0D8B95] ml-auto" />}
        </div>

        {/* Notification Settings */}
        <section className="mb-5">
          <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Notifications</h2>
          <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 overflow-hidden">
            <ToggleRow icon={<Bell size={18} />} iconBg="bg-[#E6F5F4]" iconColor="text-[#0D8B95]" label="Push Notifications" value={settings.notifications.push} onChange={() => toggleNotif("push")} />
            <ToggleRow icon={<Mail size={18} />} iconBg="bg-blue-50" iconColor="text-blue-500" label="Email Notifications" value={settings.notifications.email} onChange={() => toggleNotif("email")} />
            <ToggleRow icon={<MessageSquare size={18} />} iconBg="bg-purple-50" iconColor="text-purple-500" label="SMS Alerts" value={settings.notifications.sms} onChange={() => toggleNotif("sms")} />
            <ToggleRow icon={<Shield size={18} />} iconBg="bg-emerald-50" iconColor="text-emerald-500" label="Claim Updates" value={settings.notifications.claimUpdates} onChange={() => toggleNotif("claimUpdates")} border={false} />
          </div>
        </section>

        {/* Appearance */}
        <section className="mb-5">
          <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Appearance</h2>
          <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 overflow-hidden">
            <ToggleRow 
              icon={settings.appearance.darkMode ? <Moon size={18} /> : <Sun size={18} />} 
              iconBg="bg-slate-100" iconColor="text-slate-600" 
              label="Dark Mode" 
              value={settings.appearance.darkMode} 
              onChange={() => {
                const updated = { ...settings, appearance: { ...settings.appearance, darkMode: !settings.appearance.darkMode } };
                saveSettings(updated);
              }} 
              border={false}
            />
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">More</h2>
          <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 overflow-hidden">
            <LinkRow label="Privacy & Security" onClick={() => navigate("/privacy")} />
            <LinkRow label="Payment Methods" onClick={() => navigate("/payment-methods")} />
            <LinkRow label="Help & Support" onClick={() => navigate("/help")} />
            <LinkRow label="Terms & Policies" onClick={() => navigate("/terms")} border={false} />
          </div>
        </section>
      </div>
    </motion.div>
  );
}

function ToggleRow({ icon, iconBg, iconColor, label, value, onChange, border = true }: { icon: React.ReactNode; iconBg: string; iconColor: string; label: string; value: boolean; onChange: () => void; border?: boolean }) {
  return (
    <button 
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={onChange}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(); } }}
      className={`w-full flex items-center justify-between px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#0D8B95] ${border ? 'border-b border-slate-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center ${iconBg} ${iconColor}`}>{icon}</div>
        <span className="font-semibold text-[#0B2239] text-[14px]">{label}</span>
      </div>
      <div className={`w-[44px] h-[26px] rounded-full transition-colors flex items-center px-0.5 ${value ? 'bg-[#0D8B95]' : 'bg-slate-200'}`}>
        <div className={`w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0'}`} />
      </div>
    </button>
  );
}

function LinkRow({ label, onClick, border = true }: { label: string; onClick: () => void; border?: boolean }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/80 ${border ? 'border-b border-slate-50' : ''}`}>
      <span className="font-semibold text-[#0B2239] text-[14px]">{label}</span>
      <ChevronRight size={17} className="text-slate-300" strokeWidth={2.5} />
    </button>
  );
}
