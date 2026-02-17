
import React, { useState } from 'react';
import { Star, Send, CornerDownRight } from 'lucide-react';
import { Review, User } from '../types';
import { formatTimeAgo } from '../utils/location';

interface ReviewSectionProps {
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  currentUser: User | null;
  isOwner: boolean;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews, onAddReview, currentUser, isOwner }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !comment.trim()) return;
    onAddReview({
      userId: currentUser.id,
      userName: currentUser.name,
      rating,
      comment
    });
    setComment('');
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reviews</h4>
      
      {/* List Reviews */}
      <div className="space-y-4 max-h-60 overflow-y-auto hide-scrollbar">
        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No reviews yet. Be the first!</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700">{review.userName}</span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={8} fill={i < review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">{formatTimeAgo(review.createdAt)}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-white/50 p-2 rounded-lg border border-slate-100">
                {review.comment}
              </p>
              {review.ownerReply && (
                <div className="flex gap-2 ml-4 pt-1">
                  <CornerDownRight size={14} className="text-slate-300 shrink-0" />
                  <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/30 flex-1">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight mb-0.5">Owner Response</p>
                    <p className="text-xs text-slate-600 italic">"{review.ownerReply}"</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      {!isOwner && currentUser && (
        <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-200/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-slate-600">Your Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`transition-colors ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                >
                  <Star size={16} fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <input 
              type="text"
              placeholder="Write a short review..."
              className="w-full pl-4 pr-12 py-3 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      )}

      {!currentUser && !isOwner && (
        <p className="text-[10px] text-center text-slate-400 font-medium pt-2">Sign in to leave a review</p>
      )}
    </div>
  );
};

export default ReviewSection;
