
import React, { useState } from 'react';
import { Ad, Location, User as AppUser, Review } from '../types';
import { MapPin, Clock, MoreVertical, Phone, MessageSquare, Star, Heart, Repeat, Flag, ChevronRight } from 'lucide-react';
import { calculateDistance, formatDistance, formatTimeAgo, getExpiresIn } from '../utils/location';
import ReviewSection from './ReviewSection';

interface AdCardProps {
  ad: Ad;
  userLocation: Location | null;
  onReport: () => void;
  currentUser: AppUser | null;
  onRepost: () => void;
  onAddReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, userLocation, onReport, currentUser, onRepost, onAddReview }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  
  // Fix: Ad type has 'locations' array instead of a single 'location' property.
  // We calculate the minimum distance to any of the ad's locations.
  const distance = userLocation && ad.locations.length > 0 
    ? Math.min(...ad.locations.map(loc => calculateDistance(userLocation, loc)))
    : null;
  
  const avgRating = ad.reviews.length > 0 
    ? (ad.reviews.reduce((acc, r) => acc + r.rating, 0) / ad.reviews.length).toFixed(1)
    : null;

  const isOwner = currentUser?.id === ad.userId;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
      {/* User Info Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src={`https://ui-avatars.com/api/?name=${ad.userName}&background=random`} 
            className="w-8 h-8 rounded-full"
            alt={ad.userName}
          />
          <div>
            <h4 className="text-xs font-bold text-slate-800">{ad.userName}</h4>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="flex items-center gap-0.5">
                <Clock size={10} /> {formatTimeAgo(ad.createdAt)}
              </span>
              <span>•</span>
              <span className="text-amber-600 font-medium">{getExpiresIn(ad.expiresAt)}</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <MoreVertical size={18} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 w-40 bg-white shadow-xl rounded-xl border border-slate-100 z-10 py-1 text-xs">
              {isOwner ? (
                <button 
                  onClick={() => { onRepost(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-indigo-600 font-medium"
                >
                  <Repeat size={14} /> Repost (24h)
                </button>
              ) : (
                <button 
                  onClick={() => { onReport(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-red-500"
                >
                  <Flag size={14} /> Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative h-64 bg-slate-100 overflow-hidden">
        <img 
          src={ad.images[0] || `https://picsum.photos/seed/${ad.id}/800/600`} 
          alt={ad.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 shadow-sm uppercase tracking-wider">
          {ad.category}
        </div>
        {distance !== null && (
          <div className="absolute bottom-3 left-3 bg-indigo-600/90 backdrop-blur text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
            <MapPin size={10} /> {formatDistance(distance)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-slate-800 leading-tight">{ad.title}</h3>
          {avgRating && (
            <div className="flex items-center gap-0.5 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
              <Star size={10} fill="currentColor" /> {avgRating}
            </div>
          )}
        </div>
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {ad.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        {ad.contact.whatsapp && (
          <a 
            href={`https://wa.me/${ad.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-500 text-white h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-sm hover:bg-green-600 transition-colors"
          >
            <MessageSquare size={16} /> WhatsApp
          </a>
        )}
        {ad.contact.phone && !ad.contact.whatsapp && (
          <a 
            href={`tel:${ad.contact.phone}`}
            className="flex-1 bg-indigo-600 text-white h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Phone size={16} /> Call Now
          </a>
        )}
        <button 
          onClick={() => setShowReviews(!showReviews)}
          className="px-3 bg-slate-100 text-slate-600 h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-200 transition-colors"
        >
          <Star size={14} /> Reviews ({ad.reviews.length})
        </button>
      </div>

      {/* Review Section */}
      {showReviews && (
        <div className="border-t border-slate-50 bg-slate-50/50 p-4 animate-in slide-in-from-top-2 duration-300">
          <ReviewSection 
            reviews={ad.reviews} 
            onAddReview={onAddReview}
            currentUser={currentUser}
            isOwner={isOwner}
          />
        </div>
      )}
    </div>
  );
};

export default AdCard;
