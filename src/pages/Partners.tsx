import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  Shield, 
  Search, 
  MapPin, 
  Phone, 
  Globe, 
  ArrowLeft,
  ChevronRight,
  Activity,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

interface Organization {
  id: string;
  _id?: string;
  name: string;
  type: "hospital" | "insurance";
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  isActive: boolean;
}

export default function Partners() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"hospital" | "insurance">("hospital");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(API_ENDPOINTS.ORGANIZATIONS, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const orgsArray = Array.isArray(data) ? data : (data.organizations || []);
          setOrgs(orgsArray);
        }
      } catch (error) {
        console.error("Failed to fetch organizations", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  const filteredOrgs = orgs
    .filter(o => o.type === tab)
    .filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.city.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-28 min-h-screen bg-[#F6F9F9]"
    >
      <div className="px-5 pt-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B2239] shadow-sm border border-slate-100">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h1 className="text-[22px] font-extrabold text-[#0B2239] tracking-tight">Our Partners</h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${tab}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-[18px] py-3 pl-11 pr-4 text-[14px] text-[#0B2239] focus:outline-none focus:ring-2 focus:ring-[#0D8B95]/20 focus:border-[#0D8B95] transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex p-1.5 bg-slate-100 rounded-[20px] mb-6">
          <button 
            onClick={() => setTab("hospital")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[16px] text-[13px] font-bold transition-all ${
              tab === "hospital" ? "bg-white text-[#0D8B95] shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Building2 size={16} />
            Hospitals
          </button>
          <button 
            onClick={() => setTab("insurance")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[16px] text-[13px] font-bold transition-all ${
              tab === "insurance" ? "bg-white text-[#0D8B95] shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Shield size={16} />
            Insurers
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D8B95] mb-4"></div>
            <p className="text-slate-400 text-sm font-medium">Fetching partners...</p>
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="bg-white rounded-[24px] p-10 text-center border border-slate-100">
            <Building2 size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-slate-800 font-bold mb-1">No {tab}s found</h3>
            <p className="text-slate-500 text-sm">We're expanding our network. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrgs.map((org, index) => (
              <motion.div 
                key={org.id || org._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100/80 group active:scale-[0.98] transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 ${
                      tab === "hospital" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {tab === "hospital" ? <Building2 size={28} /> : <Shield size={28} />}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#0B2239] text-[16px] leading-tight mb-1 group-hover:text-[#0D8B95] transition-colors">{org.name}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin size={13} />
                        <span className="text-[12px] font-medium">{org.city}, {org.address.split(',')[0]}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    org.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {org.isActive !== false ? 'Verified' : 'Inactive'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-500 hover:text-[#0D8B95] transition-colors">
                    <Phone size={14} />
                    <span className="text-[12px] font-semibold">{org.phone}</span>
                  </div>
                  {org.website && (
                    <div className="flex items-center gap-2 text-slate-500 hover:text-[#0D8B95] transition-colors">
                      <Globe size={14} />
                      <span className="text-[12px] font-semibold truncate">{org.website.replace(/^https?:\/\//, '')}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
