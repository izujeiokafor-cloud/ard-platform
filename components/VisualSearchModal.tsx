
import React, { useState, useRef } from 'react';
import { X, Camera, Image as ImageIcon, Loader2, RefreshCcw, AlertCircle } from 'lucide-react';

interface VisualSearchModalProps {
  onClose: () => void;
  onSearch: (imageB64: string) => void;
}

const VisualSearchModal: React.FC<VisualSearchModalProps> = ({ onClose, onSearch }) => {
  const [mode, setMode] = useState<'selection' | 'camera'>('selection');
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setCamError(null);
    setMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      let errorMsg = "Oga/Madam, we couldn't open your camera.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = "Camera access denied. Please enable camera permissions in your settings.";
      } else if (err.name === 'NotFoundError') {
        errorMsg = "No camera found on this device.";
      } else if (window.location.protocol !== 'https:') {
        errorMsg = "Camera search requires a secure (HTTPS) connection.";
      }
      setCamError(errorMsg);
      setMode('selection');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
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
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreview(dataUrl);
        stopCamera();
        setMode('selection');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      setIsProcessing(true);
      onSearch(preview);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 animate-in fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { stopCamera(); onClose(); }} />
      
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100">
        <div className="p-4 bg-[#1a1a1a] text-white flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest">Visual Search</h2>
          <button onClick={() => { stopCamera(); onClose(); }} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {camError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in shake duration-300">
              <AlertCircle className="text-red-500 shrink-0" size={18} />
              <p className="text-[10px] font-black uppercase leading-relaxed text-red-600">{camError}</p>
            </div>
          )}

          {mode === 'camera' ? (
            <div className="relative aspect-square bg-black rounded-2xl overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <button 
                onClick={capturePhoto}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-200 active:scale-90 transition-all shadow-xl"
              />
            </div>
          ) : preview ? (
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={preview} className="w-full h-full object-cover" alt="Search item" />
                <button 
                  onClick={() => setPreview(null)}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full"
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
              <button 
                onClick={handleConfirm}
                disabled={isProcessing}
                className="w-full h-14 bg-[#1a1a1a] text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : 'Search with this Image'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={startCamera}
                className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-3xl hover:bg-slate-100 transition-all group"
              >
                <Camera size={32} className="text-slate-400 group-hover:text-[#1a1a1a] mb-2" />
                <span className="text-[10px] font-black uppercase text-slate-500">Camera</span>
              </button>
              <label className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-3xl hover:bg-slate-100 transition-all group cursor-pointer">
                <ImageIcon size={32} className="text-slate-400 group-hover:text-[#1a1a1a] mb-2" />
                <span className="text-[10px] font-black uppercase text-slate-500">Gallery</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
          
          <p className="text-[10px] text-slate-400 text-center font-bold leading-relaxed px-4">
            AI will identify the item in your photo and find similar listings near you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisualSearchModal;
