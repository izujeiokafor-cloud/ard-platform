
import React, { useState } from 'react';
import { User, Ad } from '../types';
import { Settings, LogOut, ChevronRight, Eye, MousePointer2, Clock, Trash2, Repeat, BarChart3, Package, Heart, Edit3, PhoneCall, MessageCircle, Share2, Star } from 'lucide-react';
import { formatTimeAgo, getExpiresIn } from '../utils/location';

interface ProfileDashboardProps {
  user: User;
  onLogout: () => void;
  ads: Ad[];
  onDeleteAd: (id: string) => void;
  onRepostAd: (id: string) => void;
  onEditAd: (ad: Ad) => void;
  onUpdateProfile: (data: Partial<User>) => void;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ 
  user, 
  onLogout, 
  ads, 
  onDeleteAd, 
  onRepostAd,
  onEditAd,
  onUpdateProfile 
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'insights' | 'settings'>('posts');
  const userAds = ads.filter(ad => ad.userId === user.id);

  const stats = {
    views: userAds.reduce((acc, ad) => acc + (ad.insights?.views || 0), 0),
    whatsapp: userAds.reduce((acc, ad) => acc + (ad.insights?.whatsapp || 0), 0),
    calls: userAds.reduce((acc, ad) => acc + (ad.insights?.calls || 0), 0),
    socials: userAds.reduce((acc, ad) => acc + (ad.insights?.socials || 0), 0),
    reviews: userAds.reduce((acc, ad) => acc + ad.reviews.length, 0),
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 animate-in fade-in slide-in-from-right duration-300 pb-24">
      <div className="bg-[#1a1a1a] text-white px-6 pt-12 pb-8 rounded-b-[40px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=fff&color=1a1a1a`} 
              className="w-20 h-20 rounded-3xl border-4 border-white/10 object-cover shadow-2xl"
              alt={user.name}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black">{user.name}</h2>
            <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-1">
              {user.phone}
            </p>
            <div className="flex gap-2 mt-3">
              <span className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-white/5">
                Member since {new Date(user.joinedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-8">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <p className="text-xs font-black text-white/40 uppercase tracking-tighter mb-1">Views</p>
            <p className="text-lg font-black">{stats.views}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <p className="text-xs font-black text-white/40 uppercase tracking-tighter mb-1">WA</p>
            <p className="text-lg font-black">{stats.whatsapp}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <p className="text-xs font-black text-white/40 uppercase tracking-tighter mb-1">Calls</p>
            <p className="text-lg font-black">{stats.calls}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <p className="text-xs font-black text-white/40 uppercase tracking-tighter mb-1">Star</p>
            <p className="text-lg font-black">{stats.reviews}</p>
          </div>
        </div>
      </div>

      <div className="flex px-6 gap-6 mt-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'posts' ? 'text-[#1a1a1a]' : 'text-slate-400'
          }`}
        >
          My Posts ({userAds.length})
          {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a1a1a] rounded-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('insights')}
          className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'insights' ? 'text-[#1a1a1a]' : 'text-slate-400'
          }`}
        >
          Analytics
          {activeTab === 'insights' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a1a1a] rounded-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'settings' ? 'text-[#1a1a1a]' : 'text-slate-400'
          }`}
        >
          Settings
          {activeTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a1a1a] rounded-full"></div>}
        </button>
      </div>

      <div className="px-6 py-6">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {userAds.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <Package className="mx-auto mb-4 text-slate-300" size={48} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active posts.</p>
              </div>
            ) : (
              userAds.map(ad => (
                <div key={ad.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-4 group transition-all hover:shadow-md">
                  <div className="flex gap-4">
                    <img src={ad.images[0]} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-[#1a1a1a] truncate text-sm">{ad.title}</h4>
                        <span className="bg-slate-50 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-slate-100">
                          {ad.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Eye size={10} /> {ad.insights?.views || 0}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <MessageCircle size={10} /> {ad.reviews.length}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-[10px] font-black text-amber-600 uppercase">
                        <Clock size={10} /> {getExpiresIn(ad.expiresAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-50">
                    <button 
                      onClick={() => onEditAd(ad)}
                      className="flex items-center justify-center gap-2 h-10 rounded-xl bg-slate-50 text-indigo-600 text-[10px] font-black uppercase border border-slate-100"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => onRepostAd(ad.id)}
                      className="flex items-center justify-center gap-2 h-10 rounded-xl bg-slate-50 text-[#1a1a1a] text-[10px] font-black uppercase border border-slate-100"
                    >
                      <Repeat size={14} /> Renew
                    </button>
                    <button 
                      onClick={() => onDeleteAd(ad.id)}
                      className="flex items-center justify-center gap-2 h-10 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase border border-red-100"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Engagement Summary</h3>
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Eye size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black">Ad Impressions</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Total Views</p>
                      </div>
                    </div>
                    <span className="text-lg font-black">{stats.views}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <MessageCircle size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black">WhatsApp Clicks</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Direct Messaging</p>
                      </div>
                    </div>
                    <span className="text-lg font-black">{stats.whatsapp}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <PhoneCall size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black">Voice Calls</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Dialed</p>
                      </div>
                    </div>
                    <span className="text-lg font-black">{stats.calls}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
                        <Share2 size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black">Social Clicks</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">External Links</p>
                      </div>
                    </div>
                    <span className="text-lg font-black">{stats.socials}</span>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Latest Feedback</h3>
               <div className="space-y-4">
                  {userAds.flatMap(a => a.reviews).sort((a,b) => b.createdAt - a.createdAt).slice(0, 5).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No reviews yet.</p>
                  ) : (
                    userAds.flatMap(a => a.reviews).sort((a,b) => b.createdAt - a.createdAt).slice(0, 5).map(rev => (
                      <div key={rev.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-[#1a1a1a]">{rev.userName}</span>
                            <div className="flex items-center gap-0.5 text-amber-500">
                               {Array.from({length: rev.rating}).map((_,i) => <Star key={i} size={8} fill="currentColor" />)}
                            </div>
                         </div>
                         <p className="text-[10px] text-slate-600 font-medium italic">"{rev.comment}"</p>
                         <p className="text-[8px] text-slate-400 mt-1 uppercase font-black">{formatTimeAgo(rev.createdAt)}</p>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden divide-y divide-slate-50 shadow-sm">
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Settings size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-[#1a1a1a]">Privacy & Security</p>
                    <p className="text-[10px] text-slate-400 font-bold">Manage visibility and data</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-[#1a1a1a]" />
              </button>
              
              <button 
                onClick={onLogout}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-red-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                    <LogOut size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-red-600">Sign Out</p>
                    <p className="text-[10px] text-red-300 font-bold">Securely end session</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-red-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDashboard;
