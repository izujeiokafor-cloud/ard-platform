
import React, { useState } from 'react';
import { X, MapPin, ChevronRight, Check, Navigation } from 'lucide-react';
import { State, City, LOCATION_DATA } from '../store/locationData';
import { Location } from '../types';

interface LocationModalProps {
  onClose: () => void;
  onSelect: (location: Location | 'detect') => void;
  currentLocation: Location | null;
}

const LocationModal: React.FC<LocationModalProps> = ({ onClose, onSelect, currentLocation }) => {
  const [selectedState, setSelectedState] = useState<State | null>(null);

  const isDetected = currentLocation?.state === 'Detected';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-slate-100">
        <div className="p-4 bg-[#1a1a1a] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => selectedState ? setSelectedState(null) : onClose()}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              {selectedState ? <ChevronRight size={20} className="rotate-180" /> : <X size={20} />}
            </button>
            <h2 className="text-sm font-black uppercase tracking-widest">
              {selectedState ? `Cities in ${selectedState.name}` : 'Select State'}
            </h2>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 bg-slate-50">
          {!selectedState && (
            <div className="mb-2">
               <button
                  onClick={() => {
                    onSelect('detect');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left mb-2 ${
                    isDetected 
                    ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white' 
                    : 'bg-white border-indigo-100 text-[#1a1a1a] hover:bg-indigo-50 shadow-sm'
                  }`}
                >
                  <Navigation size={18} className={isDetected ? 'text-white' : 'text-indigo-600'} />
                  <span className="font-bold">Use My Current Location</span>
                  {isDetected && <Check size={18} className="ml-auto" />}
                </button>
                <div className="flex items-center gap-2 px-4 py-2 opacity-30">
                  <div className="h-px flex-1 bg-slate-300"></div>
                  <span className="text-[10px] font-black uppercase">Or choose manually</span>
                  <div className="h-px flex-1 bg-slate-300"></div>
                </div>
            </div>
          )}

          {!selectedState ? (
            <div className="grid grid-cols-1 gap-1">
              {LOCATION_DATA.map((state) => (
                <button
                  key={state.name}
                  onClick={() => setSelectedState(state)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#1a1a1a] transition-all text-left group"
                >
                  <span className="font-bold text-slate-800">{state.name}</span>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-[#1a1a1a]" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {selectedState.cities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    onSelect({
                      city: city.name,
                      state: selectedState.name,
                      lat: city.lat,
                      lng: city.lng
                    });
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                    currentLocation?.city === city.name && currentLocation?.state === selectedState.name
                      ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white'
                      : 'bg-white border-slate-100 hover:border-[#1a1a1a] text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className={currentLocation?.city === city.name ? 'text-white/60' : 'text-slate-400'} />
                    <span className="font-bold">{city.name}</span>
                  </div>
                  {currentLocation?.city === city.name && <Check size={18} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
