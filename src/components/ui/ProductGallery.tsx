'use client';

/**
 * Product Gallery Component - Geek Gaming Center
 * Image gallery with lightbox and zoom effect
 */

import { useState } from 'react';
import Image from 'next/image';
import { ProductIcon } from './ProductIcon';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // If no images, show fallback icon
  if (!images || images.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 flex items-center justify-center min-h-[500px]">
        <ProductIcon className="w-64 h-64 text-white/30" />
      </div>
    );
  }

  const currentImage = images[selectedImage];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div className="glass-card rounded-xl overflow-hidden aspect-square bg-surface">
          <Image
            src={currentImage}
            alt={`${productName} - Vue ${selectedImage + 1}`}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Zoom hint */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          Cliquez pour agrandir
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index
                  ? 'border-primary-500 ring-2 ring-primary-500/50'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <Image
                src={image}
                alt={`${productName} - Miniature ${index + 1}`}
                fill
                className="object-contain"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-primary-400 transition-colors z-10"
            onClick={() => setIsLightboxOpen(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-primary-400 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
                }}
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-primary-400 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1);
                }}
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image */}
          <div className="relative w-full max-w-5xl aspect-square">
            <Image
              src={currentImage}
              alt={`${productName} - Vue ${selectedImage + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
              {selectedImage + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
