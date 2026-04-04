/**
 * ImageCarousel Component
 * iOS-style slideshow with pagination dots
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const images = [
  '/arena-gallery/PHOTO-2024-12-07-12-31-46.jpg',
  '/arena-gallery/PHOTO-2024-12-07-12-31-47.jpg',
  '/arena-gallery/PHOTO-2024-12-07-12-31-48.jpg',
  '/arena-gallery/PHOTO-2024-12-07-12-31-49(1).jpg',
  '/arena-gallery/PHOTO-2024-12-07-12-31-49.jpg',
  '/arena-gallery/PHOTO-2024-12-07-12-31-50.jpg',
  '/arena-gallery/PHOTO-2024-12-07-12-31-51.jpg',
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      {/* Image Container */}
      <div className="relative w-full h-full overflow-hidden">
        {images.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={src}
              alt={`Gallery image ${index + 1}`}
              fill
              className="object-cover w-full h-full"
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* Pagination Dots - iOS Style */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white scale-125'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
