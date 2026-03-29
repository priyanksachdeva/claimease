import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Chrome, MapPin, Building2, CreditCard, ChevronRight, CheckCircle2, Sparkles, Loader2, Camera } from "lucide-react";
import { generateImage } from "../lib/gemini";

const TOP_INSURANCE_COMPANIES = [
  { name: "Star Health and Allied Insurance", domain: "starhealth.in" },
  { name: "HDFC ERGO General Insurance", domain: "hdfcergo.com" },
  { name: "ICICI Lombard General Insurance", domain: "icicilombard.com" },
  { name: "Niva Bupa Health Insurance", domain: "nivabupa.com" },
  { name: "Care Health Insurance", domain: "careinsurance.com" },
  { name: "Aditya Birla Health Insurance", domain: "adityabirlacapital.com" },
  { name: "Bajaj Allianz General Insurance", domain: "bajajallianz.com" },
  { name: "SBI General Insurance", domain: "sbigeneral.in" },
  { name: "Tata AIG General Insurance", domain: "tataaig.com" },
  { name: "Reliance General Insurance", domain: "reliancegeneral.co.in" },
  { name: "ManipalCigna Health Insurance", domain: "manipalcigna.com" },
  { name: "National Insurance Company", domain: "nationalinsurance.nic.co.in" },
  { name: "New India Assurance", domain: "newindia.co.in" },
  { name: "Oriental Insurance", domain: "orientalinsurance.org.in" },
  { name: "United India Insurance", domain: "uiic.co.in" },
  { name: "Cholamandalam MS General", domain: "cholainsurance.com" },
  { name: "Future Generali India", domain: "general.futuregenerali.in" },
  { name: "Royal Sundaram General", domain: "royalsundaram.in" },
  { name: "Universal Sompo General", domain: "universalsompo.com" },
  { name: "Zuno General Insurance", domain: "hizuno.com" }
];

const CompanyLogo = ({ company }: { company: { name: string, domain: string } }) => {
  const [imgSrc, setImgSrc] = useState(`https://logo.clearbit.com/${company.domain}`);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleFallback = async () => {
      if (!hasError) return;
      
      const cacheKey = `claimEase_logo_${company.name.replace(/\s+/g, '_')}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setImgSrc(cached);
        return;
      }

      try {
        const prompt = `A simple, clean, minimalist logo for an insurance company named "${company.name}". Soft teal and mint green colors, white background, high quality, flat vector style, ui asset, no text.`;
        const generatedImg = await generateImage(prompt);
        localStorage.setItem(cacheKey, generatedImg);
        setImgSrc(generatedImg);
      } catch (e) {
        console.error("Failed to generate logo for", company.name, e);
        setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=0D8B95&color=fff`);
      }
    };

    handleFallback();
  }, [hasError, company.name]);

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
        onError={() => {
          if (!hasError) {
            setHasError(true);
          } else {
            setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=0D8B95&color=fff`);
          }
        }}
        onLoad={() => setIsLoading(false)}
        className={`w-full h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [location, setLocation] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState("");

  // Generate Hero Image on mount using NanoBanana
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const cached = localStorage.getItem("claimEase_hero");
        if (cached) {
          setHeroImage(cached);
          return;
        }
        setIsGenerating(true);
        // Using NanoBanana (gemini-2.5-flash-image) for a calming, theme-matching illustration
        const img = await generateImage("A clean, minimalist, calming 3D illustration of a glowing medical cross and a shield, soft teal and mint green colors, white background, high quality, soft lighting, ui asset");
        setHeroImage(img);
        localStorage.setItem("claimEase_hero", img);
      } catch (e) {
        console.error("Failed to generate hero image", e);
      } finally {
        setIsGenerating(false);
      }
    };
    fetchHero();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation(position.coords);
        // Mock nearest hospitals based on location
        setHospitals([
          { id: 1, name: "Apollo Hospitals, Greams Road", distance: "1.2 km" },
          { id: 2, name: "Fortis Escorts Heart Institute", distance: "3.4 km" },
          { id: 3, name: "Max Super Speciality Hospital", distance: "5.1 km" },
          { id: 4, name: "Manipal Hospital", distance: "6.8 km" },
        ]);
      });
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem("claimEase_onboarded", "true");
    navigate("/");
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-2xl relative flex flex-col overflow-hidden">
        {/* Dynamic Background Blob */}
        <div className="absolute top-0 left-0 w-full h-96 bg-teal-600 rounded-b-[60px] -z-10 opacity-10"></div>

        <AnimatePresence mode="wait">
        {/* STEP 1: LOGIN */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-12"
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* AI Generated Hero Image */}
              <div className="w-48 h-48 mb-8 relative">
                {heroImage ? (
                  <motion.img 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={heroImage} 
                    alt="ClaimEase Hero" 
                    className="w-full h-full object-contain drop-shadow-2xl rounded-3xl"
                  />
                ) : (
                  <div className="w-full h-full bg-teal-100/50 rounded-3xl flex items-center justify-center animate-pulse">
                    <Sparkles className="text-teal-400" size={32} />
                  </div>
                )}
                <div className="absolute -bottom-4 bg-white px-4 py-1.5 rounded-full shadow-lg text-xs font-bold text-teal-700 flex items-center gap-1.5 border border-teal-50">
                  <Sparkles size={14} /> AI Generated
                </div>
              </div>

              <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">ClaimEase</h1>
              <p className="text-slate-500 text-center mb-8 max-w-[280px]">Your stress-free companion for hospital bills and insurance claims.</p>

              <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    required
                  />
                </div>
                
                <button type="submit" className="w-full bg-teal-700 text-white rounded-2xl py-3.5 font-medium shadow-lg shadow-teal-900/20 hover:bg-teal-800 transition-colors mt-2">
                  Sign In
                </button>
              </form>

              <div className="w-full max-w-sm mt-6">
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Or continue with</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
                
                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-2xl py-3.5 font-medium flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Chrome size={20} className="text-blue-500" /> Google
                </button>
              </div>
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
            <header className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Select Insurance</h2>
              <p className="text-slate-500 text-sm">Choose your health insurance provider to sync your policy details.</p>
            </header>

            <div className="flex-1 overflow-y-auto pb-24 -mx-2 px-2">
              <div className="grid grid-cols-2 gap-3">
                {TOP_INSURANCE_COMPANIES.map((company) => (
                  <button
                    key={company.name}
                    onClick={() => setSelectedInsurance(company.name)}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-3 transition-all ${
                      selectedInsurance === company.name 
                        ? 'border-teal-500 bg-teal-50 shadow-md shadow-teal-900/10' 
                        : 'border-slate-200 bg-white hover:border-teal-200'
                    }`}
                  >
                    <CompanyLogo company={company} />
                    <span className="text-xs font-medium text-slate-700 line-clamp-2">{company.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-12">
              <button 
                onClick={() => setStep(3)}
                disabled={!selectedInsurance}
                className="w-full bg-teal-700 disabled:bg-slate-300 text-white rounded-2xl py-4 font-medium shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2"
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
            <header className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Find Your Hospital</h2>
              <p className="text-slate-500 text-sm">We'll collaborate directly with them for cashless claims.</p>
            </header>

            {!location ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-6">
                  <MapPin size={40} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Enable Location</h3>
                <p className="text-slate-500 text-sm mb-8 px-4">Allow access to your location to find the nearest network hospitals.</p>
                <div className="w-full space-y-3 mt-auto">
                  <button 
                    onClick={handleLocation}
                    className="w-full bg-teal-700 text-white rounded-2xl py-4 font-medium shadow-lg shadow-teal-900/20 hover:bg-teal-800 transition-colors"
                  >
                    Locate Me
                  </button>
                  <button 
                    onClick={() => setStep(4)}
                    className="w-full bg-transparent text-slate-500 rounded-2xl py-4 font-medium hover:bg-slate-100 transition-all"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="space-y-3">
                  {hospitals.map((hospital) => (
                    <button
                      key={hospital.id}
                      onClick={() => setSelectedHospital(hospital.name)}
                      className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left ${
                        selectedHospital === hospital.name 
                          ? 'border-teal-500 bg-teal-50 shadow-md shadow-teal-900/10' 
                          : 'border-slate-200 bg-white hover:border-teal-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedHospital === hospital.name ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Building2 size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">{hospital.name}</h4>
                        <p className="text-sm text-slate-500">{hospital.distance} away</p>
                      </div>
                      {selectedHospital === hospital.name && (
                        <CheckCircle2 className="text-teal-600" size={24} />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="mt-auto pt-6 space-y-3">
                  <button 
                    onClick={() => setStep(4)}
                    disabled={!selectedHospital}
                    className="w-full bg-teal-700 disabled:bg-slate-300 text-white rounded-2xl py-4 font-medium shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight size={20} />
                  </button>
                  <button 
                    onClick={() => setStep(4)}
                    className="w-full bg-transparent text-slate-500 rounded-2xl py-4 font-medium hover:bg-slate-100 transition-all"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 4: UPLOAD CARD */}
        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-12"
          >
            <header className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Insurance Card</h2>
              <p className="text-slate-500 text-sm">Upload your E-card or physical card for faster processing.</p>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full aspect-[1.6] bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-8 bg-white/20 rounded-md backdrop-blur-sm"></div>
                  <CreditCard className="text-white/50" size={24} />
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-3/4 bg-white/20 rounded-full"></div>
                  <div className="h-4 w-1/2 bg-white/20 rounded-full"></div>
                </div>
              </div>

              <button className="w-full bg-white border-2 border-dashed border-teal-200 text-teal-700 rounded-2xl py-4 font-medium flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors mb-4">
                <Camera size={20} /> Scan Insurance Card
              </button>
            </div>

            <div className="mt-auto space-y-3">
              <button 
                onClick={completeOnboarding}
                className="w-full bg-teal-700 text-white rounded-2xl py-4 font-medium shadow-lg shadow-teal-900/20 transition-all"
              >
                Upload & Finish
              </button>
              <button 
                onClick={completeOnboarding}
                className="w-full bg-transparent text-slate-500 rounded-2xl py-4 font-medium hover:bg-slate-100 transition-all"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
