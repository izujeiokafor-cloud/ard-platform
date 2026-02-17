
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Ad, Location } from '../types';
import { Play, Globe2 } from 'lucide-react';
import { calculateDistance, formatDistance } from '../utils/location';

interface AdCarouselSlotProps {
  ads: Ad[];
  userLocation: Location | null;
  onAdClick: (ad: Ad) => void;
}

const AdCarouselSlot: React.FC<AdCarouselSlotProps> = ({ ads, userLocation, onAdClick }) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  const currentAd = ads[currentAdIndex];

  useEffect(() => {
    if (ads.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Set a random speed between 3s and 6s for an organic feel across the grid
    const speed = 3000 + (Math.random() * 3000);
    timerRef.current = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ads.length, isPaused]);

  const minDistance = useMemo(() => {
    if (!userLocation || !currentAd) return null;
    if (currentAd.isAllLocations) return 0;
    return currentAd.locations.reduce((min, loc) => {
      const d = calculateDistance(userLocation, loc);
      return d < min ? d : min;
    }, Infinity);
  }, [userLocation, currentAd]);

  if (!currentAd) return null;

  return (
    <div 
      className="relative aspect-[9/14] bg-slate-100 overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => onAdClick(currentAd)}
    >
      {/* Progress indicators for different businesses in this carousel */}
      <div className="absolute top-1.5 left-0 right-0 z-20 flex gap-0.5 px-1">
        {ads.map((_, i) => (
          <div 
            key={i} 
            className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i === currentAdIndex ? 'bg-white shadow-sm' : 'bg-black/10'}`}
          />
        ))}
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <img 
          key={currentAd.id}
          src={currentAd.images[0]} 
          alt={currentAd.title} 
          className="w-full h-full object-cover transition-opacity duration-700 animate-in fade-in"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-0.5 pointer-events-none">
        <div className="flex items-center gap-1 text-white text-[9px] font-black drop-shadow-md">
          {currentAd.isAllLocations ? (
            <>
              <Globe2 size={9} className="text-white" />
              <span className="uppercase">National</span>
            </>
          ) : (
            <>
              <Play size={9} className="fill-white" />
              <span className="uppercase">{minDistance !== null ? formatDistance(minDistance) : 'Nearby'}</span>
            </>
          )}
        </div>
        <div className="text-white text-[10px] font-black drop-shadow-lg truncate uppercase tracking-tighter leading-tight">
          {currentAd.title}
        </div>
      </div>
      
      <div className="absolute top-3 right-1.5 z-10">
        <span className="bg-white/90 backdrop-blur-sm text-[#1a1a1a] text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm border border-black/5">
          {currentAd.category}
        </span>
      </div>
      
      <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity" />
    </div>
  );
};

export default AdCarouselSlot;
