
import React from 'react';
import { X, ShieldAlert, CheckCircle, Trash2, Users, FileText, AlertTriangle } from 'lucide-react';
import { Ad } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  ads: Ad[];
  setAds: React.Dispatch<React.SetStateAction<Ad[]>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, ads, setAds }) => {
  const reports = ads.filter(ad => ad.reports > 0);
  const pendingAds = ads.filter(ad => !ad.isApproved);

  const deleteAd = (id: string) => {
    if (confirm('Are you sure you want to delete this ad permanently?')) {
      setAds(prev => prev.filter(ad => ad.id !== id));
    }
  };

  const approveAd = (id: string) => {
    setAds(prev => prev.map(ad => ad.id === id ? { ...ad, isApproved: true } : ad));
  };

  const dismissReports = (id: string) => {
    setAds(prev => prev.map(ad => ad.id === id ? { ...ad, reports: 0 } : ad));
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-indigo-400" />
            <div>
              <h2 className="text-lg font-black tracking-tight">Admin Dashboard</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Oversight Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Active Ads</p>
              <p className="text-2xl font-black text-slate-800">{ads.length}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Reports</p>
              <p className="text-2xl font-black text-red-600">{reports.length}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Users</p>
              <p className="text-2xl font-black text-indigo-600">3</p>
            </div>
          </div>

          {/* Reported Ads */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="font-bold">Reported Content</h3>
            </div>
            {reports.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Everything looks clean!</p>
            ) : (
              <div className="space-y-3">
                {reports.map(ad => (
                  <div key={ad.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                        <img src={ad.images[0]} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{ad.title}</h4>
                        <p className="text-[10px] text-red-500 font-black uppercase tracking-wider">{ad.reports} Reports</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => dismissReports(ad.id)}
                        className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        title="Dismiss Reports"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => deleteAd(ad.id)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete Content"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Approval */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <FileText size={18} className="text-indigo-500" />
              <h3 className="font-bold">Pending Approval</h3>
            </div>
            {pendingAds.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No ads awaiting approval.</p>
            ) : (
              <div className="space-y-3">
                {pendingAds.map(ad => (
                  <div key={ad.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                        <img src={ad.images[0]} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{ad.title}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{ad.userName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => approveAd(ad.id)}
                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => deleteAd(ad.id)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
