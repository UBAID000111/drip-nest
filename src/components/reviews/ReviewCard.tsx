import React from 'react';
import { Star } from 'lucide-react';
import { Review } from '../../types';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  // Format date safely
  const formattedDate = review.createdAt?.toDate
    ? review.createdAt.toDate().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent review';

  return (
    <div className="bg-white border border-[#EFE6D7] rounded-lg p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Star Rating display */}
        <div className="flex items-center gap-1 text-[#684631]">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating
                  ? 'fill-[#684631] text-[#684631]'
                  : 'text-[#EFE6D7]'
              }`}
            />
          ))}
          <span className="text-xs font-semibold tabular-nums ml-1.5 text-[#252A24]">
            {review.rating}.0
          </span>
        </div>

        {/* Written Review */}
        <p className="text-sm text-[#252A24]/90 leading-relaxed font-normal">
          “{review.comment}”
        </p>
      </div>

      {/* Customer Name & Date (unboxed metadata) */}
      <div className="pt-3 border-t border-[#F8F5EF] flex items-center justify-between text-xs text-[#252A24]/70">
        <div>
          <span className="font-semibold text-[#252A24]">{review.displayName}</span>
          {review.productName && (
            <span className="text-[#684631] block text-[11px] truncate max-w-[180px]">
              re: {review.productName}
            </span>
          )}
        </div>
        <span className="text-[11px] font-mono">{formattedDate}</span>
      </div>
    </div>
  );
};
