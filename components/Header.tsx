
import React from 'react';
import { User as UserIcon, Shield, Bell, MapPin } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onAuthClick: () => void;
  onAdminClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onAuthClick, onAdminClick }) => {
  return (
    <header className="px-6 py-6 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
           <div className="relative w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10">
              <span className="text-white font-black text-2xl tracking-tighter">LP</span>
           </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-black text-white leading-none tracking-tight">LocalPulse</h1>
          <div className="flex items-center gap-1 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
            <MapPin size={10} /> San Francisco
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {user?.role === 'admin' && (
          <button 
            onClick={onAdminClick}
            className="w-10 h-10 bg-slate-800 text-indigo-400 flex items-center justify-center rounded-xl border border-white/5 hover:border-indigo-500/50 transition-all"
          >
            <Shield size={18} />
          </button>
        )}
        
        <button 
          onClick={onAuthClick}
          className="relative"
        >
          {user ? (
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} 
              alt={user.name} 
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500/20"
            />
          ) : (
            <div className="w-10 h-10 bg-slate-800 text-slate-400 flex items-center justify-center rounded-xl border border-white/5 hover:bg-slate-700 transition-all">
              <UserIcon size={20} />
            </div>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
