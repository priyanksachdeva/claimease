import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Search, MessageCircle, Phone, Mail, ChevronDown, ChevronUp, ExternalLink, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const faqs = [
  { id: "faq-upload", q: "How do I upload a medical bill?", a: "Go to your Dashboard and use the 'Upload Medical Bill' form. Fill in the bill details (title, category, amount, date), attach a photo or PDF of your bill, and tap 'Submit Bill'. Your bill will be processed and you can track its status." },
  { id: "faq-time", q: "How long does claim processing take?", a: "Most claims are processed within 3-5 business days. Complex claims involving surgery or high amounts may take up to 10 business days. You can track real-time status updates in the Claims section." },
  { id: "faq-formats", q: "What file formats are supported for bill uploads?", a: "We support JPG, PNG, and PDF files up to 5MB in size. For best results, ensure the bill is clearly readable and all text is visible." },
  { id: "faq-payment", q: "How do I add a payment method for settlements?", a: "Go to Profile → Payment Methods. You can add a debit/credit card, UPI ID, or bank account. The default payment method will be used for claim settlements." },
  { id: "faq-track", q: "Can I track my claim in real-time?", a: "Yes! Go to the Claims page to see all your active and past claims. Each claim shows a timeline of events including submission, verification, and approval/rejection status." },
  { id: "faq-rejected", q: "What should I do if my claim is rejected?", a: "If your claim is rejected, the reason will be displayed on the claim details. You can upload corrected documents or contact our support team for assistance. Common reasons include incomplete documentation or policy coverage issues." },
  { id: "faq-provider", q: "How do I change my insurance provider?", a: "Go to your Profile and tap on the Insurance Provider card. You can update your insurance details through the onboarding flow or by contacting support." },
  { id: "faq-security", q: "Is my data secure?", a: "Yes, we use industry-standard encryption for all data in transit and at rest. Your medical records and financial information are protected with end-to-end encryption and strict access controls. See our Privacy & Security page for more details." },
];

export default function HelpSupport() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = searchQuery
    ? faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqs;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-28 min-h-full bg-[#F6F9F9]">
      <div className="px-5 pt-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B2239] shadow-sm border border-slate-100">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h1 className="text-[22px] font-extrabold text-[#0B2239] tracking-tight">Help & Support</h1>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <a href="tel:+911800123456" className="bg-white rounded-[16px] p-3.5 flex flex-col items-center gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
            <div className="w-10 h-10 bg-emerald-50 rounded-[12px] flex items-center justify-center text-emerald-500"><Phone size={18} /></div>
            <span className="text-[11px] font-bold text-[#0B2239]">Call Us</span>
          </a>
          <a href="mailto:support@claimease.in" className="bg-white rounded-[16px] p-3.5 flex flex-col items-center gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
            <div className="w-10 h-10 bg-blue-50 rounded-[12px] flex items-center justify-center text-blue-500"><Mail size={18} /></div>
            <span className="text-[11px] font-bold text-[#0B2239]">Email</span>
          </a>
          <button onClick={() => navigate("/messages")} className="bg-white rounded-[16px] p-3.5 flex flex-col items-center gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
            <div className="w-10 h-10 bg-purple-50 rounded-[12px] flex items-center justify-center text-purple-500"><MessageCircle size={18} /></div>
            <span className="text-[11px] font-bold text-[#0B2239]">Chat</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input type="text" placeholder="Search FAQs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-[14px] py-2.5 pl-10 pr-4 text-[13px] placeholder:text-slate-400 focus:outline-none focus:border-[#0D8B95] shadow-[0_2px_8px_rgba(0,0,0,0.02)]" />
        </div>

        {/* FAQ */}
        <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Frequently Asked Questions</h2>
        <div className="space-y-2.5">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)} className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <HelpCircle size={16} className="text-[#0D8B95] shrink-0" />
                  <span className="font-semibold text-[#0B2239] text-[13px]">{faq.q}</span>
                </div>
                {openFaq === faq.id ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
              </button>
              <AnimatePresence>
                {openFaq === faq.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="px-4 pb-4 text-[12px] text-slate-500 leading-relaxed border-t border-slate-50 pt-3 ml-[40px]">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
