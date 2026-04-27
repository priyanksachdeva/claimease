import { motion } from "motion/react";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsPolicies() {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-28 min-h-full bg-[#F6F9F9]">
      <div className="px-5 pt-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B2239] shadow-sm border border-slate-100">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h1 className="text-[22px] font-extrabold text-[#0B2239] tracking-tight">Terms & Policies</h1>
        </div>

        <div className="space-y-4">
          <Section title="Terms of Service" updated="Last updated: January 15, 2026">
            <p>Welcome to ClaimEase. By accessing or using our application, you agree to be bound by these Terms of Service. Our platform facilitates the submission and tracking of medical insurance claims between patients, hospitals, and insurance providers.</p>
            <p className="mt-2">You must be at least 18 years old to use this service. By creating an account, you represent that you are of legal age and have the authority to enter into these terms.</p>
            <p className="mt-2">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.</p>
          </Section>

          <Section title="Privacy Policy" updated="Last updated: January 15, 2026">
            <p>ClaimEase collects and processes personal information including your name, email, phone number, and medical billing data to provide our services. We use industry-standard encryption to protect your data both in transit and at rest.</p>
            <p className="mt-2">We share your information only with your designated insurance provider and hospital for the purpose of claim processing. We do not sell your personal data to third parties.</p>
            <p className="mt-2">You have the right to access, correct, or delete your personal data at any time through the Privacy & Security settings in your profile.</p>
          </Section>

          <Section title="Data Retention Policy" updated="Last updated: January 15, 2026">
            <p>We retain your medical bills and claim data for a minimum of 7 years as required by healthcare regulations. Account information is retained for the duration of your account's existence plus 2 years after account deletion.</p>
            <p className="mt-2">You can request data export or deletion by contacting our support team. Certain data may be retained for legal compliance purposes even after deletion requests.</p>
          </Section>

          <Section title="Acceptable Use Policy" updated="Last updated: January 15, 2026">
            <p>You agree not to: submit fraudulent claims or forged documents; attempt to gain unauthorized access to other users' accounts; use the platform for any illegal purpose; interfere with the platform's security features.</p>
            <p className="mt-2">Violation of these terms may result in immediate account suspension and reporting to relevant authorities.</p>
          </Section>

          <Section title="Refund & Cancellation" updated="Last updated: January 15, 2026">
            <p>ClaimEase is a free platform for patients. Insurance claim settlements are processed directly by your insurance provider according to their policies. ClaimEase is not liable for claim rejections or settlement amounts.</p>
          </Section>
        </div>
      </div>
    </motion.div>
  );
}

function Section({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
      <div className="flex items-center gap-2.5 mb-3">
        <Shield size={16} className="text-[#0D8B95]" />
        <h3 className="text-[15px] font-bold text-[#0B2239]">{title}</h3>
      </div>
      <p className="text-[10px] text-slate-400 font-medium mb-3">{updated}</p>
      <div className="text-[12px] text-slate-600 leading-relaxed">{children}</div>
    </div>
  );
}
