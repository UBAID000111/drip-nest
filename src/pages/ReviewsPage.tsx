import React, { useEffect, useState } from 'react';
import { Star, MessageSquarePlus, RefreshCw } from 'lucide-react';
import { Review } from '../types';
import { getApprovedReviews } from '../services/reviewService';
import { ReviewCard } from '../components/reviews/ReviewCard';
import { ReviewFormModal } from '../components/reviews/ReviewFormModal';

import { Seo } from '../components/common/Seo';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getApprovedReviews();
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <Seo
        title="Customer Reviews | DripNest Decor Wooden Handicrafts"
        description="Read genuine customer reviews of DripNest handcrafted wooden home decor, serving trays, roti boxes and kitchen essentials."
        path="/reviews"
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#EFE6D7] pb-8 gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block mb-1">
            Customer Testimonials
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#234737]">
            Patron Reviews
          </h1>
          <p className="text-sm text-[#252A24]/75 mt-2 max-w-xl leading-relaxed">
            Authentic thoughts and impressions from patrons living with DripNest handcrafted wooden pieces.
          </p>
        </div>

        {/* Rating Score Card & Action */}
        <div className="flex items-center gap-6 bg-white border border-[#EFE6D7] rounded-xl p-5 shadow-xs">
          <div className="text-center pr-6 border-r border-[#EFE6D7]">
            <span className="font-serif text-4xl font-bold tabular-nums text-[#234737]">
              {totalReviews > 0 ? averageRating : '—'}
            </span>
            <div className="flex items-center justify-center gap-0.5 text-[#684631] mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= Math.round(averageRating)
                      ? 'fill-[#684631] text-[#684631]'
                      : 'text-[#EFE6D7]'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#252A24]/60 block mt-1">
              {totalReviews} {totalReviews === 1 ? 'Approved Review' : 'Approved Reviews'}
            </span>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-white border border-[#EFE6D7] rounded-lg p-6 space-y-3">
              <div className="h-4 bg-[#EFE6D7] rounded w-1/3" />
              <div className="h-16 bg-[#EFE6D7]/60 rounded w-full" />
              <div className="h-3 bg-[#EFE6D7] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center mx-auto">
            <Star className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-semibold text-[#234737]">
            Be the First to Share Your Thoughts
          </h3>
          <p className="text-sm text-[#252A24]/75 leading-relaxed">
            No approved reviews have been published yet. If you have welcomed DripNest pieces into your home, we would cherish your feedback.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-6 py-2.5 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529]"
            >
              Submit a Review
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <ReviewCard key={rev.id} review={rev} />
          ))}
        </div>
      )}

      {/* Review Submission Modal */}
      <ReviewFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onReviewSubmitted={fetchReviews}
      />
    </div>
  );
};
