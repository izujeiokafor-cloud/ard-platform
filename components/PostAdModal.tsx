
import React, { useState, useMemo, useEffect } from 'react';
import { X, Camera, MapPin, Loader2, Tag, ChevronDown, Phone, MessageSquare, Instagram, Youtube, Facebook, Mail, Globe, Ticket, Video, Plus, Trash2, Globe2, Edit3 } from 'lucide-react';
import { Category, Ad, User, Location } from '../types';
import { LOCATION_DATA } from '../store/locationData';

interface PostAdModalProps {
  onClose: () => void;
  onPost: (ad: Ad) => void;
  user: User;
  initialLocation: Location;
  adToEdit?: Ad;
}

const CATEGORIES: Category[] = ['Services', 'Businesses', 'Events', 'Jobs', 'Healthy'];

interface ExtraLocation {
  state: string;
  city: string;
}

const PostAdModal: React.FC<PostAdModalProps> = ({ onClose, onPost, user, initialLocation, adToEdit }) => {
  const [loading, setLoading] = useState(false);
  const [isAllLocations, setIsAllLocations] = useState(adToEdit?.isAllLocations || false);
  const [extraLocations, setExtraLocations] = useState<ExtraLocation[]>(
    adToEdit ? adToEdit.locations.slice(1).map(l => ({ state: l.state, city: l.city })) : []
  );

  // Helper to extract username from full social URL
  const getUsername = (url: string | undefined, platform: string) => {
    if (!url) return '';
    const clean = url.trim();
    if (!clean.includes(platform)) return clean.replace('@', '');
    
    try {
      const parts = clean.split(`${platform}/`);
      let username = parts[parts.length - 1];
      if (username.startsWith('@')) username = username.slice(1);
      if (username.endsWith('/')) username = username.slice(0, -1);
      return username.split('?')[0]; // remove query params
    } catch (e) {
      return clean;
    }
  };
  
  const [formData, setFormData] = useState({
    title: adToEdit?.title || '',
    description: adToEdit?.description || '',
    category: adToEdit?.category || CATEGORIES[0],
    keywords: adToEdit?.keywords.join(', ') || '',
    phone: adToEdit?.contact.phone.replace('+234', '') || '',
    whatsapp: adToEdit?.contact.whatsapp.replace('+234', '') || '',
    instagram: getUsername(adToEdit?.contact.instagram, 'instagram.com'),
    tiktok: getUsername(adToEdit?.contact.tiktok, 'tiktok.com'),
    facebook: getUsername(adToEdit?.contact.facebook, 'facebook.com'),
    youtube: getUsername(adToEdit?.contact.youtube, 'youtube.com'),
    email: adToEdit?.contact.email || '',
    website: adToEdit?.contact.website || '',
    ticketLink: adToEdit?.contact.ticketLink || '',
    imagePreview: adToEdit?.images[0] || '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ 
        ...formData, 
        imagePreview: URL.createObjectURL(file) 
      });
    }
  };

  const addExtraLocation = () => {
    if (extraLocations.length < 2) {
      setExtraLocations([...extraLocations, { state: '', city: '' }]);
    }
  };

  const removeExtraLocation = (index: number) => {
    setExtraLocations(extraLocations.filter((_, i) => i !== index));
  };

  const updateExtraLocation = (index: number, field: keyof ExtraLocation, value: string) => {
    const newLocs = [...extraLocations];
    newLocs[index] = { ...newLocs[index], [field]: value };
    if (field === 'state') newLocs[index].city = '';
    setExtraLocations(newLocs);
  };

  const formatPhoneNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.startsWith('0')) return cleaned.slice(1);
    return cleaned;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.whatsapp) {
      alert("Call Line and WhatsApp Line are mandatory.");
      return;
    }

    if (!isAllLocations) {
      for (const loc of extraLocations) {
        if (!loc.state || !loc.city) {
          alert("Please fill in both State and City for your additional locations.");
          return;
        }
      }
    }
    
    setLoading(true);

    setTimeout(() => {
      const keywordArray = formData.keywords
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);

      const locations: Location[] = [initialLocation];

      if (!isAllLocations) {
        extraLocations.forEach(loc => {
          const stateData = LOCATION_DATA.find(s => s.name === loc.state);
          const cityData = stateData?.cities.find(c => c.name === loc.city);
          if (cityData) {
            locations.push({
              state: loc.state,
              city: loc.city,
              lat: cityData.lat,
              lng: cityData.lng
            });
          }
        });
      }

      // Prepend social links
      const cleanUsername = (u: string) => u.trim().replace('@', '');
      
      const newAd: Ad = {
        id: adToEdit?.id || Math.random().toString(36).substr(2, 9),
        userId: user.id,
        userName: user.name,
        title: formData.title,
        description: formData.description,
        category: formData.category as Category,
        keywords: keywordArray,
        images: formData.imagePreview ? Array(6).fill(formData.imagePreview) : Array.from({ length: 6 }).map((_, i) => `https://picsum.photos/seed/${Math.random() + i}/800/1200`),
        contact: {
          phone: `+234${formData.phone}`,
          whatsapp: `+234${formData.whatsapp}`,
          instagram: formData.instagram ? `https://www.instagram.com/${cleanUsername(formData.instagram)}` : undefined,
          tiktok: formData.tiktok ? `https://www.tiktok.com/@${cleanUsername(formData.tiktok)}` : undefined,
          facebook: formData.facebook ? `https://www.facebook.com/${cleanUsername(formData.facebook)}` : undefined,
          youtube: formData.youtube ? `https://www.youtube.com/@${cleanUsername(formData.youtube)}` : undefined,
          email: formData.email || undefined,
          website: formData.website || undefined,
          ticketLink: formData.category === 'Events' ? formData.ticketLink : undefined
        },
        locations: locations,
        isAllLocations: isAllLocations,
        createdAt: adToEdit?.createdAt || Date.now(),
        expiresAt: adToEdit?.expiresAt || Date.now() + (24 * 60 * 60 * 1000),
        reports: adToEdit?.reports || 0,
        isApproved: true,
        reviews: adToEdit?.reviews || [],
        insights: adToEdit?.insights || {
          views: 0,
          contacts: 0,
          calls: 0,
          whatsapp: 0,
          socials: 0,
          web: 0
        }
      };

      onPost(newAd);
      setLoading(false);
      onClose();
    }, 800);
  };

  const SocialInput = ({ 
    icon: Icon, 
    prefix, 
    value, 
    onChange, 
    placeholder 
  }: { 
    icon: any, 
    prefix: string, 
    value: string, 
    onChange: (val: string) => void, 
    placeholder: string 
  }) => (
    <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden group focus-within:ring-2 focus-within:ring-[#1a1a1a]/5 focus-within:border-slate-300 transition-all">
      <div className="pl-3.5 flex items-center text-slate-300 group-focus-within:text-indigo-500 transition-colors">
        <Icon size={16} />
      </div>
      <div className="pl-2 pr-0.5 py-4 text-[10px] font-black text-slate-400 whitespace-nowrap select-none uppercase tracking-tighter">
        {prefix}
      </div>
      <input 
        type="text" 
        placeholder={placeholder}
        className="flex-1 bg-transparent py-4 pr-4 focus:outline-none text-xs font-bold text-slate-700"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-[#1a1a1a] border border-slate-100">
        <div className="p-4 bg-[#1a1a1a] flex items-center justify-between text-white sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-2">
            {adToEdit ? <Edit3 size={18} className="text-indigo-400" /> : <Plus size={18} className="text-green-400" />}
            <h2 className="text-lg font-black italic tracking-tighter uppercase">
              {adToEdit ? 'Edit Your Ad' : 'Post New Ad'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 hide-scrollbar bg-white">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Media</label>
            <div className="relative aspect-[3/2] w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 transition-all overflow-hidden group">
              {formData.imagePreview ? (
                <img src={formData.imagePreview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Camera className="text-slate-300" size={32} />
                  <span className="text-[10px] text-slate-400 font-black uppercase">Attach Cover Photo</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ad Coverage</label>
               <button 
                type="button"
                onClick={() => setIsAllLocations(!isAllLocations)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${isAllLocations ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white' : 'bg-white border-slate-200 text-slate-400'}`}
               >
                 <Globe2 size={12} />
                 <span className="text-[10px] font-black uppercase">All Locations</span>
               </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-indigo-500" />
                <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase leading-none mb-1">Primary Location</p>
                   <p className="text-sm font-bold text-slate-700">{initialLocation.city}, {initialLocation.state}</p>
                </div>
              </div>
              <span className="text-[8px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded font-black uppercase">Home</span>
            </div>

            {!isAllLocations && (
              <div className="space-y-3">
                {extraLocations.map((loc, index) => {
                  const stateData = LOCATION_DATA.find(s => s.name === loc.state);
                  return (
                    <div key={index} className="space-y-2 p-4 bg-white border border-slate-100 rounded-2xl animate-in slide-in-from-right duration-200">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] text-slate-400 font-black uppercase">Extra Location {index + 1}</p>
                        <button 
                          type="button" 
                          onClick={() => removeExtraLocation(index)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                         <div className="relative">
                           <select 
                            required
                            className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold text-slate-700 appearance-none"
                            value={loc.state}
                            onChange={e => updateExtraLocation(index, 'state', e.target.value)}
                           >
                             <option value="" disabled>State</option>
                             {LOCATION_DATA.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                           </select>
                           <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                         </div>
                         <div className="relative">
                           <select 
                            required
                            disabled={!loc.state}
                            className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold text-slate-700 appearance-none disabled:opacity-50"
                            value={loc.city}
                            onChange={e => updateExtraLocation(index, 'city', e.target.value)}
                           >
                             <option value="" disabled>City</option>
                             {stateData?.cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                           </select>
                           <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                         </div>
                      </div>
                    </div>
                  );
                })}
                
                {extraLocations.length < 2 && (
                  <button 
                    type="button"
                    onClick={addExtraLocation}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-all active:scale-95"
                  >
                    <Plus size={16} />
                    <span className="text-[10px] font-black uppercase">Add Another Location</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Post Content</label>
            <input 
              required
              type="text" 
              placeholder="Title"
              className="w-full px-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 text-sm font-bold"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />

            <textarea 
              required
              rows={3}
              placeholder="Description"
              className="w-full px-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 text-sm resize-none font-medium"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />

            <select 
              className="w-full px-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 text-sm font-bold text-slate-700"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mandatory Contacts</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 font-bold border-r pr-2 h-4">
                  <span className="text-[10px]">+234</span>
                </div>
                <input 
                  required
                  type="tel" 
                  placeholder="Call Line"
                  className="w-full pl-24 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 text-sm font-medium"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              </div>
              <div className="relative">
                <div className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 font-bold border-r pr-2 h-4">
                  <span className="text-[10px]">+234</span>
                </div>
                <input 
                  required
                  type="tel" 
                  placeholder="WhatsApp Line"
                  className="w-full pl-24 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 text-sm font-medium"
                  value={formData.whatsapp}
                  onChange={e => setFormData({ ...formData, whatsapp: formatPhoneNumber(e.target.value) })}
                />
                <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Links & Socials</label>
            
            <div className="grid grid-cols-1 gap-3">
              <SocialInput 
                icon={Instagram} 
                prefix="instagram.com/" 
                value={formData.instagram}
                onChange={v => setFormData({ ...formData, instagram: v })}
                placeholder="username"
              />
              <SocialInput 
                icon={Video} 
                prefix="tiktok.com/@" 
                value={formData.tiktok}
                onChange={v => setFormData({ ...formData, tiktok: v })}
                placeholder="username"
              />
              <SocialInput 
                icon={Facebook} 
                prefix="facebook.com/" 
                value={formData.facebook}
                onChange={v => setFormData({ ...formData, facebook: v })}
                placeholder="username"
              />
              <SocialInput 
                icon={Youtube} 
                prefix="youtube.com/@" 
                value={formData.youtube}
                onChange={v => setFormData({ ...formData, youtube: v })}
                placeholder="username"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="email" 
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none text-xs font-medium"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Website"
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none text-xs font-medium"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Keywords</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Keywords (comma separated)"
                className="w-full pl-10 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none text-sm font-medium"
                value={formData.keywords}
                onChange={e => setFormData({ ...formData, keywords: e.target.value })}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a1a] text-white h-16 rounded-3xl flex items-center justify-center gap-2 font-black shadow-xl hover:bg-black disabled:opacity-50 transition-all active:scale-95 mt-4 sticky bottom-0 z-10"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (adToEdit ? 'UPDATE AD' : 'PUBLISH LIVE AD')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostAdModal;
