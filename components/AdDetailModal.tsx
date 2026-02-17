
import React, { useMemo, useState } from 'react';
import { X, Phone, MessageSquare, MapPin, Clock, Star, Flag, Repeat, Instagram, Video, Facebook, Youtube, Mail, Globe, Ticket, Globe2, Maximize2 } from 'lucide-react';
import { Ad, User, Review, AdInsights } from '../types';
import { formatDistance, formatTimeAgo, getExpiresIn, calculateDistance } from '../utils/location';
import ReviewSection from './ReviewSection';

interface AdDetailModalProps {
  ad: Ad;
  onClose: () => void;
  currentUser: User | null;
  userLocation: { lat: number, lng: number } | null;
  onReport: () => void;
  onRepost: () => void;
  onAddReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  onInsight: (type: keyof AdInsights) => void;
  onModalScroll?: (e: any) => void;
}

const AdDetailModal: React.FC<AdDetailModalProps> = ({ 
  ad, onClose, currentUser, userLocation, onReport, onRepost, onAddReview, onInsight, onModalScroll 
}) => {
  const [isImageMaximized, setIsImageMaximized] = useState(false);
  const isOwner = currentUser?.id === ad.userId;
  
  const minDistance = useMemo(() => {
    if (!userLocation) return null;
    if (ad.isAllLocations) return 0;
    return ad.locations.reduce((min, loc) => {
      const d = calculateDistance(userLocation as any, loc as any);
      return d < min ? d : min;
    }, Infinity);
  }, [userLocation, ad.locations, ad.isAllLocations]);

  const handleLinkClick = (type: keyof AdInsights) => {
    onInsight(type);
  };

  // Pre-filled WhatsApp message
  const whatsappMessage = encodeURIComponent(`I'm contacting you from [Ard]. I saw your post, your ad about "${ad.title}", and I want some more information.`);
  const whatsappUrl = `https://wa.me/${ad.contact.whatsapp.replace('+', '').replace(/ /g, '')}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-[250] bg-white flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
      {/* Maximized Image View */}
      {isImageMaximized && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => setIsImageMaximized(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all z-50"
          >
            <X size={24} />
          </button>
          <img 
            src={ad.images[0]} 
            className="w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in duration-300" 
            alt={ad.title} 
          />
          <div className="mt-4 text-white/60 text-xs font-black uppercase tracking-widest">{ad.title}</div>
        </div>
      )}

      {/* Header Image Area */}
      <div className="relative h-[45vh] shrink-0 bg-slate-900 group">
        <img 
          src={ad.images[0]} 
          className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" 
          alt={ad.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
        
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-30">
          <button 
            onClick={onClose}
            className="p-2.5 bg-black/40 backdrop-blur-xl text-white rounded-2xl hover:bg-black/60 transition-all shadow-lg border border-white/10"
          >
            <X size={20} />
          </button>
          <button 
            onClick={() => setIsImageMaximized(true)}
            className="p-2.5 bg-white/20 backdrop-blur-xl text-white rounded-2xl hover:bg-white/30 transition-all shadow-lg border border-white/20 flex items-center gap-2"
          >
            <Maximize2 size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Maximize</span>
          </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
           <div className="bg-[#1a1a1a] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border border-white/10">
              {ad.category}
           </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div 
        className="flex-1 overflow-y-auto px-6 pt-4 pb-32 space-y-6 hide-scrollbar"
        onScroll={onModalScroll}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-center text-slate-400">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <Clock size={12} className="text-indigo-500" />
                <span>Expires in {getExpiresIn(ad.expiresAt)}</span>
             </div>
             <div className="text-[10px] font-black uppercase tracking-widest">
                {formatTimeAgo(ad.createdAt)}
             </div>
          </div>
          <h2 className="text-3xl font-black text-[#1a1a1a] leading-tight tracking-tight uppercase">{ad.title}</h2>
          
          <div className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase">
             {ad.isAllLocations ? <Globe2 size={14} /> : <MapPin size={14} />}
             <span>{ad.isAllLocations ? 'National Presence' : minDistance !== null ? `${formatDistance(minDistance)} from you` : ad.locations[0].city}</span>
          </div>
        </div>

        <div className="p-5 bg-slate-50 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-slate-600 leading-relaxed text-sm font-medium">{ad.description}</p>
        </div>

        {/* Visibility Tags */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <div className="w-4 h-[1px] bg-slate-200"></div> Visibility Coverage
          </h4>
          <div className="flex flex-wrap gap-2">
            {ad.isAllLocations ? (
              <div className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-md text-[10px] font-black uppercase">
                <Globe2 size={12} /> Everywhere in Nigeria
              </div>
            ) : (
              ad.locations.map((loc, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white text-slate-800 px-4 py-2 rounded-2xl border border-slate-100 shadow-sm text-[10px] font-black uppercase">
                  <MapPin size={12} className="text-indigo-500" /> {loc.city}, {loc.state}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-2">
          {ad.contact.ticketLink && (
            <a 
              href={ad.contact.ticketLink} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => handleLinkClick('web')}
              className="col-span-2 flex items-center justify-center gap-3 p-4 bg-indigo-600 text-white rounded-[24px] font-black text-xs shadow-xl animate-pulse uppercase tracking-widest"
            >
              <Ticket size={18} /> Purchase Tickets
            </a>
          )}
          
          {[
            { label: 'Website', icon: <Globe size={16}/>, value: ad.contact.website, type: 'web' },
            { label: 'Email', icon: <Mail size={16}/>, value: ad.contact.email, type: 'web' },
            { label: 'Instagram', icon: <Instagram size={16}/>, value: ad.contact.instagram, type: 'socials' },
            { label: 'TikTok', icon: <Video size={16}/>, value: ad.contact.tiktok, type: 'socials' },
            { label: 'Facebook', icon: <Facebook size={16}/>, value: ad.contact.facebook, type: 'socials' },
            { label: 'YouTube', icon: <Youtube size={16}/>, value: ad.contact.youtube, type: 'socials' }
          ].filter(l => !!l.value).map((link, idx) => (
            <a 
              key={idx}
              href={link.label === 'Email' ? `mailto:${link.value}` : (link.value?.startsWith('http') ? link.value : `https://${link.value}`)} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(link.type as any)}
              className="flex items-center justify-center gap-2 p-4 bg-white border border-slate-100 rounded-[20px] text-[10px] font-black uppercase text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
            >
              {link.icon} {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4 p-5 bg-[#1a1a1a] rounded-[32px] text-white shadow-xl">
           <img 
            src={`https://ui-avatars.com/api/?name=${ad.userName}&background=random`} 
            className="w-12 h-12 rounded-2xl border-2 border-white/20 shadow-md"
            alt={ad.userName}
           />
           <div>
             <h4 className="text-sm font-black uppercase tracking-tight">{ad.userName}</h4>
             <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Verified Neighborhood Poster</p>
           </div>
        </div>

        <ReviewSection 
          reviews={ad.reviews} 
          onAddReview={onAddReview}
          currentUser={currentUser}
          isOwner={isOwner}
        />

        <div className="pt-8 text-center">
           {isOwner ? (
             <button 
               onClick={onRepost}
               className="w-full flex items-center justify-center gap-2 py-5 bg-[#1a1a1a] text-white rounded-[24px] font-black shadow-2xl hover:bg-black transition-all active:scale-95 uppercase tracking-widest"
             >
               <Repeat size={20} /> Extend for 24 Hours
             </button>
           ) : (
             <button 
               onClick={onReport}
               className="flex items-center justify-center gap-2 py-4 px-8 text-slate-300 font-black uppercase text-[10px] tracking-widest mx-auto hover:text-red-500 transition-colors"
             >
               <Flag size={14} /> Report Content
             </button>
           )}
        </div>
      </div>

      {/* Floating Action Bar - Anchored to bottom, protected from nav blocking by handleScroll */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-xl border-t border-slate-100 flex gap-3 z-[260] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleLinkClick('whatsapp')}
          className="flex-[1.5] bg-[#25D366] text-white h-16 rounded-[24px] flex items-center justify-center gap-3 font-black shadow-xl hover:shadow-2xl transition-all active:scale-95 uppercase text-xs tracking-widest"
        >
          <MessageSquare size={24} /> WhatsApp
        </a>
        <a 
          href={`tel:${ad.contact.phone}`}
          onClick={() => handleLinkClick('calls')}
          className="flex-1 bg-[#1a1a1a] text-white h-16 rounded-[24px] flex items-center justify-center gap-3 font-black shadow-xl hover:shadow-2xl transition-all active:scale-95 uppercase text-xs tracking-widest"
        >
          <Phone size={24} /> Call
        </a>
      </div>
    </div>
  );
};

export default AdDetailModal;
