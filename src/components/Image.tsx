import { useState, useEffect } from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  blur?: boolean;
}

export function Image({ 
  src, 
  alt, 
  fallback = '/images/placeholder.png', 
  blur = true,
  className = '',
  ...props 
}: ImageProps) {
  const [hasError, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(fallback);

  useEffect(() => {
    if (!src) return;

    const img = new window.Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = (_err) => {
      setError(true);
      setIsLoading(false);
      setImageSrc(fallback);
    };
  }, [src, fallback]);

  return (
    <div className="relative overflow-hidden">
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        className={`
          ${className}
          ${isLoading && blur && !hasError ? 'blur-sm scale-105' : 'blur-0 scale-100'}
          transition-all duration-300 ease-in-out
        `}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
} 