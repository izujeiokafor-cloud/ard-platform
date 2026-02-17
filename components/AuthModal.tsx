
import React, { useState } from 'react';
import { X, Smartphone, Lock, ArrowRight, Loader2, CheckCircle2, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { db } from '../services/database';

interface AuthModalProps {
  onClose: () => void;
  onAuth: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuth }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'input' | 'success'>('input');
  const [phone, setPhone] = useState(localStorage.getItem('remembered_phone') || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password || (mode === 'signup' && !name)) {
      setError("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    setError('');

    const formattedPhone = phone.startsWith('0') ? `+234${phone.slice(1)}` : phone.startsWith('+') ? phone : `+234${phone}`;

    try {
      let user: User;
      if (mode === 'login') {
        user = await db.logIn(formattedPhone, password);
      } else {
        user = {
          id: 'user_' + Math.random().toString(36).substr(2, 9),
          name: name,
          phone: formattedPhone,
          password: password,
          role: 'user',
          avatar: `https://ui-avatars.com/api/?name=${name}&background=1a1a1a&color=fff`,
          joinedAt: Date.now()
        };
        await db.signUp(user);
      }
      
      localStorage.setItem('remembered_phone', phone);
      setStep('success');
      setTimeout(() => {
        onAuth(user);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 animate-in fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8 border border-slate-100">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={20} />
        </button>

        {step === 'input' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl">
                {mode === 'login' ? <Lock size={32} /> : <UserIcon size={32} />}
              </div>
              <h2 className="text-2xl font-black text-slate-800">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-sm text-slate-500">
                {mode === 'login' ? 'Sign in to access your local ads' : 'Join ARD and start posting local ads'}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center border border-red-100 animate-in shake duration-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] font-medium"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 font-bold border-r pr-2 h-6">
                  <span className="text-xs">🇳🇬</span>
                  <span className="text-sm">+234</span>
                </div>
                <input 
                  type="tel"
                  placeholder="803 000 0000"
                  className="w-full pl-20 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] font-medium"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] font-medium"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a1a1a] text-white h-14 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-xl disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>{mode === 'login' ? 'Login' : 'Sign Up'} <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="text-center">
              <button 
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#1a1a1a] transition-colors"
              >
                {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">{mode === 'login' ? 'Welcome Back!' : 'Account Created!'}</h2>
            <p className="text-slate-500">Accessing your secure feed...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
