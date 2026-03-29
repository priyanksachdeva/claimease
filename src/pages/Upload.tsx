import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, UploadCloud, CheckCircle2, X, FileText, RefreshCw, Aperture } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const [step, setStep] = useState<"select" | "camera" | "details" | "success">("select");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Clean up camera stream when component unmounts or step changes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStep("camera");
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions or use file upload.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPreviewUrl(dataUrl);
        setFileType('image/jpeg');
        stopCamera();
        setStep("details");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFileType(file.type);
      setStep("details");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("success");
    setTimeout(() => {
      navigate("/bills");
    }, 2000);
  };

  return (
    <div className="p-6 pt-12 min-h-full flex flex-col pb-24">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Add New Bill</h1>
        <button onClick={() => navigate(-1)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
          <X size={18} />
        </button>
      </header>

      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div 
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col gap-4"
          >
            <button 
              onClick={startCamera}
              className="flex-1 bg-teal-50 border-2 border-dashed border-teal-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-teal-700 hover:bg-teal-100/50 transition-colors cursor-pointer"
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                <Camera size={32} className="text-teal-600" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Scan Document</h3>
                <p className="text-sm text-teal-600/70">Use camera to scan physical bill</p>
              </div>
            </button>

            <input 
              type="file" 
              accept="image/*,application/pdf" 
              className="hidden" 
              id="file-upload" 
              onChange={handleFileUpload} 
            />
            <label 
              htmlFor="file-upload"
              className="flex-1 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <UploadCloud size={32} className="text-slate-400" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg text-slate-700">Upload File</h3>
                <p className="text-sm text-slate-500">Select PDF or image from device</p>
              </div>
            </label>
          </motion.div>
        )}

        {step === "camera" && (
          <motion.div 
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col relative bg-black rounded-3xl overflow-hidden shadow-2xl"
          >
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover absolute inset-0"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Camera UI Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => {
                    stopCamera();
                    setStep("select");
                  }} 
                  className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Align receipt in frame
                </div>
              </div>
              
              <div className="flex justify-center pb-8">
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40 hover:bg-white/30 transition-all active:scale-95 group"
                >
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-teal-600 group-hover:scale-95 transition-transform">
                    <Aperture size={28} />
                  </div>
                </button>
              </div>
            </div>
            
            {/* Scanning Guide Frame */}
            <div className="absolute inset-0 pointer-events-none z-0 p-8 flex items-center justify-center">
              <div className="w-full h-3/4 border-2 border-white/30 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
              </div>
            </div>
          </motion.div>
        )}

        {step === "details" && (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <div className="bg-slate-100 rounded-2xl h-40 mb-6 flex items-center justify-center relative overflow-hidden group border border-slate-200 shadow-inner">
              {fileType === 'application/pdf' ? (
                <div className="flex flex-col items-center text-slate-500 z-0">
                  <FileText size={48} className="mb-2 text-rose-400" />
                  <span className="text-sm font-medium">PDF Document Attached</span>
                </div>
              ) : previewUrl ? (
                <img src={previewUrl} alt="Scanned Bill" className="absolute inset-0 w-full h-full object-cover z-0" />
              ) : (
                <img src="https://picsum.photos/seed/medicalbill/400/200?blur=2" alt="Scanned Bill" className="absolute inset-0 w-full h-full object-cover opacity-50 z-0" referrerPolicy="no-referrer" />
              )}
              
              {/* Overlay for changing file */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <button 
                  type="button" 
                  onClick={() => setStep("select")} 
                  className="bg-white text-slate-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 hover:bg-slate-50"
                >
                  <RefreshCw size={16} /> Change File
                </button>
              </div>

              <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 size={14} className="text-teal-600" />
                Attached Successfully
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hospital / Clinic Name</label>
                <input type="text" defaultValue="Apollo Hospitals" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input type="number" defaultValue="2450.00" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" defaultValue="2026-03-25" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
                  <option>Consultation</option>
                  <option>Lab Test</option>
                  <option>Medicine</option>
                  <option>Surgery</option>
                  <option>Other</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-teal-700 text-white rounded-xl py-3.5 font-medium shadow-lg shadow-teal-900/20 mt-6 hover:bg-teal-800 transition-colors">
                Submit for Claim
              </button>
            </form>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Bill Added!</h2>
            <p className="text-slate-500 max-w-[250px]">Your bill has been securely saved and submitted for insurance processing.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
