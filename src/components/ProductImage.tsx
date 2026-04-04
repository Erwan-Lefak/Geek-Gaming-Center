'use client';

import { useState } from 'react';
import Image from 'next/image';
import ProductIcon from './ProductIcon';

interface ProductImageProps {
  src?: string;
  alt: string;
  category: string;
  className?: string;
}

export default function ProductImage({ src, alt, category, className = "" }: ProductImageProps) {
  const [imageError, setImageError] = useState(false);

  if (!src || src === 'N/A' || imageError || typeof src !== 'string') {
    return (
      <div className="transform group-hover:scale-110 transition-transform duration-300 text-white/80">
        <ProductIcon category={category} className="w-24 h-24" />
      </div>
    );
  }

  if (src.startsWith('http')) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={300}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}
