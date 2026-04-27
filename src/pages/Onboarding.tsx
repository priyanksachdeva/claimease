import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Chrome, MapPin, Building2, CreditCard, ChevronRight, CheckCircle2, Sparkles, Loader2, Camera, User, ArrowLeft } from "lucide-react";
import { useAuthStore, useNotificationStore } from "../lib/store";
import { API_ENDPOINTS } from "../config/api";

const TOP_INSURANCE_COMPANIES = [
  { name: "Star Health and Allied Insurance", domain: "starhealth.in" },
  { name: "HDFC ERGO General Insurance", domain: "hdfcergo.com" },
  { name: "ICICI Lombard General Insurance", domain: "icicilombard.com" },
  { name: "Niva Bupa Health Insurance", domain: "nivabupa.com" },
  { name: "Care Health Insurance", domain: "careinsurance.com" },
  { name: "Aditya Birla Health Insurance", domain: "adityabirlacapital.com" },
  { name: "Bajaj Allianz General Insurance", domain: "bajajallianz.com" },
];

const CompanyLogo = ({ company }: { company: { name: string, domain: string } }) => {
  const imgSrc = company.domain ? `https://logo.clearbit.com/${company.domain}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=0D8B95&color=fff`;
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden p-2 relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <Loader2 size={16} className="animate-spin text-teal-500" />
        </div>
      )}
      <img 
        src={imgSrc} 
        alt={company.name}
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=0D8B95&color=fff`;
        }}
        onLoad={() => setIsLoading(false)}
        className={`w-full h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedInsurance, setSelectedInsurance] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [insuranceCompanies, setInsuranceCompanies] = useState<any[]>([]);

  // If already authenticated, skip to next steps or dashboard
  useEffect(() => {
    if (isAuthenticated && step === 1) {
      setStep(2);
    }
  }, [isAuthenticated, step]);

  // Fetch demo organizations from API
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ORGANIZATIONS);
        if (response.ok) {
          const orgs = await response.json();
          const orgsArray = Array.isArray(orgs) ? orgs : (orgs.organizations || []);
          
          setHospitals(orgsArray.filter((org: any) => org.type === "hospital"));
          setInsuranceCompanies(orgsArray.filter((org: any) => org.type === "insurance"));
        }
      } catch (e) {
        console.error("Failed to fetch organizations", e);
      }
    };
    fetchOrganizations();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = mode === "login" ? API_ENDPOINTS.AUTH_LOGIN : API_ENDPOINTS.AUTH_REGISTER;
      const body = mode === "login" 
        ? { email, password } 
        : { email, password, firstName, lastName, role: "patient" };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.user, data.token);
        addNotification(mode === "login" ? "Welcome back!" : "Account created successfully!", "success");
        setStep(2);
      } else {
        const error = await response.json();
        addNotification(error.error || "Authentication failed", "error");
      }
    } catch (error) {
      addNotification("Network error. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem("claimEase_onboarded", "true");
    if (selectedInsurance) {
      localStorage.setItem("claimEase_selectedInsurance", JSON.stringify(selectedInsurance));
    }
    if (selectedHospital) {
      localStorage.setItem("claimEase_selectedHospital", JSON.stringify(selectedHospital));
    }
    navigate("/");
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-2xl relative flex flex-col overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-teal-600 rounded-b-[60px] -z-10 opacity-10"></div>

        <AnimatePresence mode="wait">
        {/* STEP 1: AUTH */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-8 pt-16"
          >
            <div className="mb-10 text-center">
              <div className="w-20 h-20 bg-teal-600 rounded-3xl rotate-12 flex items-center justify-center shadow-xl shadow-teal-900/20 mx-auto mb-6">
                <ShieldCheck size={40} className="text-white -rotate-12" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">ClaimEase</h1>
              <p className="text-slate-500 mt-2">Healthcare claims made simple.</p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
              <button 
                onClick={() => setMode("login")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === "login" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}
              >Sign In</button>
              <button 
                onClick={() => setMode("register")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === "register" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}
              >Create Account</button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {mode === "register" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="First Name" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      required
                    />
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Last Name" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-teal-700 text-white rounded-2xl py-4 font-bold shadow-lg shadow-teal-900/20 hover:bg-teal-800 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (mode === "login" ? "Sign In" : "Get Started")}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm">By continuing, you agree to our <span className="text-teal-600 font-medium">Terms of Service</span></p>
            </div>
          </motion.div>
        )}

        {/* STEP 2: INSURANCE SELECTION */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-12"
          >
            <div className="flex items-center gap-2 mb-6">
               <button onClick={() => setStep(1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600"><ArrowLeft size={20}/></button>
               <div>
                 <h2 className="text-2xl font-bold text-slate-800">Select Insurance</h2>
                 <p className="text-slate-500 text-sm">Choose your primary health insurer.</p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-24 grid grid-cols-2 gap-3">
                {insuranceCompanies.length > 0 ? insuranceCompanies.map((company: any) => (
                  <button
                    key={company._id}
                    onClick={() => setSelectedInsurance(company)}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-3 transition-all ${
                      selectedInsurance?._id === company._id
                        ? 'border-teal-500 bg-teal-50 shadow-md' 
                        : 'border-slate-200 bg-white hover:border-teal-200'
                    }`}
                  >
                    <CompanyLogo company={company} />
                    <span className="text-xs font-bold text-slate-700">{company.name}</span>
                  </button>
                )) : (
                  <div className="col-span-2 py-10 text-center text-slate-400">Loading providers...</div>
                )}
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-12">
              <button 
                onClick={() => setStep(3)}
                disabled={!selectedInsurance}
                className="w-full bg-teal-700 disabled:bg-slate-300 text-white rounded-2xl py-4 font-bold shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: HOSPITAL SELECTION */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-12"
          >
            <div className="flex items-center gap-2 mb-6">
               <button onClick={() => setStep(2)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600"><ArrowLeft size={20}/></button>
               <div>
                 <h2 className="text-2xl font-bold text-slate-800">Primary Hospital</h2>
                 <p className="text-slate-500 text-sm">Where do you usually receive care?</p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-24 space-y-3">
                {hospitals.map((hospital: any) => (
                  <button
                    key={hospital._id}
                    onClick={() => setSelectedHospital(hospital)}
                    className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left ${
                      selectedHospital?._id === hospital._id
                        ? 'border-teal-500 bg-teal-50 shadow-md' 
                        : 'border-slate-200 bg-white hover:border-teal-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedHospital?._id === hospital._id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Building2 size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{hospital.name}</h4>
                      <p className="text-xs text-slate-500">{hospital.city || "Multi-speciality"}</p>
                    </div>
                    {selectedHospital?._id === hospital._id && (
                      <CheckCircle2 className="text-teal-600" size={24} />
                    )}
                  </button>
                ))}
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-12 space-y-3">
              <button 
                onClick={() => setStep(4)}
                disabled={!selectedHospital}
                className="w-full bg-teal-700 disabled:bg-slate-300 text-white rounded-2xl py-4 font-bold shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2"
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: FINISH */}
        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col p-8 pt-20 items-center justify-center text-center"
          >
            <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-8">
              <CheckCircle2 size={56} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-4">You're All Set!</h2>
            <p className="text-slate-500 max-w-[280px] mb-12">Welcome to ClaimEase. Your health claims are now in safe hands.</p>
            
            <button 
              onClick={completeOnboarding}
              className="w-full bg-teal-700 text-white rounded-2xl py-4 font-bold shadow-lg shadow-teal-900/20 hover:bg-teal-800 transition-all"
            >
              Go to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

function ShieldCheck({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
