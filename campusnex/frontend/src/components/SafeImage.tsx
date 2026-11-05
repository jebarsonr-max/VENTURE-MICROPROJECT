import React, { useState } from 'react';
import { Package, ImageOff } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackIcon?: React.ReactNode;
  containerClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Campus item',
  className = '',
  containerClassName = '',
  fallbackSrc = '/images/campus/laptop_charger.jpg',
  fallbackIcon,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Normalize image source: handle both relative /images/... paths and external URLs
  const resolvedSrc = src || fallbackSrc;

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Loading Skeleton */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-campus-elevated animate-pulse flex items-center justify-center z-10">
          <div className="w-8 h-8 rounded-full border-2 border-campus-border border-t-campus-accent animate-spin" />
        </div>
      )}

      {/* Fallback Display if Error */}
      {hasError ? (
        <div className="w-full h-full min-h-[160px] bg-campus-elevated flex flex-col items-center justify-center text-campus-muted p-4 text-center">
          {fallbackIcon || <Package className="w-8 h-8 text-campus-muted mb-2 opacity-50" />}
          <span className="text-[11px] font-medium">{alt}</span>
          <span className="text-[9px] text-campus-accent-subtle mt-0.5">CAMPUSNEX Verified Asset</span>
        </div>
      ) : (
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`${className} transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          {...props}
        />
      )}
    </div>
  );
};

