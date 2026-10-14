import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  categoryName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  className = '',
  fallbackText,
  categoryName,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#EFE6D7]/60 text-[#684631] relative overflow-hidden select-none ${className}`}
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.4) 0%, transparent 70%), linear-gradient(135deg, #F8F5EF 0%, #EFE6D7 100%)',
        }}
      >
        {/* Subtle wood-grain ring SVG ornament */}
        <svg
          className="w-12 h-12 text-[#A7B59A]/40 mb-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        >
          <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
          <circle cx="12" cy="12" r="6" strokeDasharray="2 2" />
          <path d="M12 2a10 10 0 0 1 10 10" />
          <path d="M12 12c-2 2-3 4.5-3 7.5" />
        </svg>

        <span className="font-serif text-sm italic font-medium text-[#252A24]/70">
          {fallbackText || alt || 'Handcrafted Wooden Living'}
        </span>
        {categoryName && (
          <span className="text-[11px] uppercase tracking-wider text-[#684631]/80 mt-1">
            {categoryName}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      loading="lazy"
      {...props}
    />
  );
};
