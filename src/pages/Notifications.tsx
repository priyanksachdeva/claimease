import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Bell, Check, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import { useNotificationStore, useAuthStore } from "../lib/store";

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  body?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, [token]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS_READ_ALL, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        addNotification("All notifications marked as read", "success");
      } else {
        addNotification("Failed to mark as read", "error");
      }
    } catch (e) { addNotification("Failed to mark as read", "error"); }
  };

  const deleteNotif = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (e) { console.error(e); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return <div className="min-h-screen bg-[#F6F9F9] flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#0D8B95]" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-28 min-h-full bg-[#F6F9F9]">
      <div className="px-5 pt-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B2239] shadow-sm border border-slate-100">
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-[22px] font-extrabold text-[#0B2239] tracking-tight">Notifications</h1>
              {unreadCount > 0 && <p className="text-[11px] text-[#0D8B95] font-medium">{unreadCount} unread</p>}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[12px] font-bold text-[#0D8B95] flex items-center gap-1">
              <Check size={14} strokeWidth={2.5} /> Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-[22px] p-10 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
            <div className="w-16 h-16 bg-[#E6F5F4] rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={28} className="text-[#0D8B95]" />
            </div>
            <p className="text-[15px] font-bold text-[#0B2239] mb-1.5">No notifications</p>
            <p className="text-[12px] text-slate-500">You're all caught up! We'll notify you when there are updates.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-[18px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 ${!notif.isRead ? 'border-l-[3px] border-l-[#0D8B95]' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!notif.isRead ? 'bg-[#0D8B95]' : 'bg-slate-200'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#0B2239]">{notif.title || notif.message}</p>
                    {notif.body && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.body}</p>}
                    <p className="text-[10px] text-slate-400 mt-1.5">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!notif.isRead && (
                      <button onClick={() => markAsRead(notif.id)} className="w-7 h-7 rounded-[6px] bg-[#E6F5F4] text-[#0D8B95] flex items-center justify-center" title="Mark as read">
                        <Check size={12} strokeWidth={3} />
                      </button>
                    )}
                    <button onClick={() => deleteNotif(notif.id)} className="w-7 h-7 rounded-[6px] bg-red-50 text-red-400 flex items-center justify-center" title="Delete">
                      <Trash2 size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
