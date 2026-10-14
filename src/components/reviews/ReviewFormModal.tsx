import React, { useState } from 'react';
import { X, Star, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { submitReview } from '../../services/reviewService';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productName?: string;
  onReviewSubmitted?: () => void;
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  onReviewSubmitted,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError('Please provide your name.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setError('Please share at least a few words about your experience (minimum 5 characters).');
      return;
    }

    if (comment.length > 1500) {
      setError('Review comment cannot exceed 1500 characters.');
      return;
    }

    if (!email.trim()) {
      setError('Please provide an email address for your review.');
      return;
    }

    setSubmitting(true);
    try {
      await submitReview({
        displayName: displayName.trim(),
        email: email.trim(),
        rating,
        comment: comment.trim(),
        productId: productId || undefined,
        productName: productName || undefined,
      });

      setSuccess(true);
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to submit review right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setError(null);
    setDisplayName('');
    setEmail('');
    setComment('');
    setRating(5);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={handleResetAndClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-[#F8F5EF] text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-[#EFE6D7] p-6 sm:p-8">
          {/* Close button */}
          <button
            type="button"
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 p-1.5 text-[#252A24]/60 hover:text-[#252A24] rounded-full hover:bg-[#EFE6D7] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {success ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#234737]/10 text-[#234737] flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#234737]">
                Thank You
              </h3>
              <p className="text-sm text-[#252A24]/80 max-w-sm mx-auto leading-relaxed">
                Thank you for sharing your experience! Your review will appear after moderation.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-[#234737] text-[#F8F5EF] text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="font-serif text-2xl font-semibold text-[#234737]">
                  Share Your Experience
                </h3>
                <p className="text-xs text-[#252A24]/70 mt-1">
                  {productName ? `Reviewing ${productName}` : 'Share your thoughts on DripNest handcrafted homeware.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating Stars selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                        aria-label={`Rate ${star} star`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverRating || rating)
                              ? 'fill-[#684631] text-[#684631]'
                              : 'text-[#EFE6D7]'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-[#252A24]/70 ml-2 font-medium">
                      {rating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Maya R."
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737] focus:ring-1 focus:ring-[#234737]"
                  />
                </div>

                {/* Email (Private) */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631]">
                      Email Address *
                    </label>
                    <span className="text-[11px] text-[#252A24]/50">Never displayed publicly</span>
                  </div>
                  <input
                    type="email"
                    required
                    maxLength={150}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737] focus:ring-1 focus:ring-[#234737]"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631]">
                      Your Review *
                    </label>
                    <span className="text-[11px] tabular-nums text-[#252A24]/50">
                      {comment.length}/1500
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    maxLength={1500}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How does this piece feel in your hands? How is the finish, grain, and everyday utility?"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737] focus:ring-1 focus:ring-[#234737]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 bg-[#234737] text-[#F8F5EF] text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Review...</span>
                      </>
                    ) : (
                      <span>Submit Review for Moderation</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
