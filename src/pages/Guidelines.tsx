import { motion } from "motion/react";
import { ArrowLeft, FileText, Camera, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Guidelines() {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-28 min-h-full bg-[#F6F9F9]">
      <div className="px-5 pt-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B2239] shadow-sm border border-slate-100">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h1 className="text-[22px] font-extrabold text-[#0B2239] tracking-tight">Bill Upload Guidelines</h1>
        </div>

        {/* Top Info */}
        <div className="bg-[#E6F5F4] rounded-[20px] p-5 mb-5 flex items-start gap-3">
          <Info size={20} className="text-[#0D8B95] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#0B2239] leading-relaxed font-medium">Follow these guidelines to ensure your bills are processed quickly and your claims are approved without delays.</p>
        </div>

        {/* Guidelines Sections */}
        <div className="space-y-4">
          <GuideCard
            icon={<FileText size={20} />}
            title="Accepted Documents"
            items={[
              "Hospital bills with itemized charges",
              "Pharmacy receipts for prescribed medicines",
              "Lab test reports with billing details",
              "Surgery and procedure invoices",
              "Consultation fee receipts",
            ]}
            color="blue"
          />

          <GuideCard
            icon={<Camera size={20} />}
            title="Photo Quality Requirements"
            items={[
              "Ensure the entire bill is visible in the frame",
              "Use good lighting — avoid shadows and glare",
              "Keep the camera steady for a clear, focused shot",
              "Supported formats: JPG, PNG, PDF (max 5MB)",
              "Avoid blurry or cropped images",
            ]}
            color="purple"
          />

          <GuideCard
            icon={<CheckCircle size={20} />}
            title="Required Information on Bill"
            items={[
              "Hospital/clinic name and address",
              "Patient name (must match your profile)",
              "Date of service or treatment",
              "Itemized list of services/procedures",
              "Total amount charged",
              "Doctor's name and registration number",
            ]}
            color="emerald"
          />

          <GuideCard
            icon={<AlertTriangle size={20} />}
            title="Common Rejection Reasons"
            items={[
              "Illegible or blurry bill images",
              "Missing patient name or date",
              "Bill amount does not match entered amount",
              "Expired or duplicate bills",
              "Services not covered under your policy",
              "Bill from a non-network hospital",
            ]}
            color="amber"
          />
        </div>

        {/* Bottom CTA */}
        <div className="mt-6">
          <button onClick={() => navigate("/")} className="w-full bg-[#0D8B95] text-white font-bold py-3.5 rounded-[14px] shadow-[0_4px_14px_rgba(13,139,149,0.25)] text-[15px]">
            Upload a Bill Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function GuideCard({ icon, title, items, color }: { icon: React.ReactNode; title: string; items: string[]; color: string }) {
  const colorMap: Record<string, { bg: string; iconBg: string; iconText: string; bullet: string }> = {
    blue: { bg: "bg-white", iconBg: "bg-blue-50", iconText: "text-blue-500", bullet: "bg-blue-400" },
    purple: { bg: "bg-white", iconBg: "bg-purple-50", iconText: "text-purple-500", bullet: "bg-purple-400" },
    emerald: { bg: "bg-white", iconBg: "bg-emerald-50", iconText: "text-emerald-500", bullet: "bg-emerald-400" },
    amber: { bg: "bg-white", iconBg: "bg-amber-50", iconText: "text-amber-500", bullet: "bg-amber-400" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`${c.bg} rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-[38px] h-[38px] rounded-[12px] flex items-center justify-center ${c.iconBg} ${c.iconText}`}>{icon}</div>
        <h3 className="text-[15px] font-bold text-[#0B2239]">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full ${c.bullet} mt-1.5 shrink-0`} />
            <span className="text-[12px] text-slate-600 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
