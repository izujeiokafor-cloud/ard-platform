
import React from 'react';
import { X, Clock, MapPin, Check } from 'lucide-react';

interface FilterModalProps {
  onClose: () => void;
  sortOrder: 'newest' | 'distance';
  setSortOrder: (order: 'newest' | 'distance') => void;
  maxDistance: number;
  setMaxDistance: (dist: number) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ 
  onClose, 
  sortOrder, 
  setSortOrder, 
  maxDistance, 
  setMaxDistance 
}) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100">
        <div className="p-4 bg-[#1a1a1a] text-white flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest">Feed Preferences</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 bg-slate-50">
          {/* Sort Order */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort Ads By</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setSortOrder('newest')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                  sortOrder === 'newest' 
                  ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-lg' 
                  : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Clock size={20} className="mb-2" />
                <span className="text-[10px] font-black uppercase">Newest</span>
              </button>
              <button 
                onClick={() => setSortOrder('distance')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                  sortOrder === 'distance' 
                  ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-lg' 
                  : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                }`}
              >
                <MapPin size={20} className="mb-2" />
                <span className="text-[10px] font-black uppercase">Closest</span>
              </button>
            </div>
          </div>

          {/* Distance Filter */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Distance</label>
              <span className="text-xs font-black text-[#1a1a1a]">{maxDistance === 100 ? 'Anywhere' : `${maxDistance} km`}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1a1a1a]"
            />
            <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase">
              <span>1 km</span>
              <span>Anywhere</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full h-14 bg-[#1a1a1a] text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all mt-4"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
