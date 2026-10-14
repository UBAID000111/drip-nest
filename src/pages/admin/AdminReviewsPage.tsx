import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Star,
  Check,
  EyeOff,
  Trash2,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { Review } from '../../types';
import {
  getAllReviewsForAdmin,
  moderateReview,
  deleteReview,
} from '../../services/reviewService';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('pending');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllReviewsForAdmin(filter);
      setReviews(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const handleModerate = async (id: string, status: 'approved' | 'hidden') => {
    try {
      await moderateReview(id, status);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      setNotice(`Review marked as ${status}.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Error updating status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setNotice('Review permanently deleted.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete review.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE6D7] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block mb-1">
            Community & Moderation
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#234737]">
            Customer Reviews Queue
          </h1>
          <p className="text-xs text-[#252A24]/70 mt-1">
            Moderate incoming customer testimonials before public publication
          </p>
        </div>

        <button
          type="button"
          onClick={loadReviews}
          disabled={loading}
          className="p-2 border border-[#EFE6D7] rounded-md text-[#252A24] hover:bg-[#EFE6D7]"
          title="Refresh reviews"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white border border-[#EFE6D7] rounded-lg max-w-fit">
        {(['pending', 'approved', 'hidden', 'all'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
              filter === tab
                ? 'bg-[#234737] text-white shadow-xs'
                : 'text-[#252A24]/70 hover:text-[#234737]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Review Cards List */}
      {loading ? (
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-8 text-center text-xs text-[#252A24]/60">
          Loading review moderation queue...
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-[#252A24]">
            No {filter !== 'all' ? filter : ''} reviews found
          </h3>
          <p className="text-xs text-[#252A24]/70">
            {filter === 'pending'
              ? 'All incoming customer reviews have been moderated.'
              : 'There are no reviews matching this category.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const dateStr = rev.createdAt?.toDate
              ? rev.createdAt.toDate().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently submitted';

            return (
              <div
                key={rev.id}
                className="bg-white border border-[#EFE6D7] rounded-xl p-6 shadow-xs flex flex-col md:flex-row gap-6 justify-between items-start"
              >
                <div className="space-y-3 flex-1">
                  {/* Rating & Status badge */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5 text-[#684631]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= rev.rating ? 'fill-[#684631]' : 'text-[#EFE6D7]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold tabular-nums text-[#234737]">
                      {rev.rating}.0
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        rev.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rev.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-[#252A24] leading-relaxed">
                    “{rev.comment}”
                  </p>

                  {/* Reviewer Details (Confidential info for Admin only) */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#252A24]/70 pt-2 border-t border-[#F8F5EF]">
                    <span className="font-semibold text-[#252A24]">{rev.displayName}</span>
                    {rev.email && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#684631]">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{rev.email}</span>
                      </span>
                    )}
                    {rev.productName && (
                      <span className="text-[#234737] font-medium">
                        Product: {rev.productName}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#252A24]/50">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </span>
                  </div>
                </div>

                {/* Moderation Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {rev.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleModerate(rev.id, 'approved')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#234737] text-white text-xs font-semibold rounded hover:bg-[#1A3529] transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {rev.status !== 'hidden' && (
                    <button
                      type="button"
                      onClick={() => handleModerate(rev.id, 'hidden')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#EFE6D7] text-[#252A24] text-xs font-semibold rounded hover:bg-[#F8F5EF] transition-colors"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-[#252A24]/50 hover:text-red-600 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
