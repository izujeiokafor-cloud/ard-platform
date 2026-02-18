
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Ad, User, Location, Category, Review, AdInsights } from './types';
import { Search, Plus, Home, Compass, User as UserIcon, MapPin, SlidersHorizontal, Loader2, ChevronDown, ChevronRight, Shield, Mic, Camera, HelpCircle, Info, PhoneCall, Scale, X, Globe2, Sparkles, Zap } from 'lucide-react';
import { calculateDistance } from './utils/location';
import { performSmartSearch, performVisualSearch } from './services/gemini';
import { db } from './services/database';

// Components
import PostAdModal from './components/PostAdModal';
import AuthModal from './components/AuthModal';
import VoiceSearchButton from './components/VoiceSearchButton';
import VisualSearchModal from './components/VisualSearchModal';
import AdCarouselSlot from './components/AdCarouselSlot';
import AdDetailModal from './components/AdDetailModal';
import LocationModal from './components/LocationModal';
import ProfileDashboard from './components/ProfileDashboard';
import FilterModal from './components/FilterModal';
import AdminPanel from './components/AdminPanel';

const CATEGORIES: Category[] = ['Services', 'Businesses', 'Events', 'Jobs', 'Healthy'];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  
  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<'about' | 'how' | 'contact' | 'terms' | null>(null);
  
  // State
  const [viewMode, setViewMode] = useState<'feed' | 'profile'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchExplanation, setSearchExplanation] = useState('');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [searchResultIds, setSearchResultIds] = useState<string[] | null>(null);

  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<number | null>(null);

  const [sortOrder, setSortOrder] = useState<'newest' | 'distance'>('distance');
  const [maxDistance, setMaxDistance] = useState<number>(50);

  const detectLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: Location = { 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude, 
            city: 'Near You', 
            state: 'Detected' 
          };
          setUserLocation(loc);
        },
        () => {
          const fallback = { lat: 6.5244, lng: 3.3792, city: 'Lagos Island', state: 'Lagos' };
          setUserLocation(fallback);
        }
      );
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const [fetchedAds, currentUser] = await Promise.all([
          db.getAds(),
          db.getCurrentUser()
        ]);
        setAds(fetchedAds);
        setUser(currentUser);
        setIsLive(true);
      } catch (err) {
        console.error("Failed to connect to platform database", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
    detectLocation();
  }, [detectLocation]);

  const handleScroll = useCallback((e: any) => {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY > lastScrollY.current && currentScrollY > 30) {
      setIsNavVisible(false);
    } else {
      setIsNavVisible(true);
    }
    lastScrollY.current = currentScrollY;

    if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => {
      setIsNavVisible(true);
    }, 1500); 
  }, []);

  const handleInsight = async (adId: string, type: keyof AdInsights) => {
    const ad = ads.find(a => a.id === adId);
    if (!ad) return;

    const newInsights = { ...ad.insights };
    newInsights[type] = (newInsights[type] || 0) + 1;
    
    if (['calls', 'whatsapp', 'socials', 'web'].includes(type)) {
      newInsights.contacts = (newInsights.contacts || 0) + 1;
    }

    const updated = await db.updateAd(adId, { insights: newInsights });
    if (updated) {
      setAds(prev => {
        const nextAds = prev.map(a => a.id === adId ? updated : a);
        if (selectedAd?.id === adId) setSelectedAd(updated);
        return nextAds;
      });
    }
  };

  const handleAdClick = (ad: Ad) => {
    handleInsight(ad.id, 'views');
    setSelectedAd(ad);
  };

  const filteredAds = useMemo(() => {
    let result = ads.filter(ad => ad && ad.expiresAt > Date.now() && ad.isApproved);
    if (searchResultIds !== null) result = result.filter(ad => searchResultIds.includes(ad.id));
    if (activeCategory !== 'All') result = result.filter(ad => ad.category === activeCategory);

    if (userLocation && maxDistance < 100) {
      result = result.filter(ad => {
        if (ad.isAllLocations) return true;
        return ad.locations.some(loc => calculateDistance(userLocation, loc) <= maxDistance);
      });
    }

    if (sortOrder === 'distance' && userLocation) {
      result = [...result].sort((a, b) => {
        const distA = a.locations.reduce((m, l) => Math.min(m, calculateDistance(userLocation, l)), Infinity);
        const distB = b.locations.reduce((min, l) => Math.min(min, calculateDistance(userLocation, l)), Infinity);
        return distA - distB;
      });
    } else {
      result = [...result].sort((a, b) => b.createdAt - a.createdAt);
    }
    return result;
  }, [ads, activeCategory, userLocation, searchResultIds, sortOrder, maxDistance]);

  const chunkedAds = useMemo(() => {
    const chunks = [];
    const adsToChunk = [...filteredAds];
    for (let i = 0; i < adsToChunk.length; i += 6) {
      chunks.push(adsToChunk.slice(i, i + 6));
    }
    return chunks;
  }, [filteredAds]);

  const handleAddReview = async (adId: string, reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const review: Review = {
      ...reviewData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    await db.addReview(adId, review);
    setAds(prev => {
      const nextAds = prev.map(a => a.id === adId ? { ...a, reviews: [review, ...a.reviews] } : a);
      if (selectedAd?.id === adId) {
        const updated = nextAds.find(a => a.id === adId);
        if (updated) setSelectedAd(updated);
      }
      return nextAds;
    });
  };

  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    try {
      const res = await performSmartSearch(searchQuery, ads);
      setSearchResultIds(res.adIds);
      setSearchExplanation(res.explanation);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchExplanation("Oga, the AI is having a moment. Try again shortly!");
    } finally {
      setIsSearching(false);
    }
  };

  const handleVisualSearchComplete = async (img: string) => {
    setIsSearching(true);
    setIsVisualSearchOpen(false);
    try {
      const res = await performVisualSearch(img, ads);
      setSearchResultIds(res.adIds);
      setSearchExplanation(res.explanation);
    } catch (err) {
      console.error("Visual search failed:", err);
      setSearchExplanation("We couldn't process that photo. Try a clearer one!");
    } finally {
      setIsSearching(false);
    }
  };

  const InfoModalComponent = ({ type, onClose }: { type: 'about' | 'how' | 'contact' | 'terms', onClose: () => void }) => {
    const content = {
      about: { title: "About ARD Platform", text: "ARD (Ad Discovery Real-time) is a community-first ecosystem designed for instant local awareness. We connect neighborhood services, legitimate businesses, and verified locals in real-time." },
      how: { title: "Production Guide", text: "Post any ad, event, or job. It remains live for exactly 24 hours to ensure the feed stays clean and relevant. Renewing takes one tap. Our Gemini AI ensures your searches are lightning fast." },
      contact: { title: "Enterprise Contact", text: "Questions? Feedback? Reach our platform team at help@ardplatform.com or call our neighborhood hotline at +234 800-ARD-PRO." },
      terms: { title: "Privacy & Terms", text: "Users must be respectful. No fraudulent ads. ARD is a discovery layer; we do not broker payments. Your location data is used only for distance calculation." }
    }[type];
    return (
      <div className="fixed inset-0 z-[350] flex items-center justify-center p-6 animate-in fade-in">
        <div className="absolute inset-0 bg-[#1a1a1a]/80 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl border border-slate-100">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-tight italic">{content.title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
           </div>
           <p className="text-slate-600 leading-relaxed text-sm font-medium">{content.text}</p>
           <button onClick={onClose} className="w-full mt-8 py-5 bg-[#1a1a1a] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">Understood</button>
        </div>
      </div>
    );
  };

  const PageFooter = () => (
    <footer className="py-16 px-8 bg-white border-t border-slate-50">
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-2xl tracking-tighter italic">ARD</div>
          <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-widest">Live Platform Status</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-center">
          <button onClick={() => setInfoModal('about')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#1a1a1a] flex items-center justify-center gap-2"><Info size={14}/> About</button>
          <button onClick={() => setInfoModal('how')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#1a1a1a] flex items-center justify-center gap-2"><HelpCircle size={14}/> Guide</button>
          <button onClick={() => setInfoModal('contact')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#1a1a1a] flex items-center justify-center gap-2"><PhoneCall size={14}/> Support</button>
          <button onClick={() => setInfoModal('terms')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#1a1a1a] flex items-center justify-center gap-2"><Scale size={14}/> Legal</button>
        </div>
        <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.4em] text-center border-t border-slate-50 pt-8 w-full max-w-[200px]">
          ARD CORE • NEIGHBORHOOD PULSE • © 2024
        </p>
      </div>
    </footer>
  );

  if (isLoading) return (
    <div className="max-w-md mx-auto h-screen bg-[#1a1a1a] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center font-black animate-bounce shadow-[0_0_50px_rgba(255,255,255,0.3)] relative z-10">
          <span className="text-2xl italic tracking-tighter">ARD</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
         <Loader2 className="animate-spin text-white/20" size={24} />
         <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">Connecting to Platform...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white text-[#1a1a1a] relative shadow-2xl flex flex-col overflow-hidden font-sans">
      {viewMode === 'feed' && (
        <header className="px-4 pt-5 pb-3 space-y-3 shrink-0 bg-[#1a1a1a] text-white transition-all duration-300 z-[100] shadow-2xl border-b border-white/5">
          <div className="flex items-center justify-between relative min-h-[44px]">
             <button onClick={() => setIsLocationModalOpen(true)} className="flex items-center gap-2 text-white z-10 group">
               <div className="w-9 h-9 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 transition-all group-active:scale-90 group-active:bg-white/10">
                  <MapPin size={16} className="text-white/40" /> 
               </div>
               <div className="flex flex-col items-start leading-none">
                 <span className="text-[12px] font-black tracking-tight">{userLocation?.city || 'Initializing...'}</span>
                 <span className="text-[7px] text-white/30 font-black uppercase tracking-widest flex items-center gap-1">
                   {userLocation?.state || 'Detection Active'} <ChevronDown size={8} />
                 </span>
               </div>
             </button>

             <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                <div className="relative w-10 h-10 bg-white rounded-[14px] flex items-center justify-center shadow-2xl transform rotate-2 border border-white/20">
                   <span className="font-black text-[#1a1a1a] text-[16px] tracking-tighter italic">ARD</span>
                   {isLive && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1a1a1a]" />}
                </div>
             </div>

             <div className="flex items-center gap-2 z-10">
               {user?.role === 'admin' && (
                 <button onClick={() => setIsAdminPanelOpen(true)} className="p-2 text-indigo-400 bg-white/5 rounded-xl border border-white/5"><Shield size={20} /></button>
               )}
               <button onClick={() => setIsFilterModalOpen(true)} className="p-2 text-white/50 bg-white/5 rounded-xl border border-white/5 hover:text-white hover:bg-white/10 transition-all"><SlidersHorizontal size={20} /></button>
             </div>
          </div>

          <div className="relative group">
             <form onSubmit={handleTextSearch} className="relative flex-1">
                <input
                  type="text"
                  placeholder={isListening ? "Listening closely..." : "Discover services, events, people..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-6 pr-24 py-4 bg-white/95 rounded-[22px] text-[12px] font-bold text-slate-800 focus:outline-none placeholder-slate-400 shadow-2xl transition-all focus:bg-white"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center bg-slate-100 p-1.5 rounded-[18px] shadow-inner">
                  <VoiceSearchButton 
                    onTranscriptionComplete={(text) => {
                      setSearchQuery(text);
                      setIsSearching(true);
                      performSmartSearch(text, ads)
                        .then(res => {
                          setSearchResultIds(res.adIds);
                          setSearchExplanation(res.explanation);
                        })
                        .finally(() => setIsSearching(false));
                    }}
                    onTranscriptionPartial={(text) => setSearchQuery(text)}
                    onListeningStateChange={setIsListening}
                    isProcessing={isSearching}
                  />
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <button type="button" onClick={() => setIsVisualSearchOpen(true)} className="p-2 text-indigo-600 rounded-xl hover:bg-white transition-all"><Camera size={18} /></button>
                </div>
             </form>
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {['All', ...CATEGORIES].map((cat) => (
              <button key={cat} onClick={() => { setActiveCategory(cat as any); setSearchResultIds(null); setSearchExplanation(''); }}
                className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase whitespace-nowrap border transition-all duration-300 ${activeCategory === cat && !searchResultIds ? 'bg-white text-[#1a1a1a] shadow-[0_10px_20px_rgba(255,255,255,0.1)] scale-105' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>
      )}

      {viewMode === 'feed' ? (
        <main className="flex-1 overflow-y-auto bg-slate-50 pb-24" onScroll={handleScroll}>
          {searchExplanation && (
            <div className="px-4 py-4 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-xl flex justify-between items-center gap-4">
                 <div className="flex gap-3 items-start">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                      <Sparkles size={16} className="text-indigo-500 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-700 font-bold italic leading-relaxed">{searchExplanation}</p>
                 </div>
                 <button onClick={() => { setSearchResultIds(null); setSearchExplanation(''); setSearchQuery(''); }} className="text-[9px] font-black uppercase text-white bg-[#1a1a1a] px-4 py-2 rounded-xl shadow-lg active:scale-95">Clear</button>
               </div>
            </div>
          )}
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                <Zap className="absolute inset-0 m-auto text-indigo-500 animate-pulse" size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">AI Neighborhood Scan...</span>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-0.5 pt-0.5">
            {chunkedAds.map((adChunk, idx) => (
              <AdCarouselSlot 
                key={idx} 
                ads={adChunk} 
                userLocation={userLocation} 
                onAdClick={handleAdClick} 
              />
            ))}
          </div>
          
          {!isSearching && filteredAds.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center px-10 gap-4">
               <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center">
                  <Compass size={32} className="text-slate-300" />
               </div>
               <div className="space-y-1">
                 <h3 className="text-sm font-black uppercase tracking-tight">No results in your area</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Adjust your filters or distance to find more local gems.</p>
               </div>
            </div>
          )}

          <PageFooter />
        </main>
      ) : user ? (
        <div className="flex-1 overflow-y-auto pb-24 bg-slate-50" onScroll={handleScroll}>
          <ProfileDashboard 
            user={user} 
            onLogout={() => { db.signOut().then(() => { setUser(null); setViewMode('feed'); }); }} 
            ads={ads} 
            onDeleteAd={(id) => db.deleteAd(id).then(() => setAds(prev => prev.filter(a => a.id !== id)))} 
            onRepostAd={(id) => db.updateAd(id, { createdAt: Date.now(), expiresAt: Date.now() + 86400000 }).then(u => u && setAds(p => p.map(a => a.id === id ? u : a)))} 
            onEditAd={(ad) => setEditingAd(ad)}
            onUpdateProfile={() => {}} 
          />
          <PageFooter />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white space-y-10">
           <div className="relative">
              <div className="absolute -inset-8 bg-indigo-500/10 rounded-full blur-[60px] animate-pulse"></div>
              <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center shadow-2xl border border-slate-100 relative z-10 transform -rotate-3">
                <UserIcon size={48} className="text-slate-300" />
              </div>
           </div>
           <div className="text-center space-y-3">
              <h2 className="text-3xl font-black text-[#1a1a1a] uppercase tracking-tighter leading-none italic">Join The<br/>Community</h2>
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em]">Launch your ads instantly</p>
           </div>
           <button onClick={() => setIsAuthModalOpen(true)} className="w-full h-16 bg-[#1a1a1a] text-white rounded-[24px] font-black shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all active:scale-95 active:shadow-lg uppercase text-xs tracking-widest border-b-4 border-black">Sign In / Register</button>
           <button onClick={() => setViewMode('feed')} className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-[#1a1a1a] transition-all flex items-center gap-2">
             <ChevronRight size={14} className="rotate-180" /> Back to Feed
           </button>
        </div>
      )}

      <nav 
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#1a1a1a] border-t border-white/5 px-8 py-4 flex items-center justify-between z-[200] text-white transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) shadow-[0_-20px_50px_rgba(0,0,0,0.4)] ${
          isNavVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <button onClick={() => { setViewMode('feed'); setSearchResultIds(null); }} className={`p-2.5 transition-all duration-300 ${viewMode === 'feed' ? 'scale-125 text-white opacity-100' : 'text-white/30 hover:text-white/60'}`}><Home size={22} /></button>
        <div className="relative">
           <div className="absolute -inset-3 bg-white/10 rounded-full blur-xl animate-pulse" />
           <button onClick={() => user ? setIsPostModalOpen(true) : setIsAuthModalOpen(true)} className="relative bg-white text-[#1a1a1a] w-14 h-14 rounded-[22px] flex items-center justify-center shadow-[0_15px_30px_rgba(255,255,255,0.2)] active:scale-90 transition-all border-4 border-white/20"><Plus size={32} /></button>
        </div>
        <button onClick={() => setViewMode('profile')} className={`p-2.5 transition-all duration-300 ${viewMode === 'profile' ? 'scale-125 text-white opacity-100' : 'text-white/30 hover:text-white/60'}`}>
          {user ? <img src={user.avatar} className="w-8 h-8 rounded-full object-cover border-2 border-white/20 shadow-lg" /> : <UserIcon size={22} />}
        </button>
      </nav>

      {infoModal && <InfoModalComponent type={infoModal} onClose={() => setInfoModal(null)} />}
      {selectedAd && (
        <AdDetailModal 
          ad={selectedAd} 
          onClose={() => setSelectedAd(null)} 
          currentUser={user} 
          userLocation={userLocation} 
          onReport={() => alert("Report Logged: Our platform team will review this content within 1 hour.")} 
          onRepost={() => db.updateAd(selectedAd.id, { expiresAt: Date.now() + 86400000 }).then(u => u && setSelectedAd(u))} 
          onAddReview={(r) => handleAddReview(selectedAd.id, r)}
          onInsight={(type) => handleInsight(selectedAd.id, type)}
          onModalScroll={handleScroll}
        />
      )}
      {(isPostModalOpen || editingAd) && (
        <PostAdModal 
          onClose={() => { setIsPostModalOpen(false); setEditingAd(null); }} 
          onPost={(ad) => db.saveAd(ad).then(newAd => { setAds(p => { const exists = p.some(a => a.id === ad.id); return exists ? p.map(a => a.id === ad.id ? newAd : a) : [newAd, ...p]; }); })} 
          user={user!} 
          initialLocation={userLocation!}
          adToEdit={editingAd || undefined}
        />
      )}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} onAuth={(u) => setUser(u)} />}
      {isLocationModalOpen && <LocationModal onClose={() => setIsLocationModalOpen(false)} onSelect={(l) => l === 'detect' ? detectLocation() : setUserLocation(l)} currentLocation={userLocation} />}
      {isFilterModalOpen && <FilterModal onClose={() => setIsFilterModalOpen(false)} sortOrder={sortOrder} setSortOrder={setSortOrder} maxDistance={maxDistance} setMaxDistance={setMaxDistance} />}
      {isAdminPanelOpen && <AdminPanel onClose={() => setIsAdminPanelOpen(false)} ads={ads} setAds={setAds} />}
      {isVisualSearchOpen && <VisualSearchModal onClose={() => setIsVisualSearchOpen(false)} onSearch={handleVisualSearchComplete} />}
    </div>
  );
};

export default App;
