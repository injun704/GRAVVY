import React, { useState } from 'react';
import { Star, X, Image, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Review } from '../../types';

interface ReviewFormModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => void;
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  productId,
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!isOpen || !productId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !title.trim()) return;

    onSubmitReview({
      productId,
      userName: user?.name || 'Verified Customer',
      userAvatar: user?.avatar,
      rating,
      title,
      comment,
      verifiedPurchase: true,
      reviewImage: imagePreview || undefined,
    });

    onClose();
  };

  const handleSimulateImageUpload = () => {
    setImagePreview('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative ${
          theme === 'LIGHT'
            ? 'bg-white border-stone-200'
            : theme === 'DARK'
            ? 'bg-neutral-900 border-neutral-800'
            : 'bg-stone-900 border-white/20'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-200 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className={`text-xl font-bold font-display ${textColorPrimary}`}>Write a Review</h3>
        <p className="text-xs text-stone-400 mt-1 mb-5">
          Share your experience with other verified GRAVVY customers
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star selector */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textColorMuted}`}>
              Overall Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-amber-400 ml-2">
                {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : 'Below Average'}
              </span>
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${textColorMuted}`}>
              Review Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Delicious biryani and quick delivery!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs border border-stone-500/20 bg-stone-500/10 text-white focus:outline-none"
            />
          </div>

          {/* Comment */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${textColorMuted}`}>
              Detailed Feedback
            </label>
            <textarea
              required
              rows={3}
              placeholder="Tell others about the taste, packaging, temperature, and delivery speed..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs border border-stone-500/20 bg-stone-500/10 text-white focus:outline-none resize-none"
            />
          </div>

          {/* Photo attachment simulation */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${textColorMuted}`}>
              Attach Photo (Optional)
            </label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Review preview"
                  className="w-16 h-16 rounded-xl object-cover border border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-600 text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulateImageUpload}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs border border-dashed border-stone-500/30 text-stone-400 hover:text-white"
              >
                <Image className="w-4 h-4" />
                <span>Upload dish or product photo</span>
              </button>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-500/20 text-xs font-semibold text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${categoryAccent.bgClass}`}
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
