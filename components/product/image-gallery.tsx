'use client';

// =====================================================================
// Customer Web Platform — Product Image Gallery
// =====================================================================

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const defaultImages =
    images.length > 0
      ? images
      : [
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
        ];

  const [selectedIdx, setSelectedIdx] = useState(0);

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {/* Thumbnail Strip */}
      {defaultImages.length > 1 && (
        <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto no-scrollbar sm:max-h-[460px] shrink-0">
          {defaultImages.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={cn(
                'relative h-16 w-16 sm:h-18 sm:w-18 rounded-xl overflow-hidden border-2 bg-slate-50 dark:bg-slate-800 transition-all shrink-0',
                selectedIdx === idx
                  ? 'border-blue-600 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
              )}
            >
              <Image
                src={url}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                sizes="72px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Display with hover zoom */}
      <div className="relative flex-1 aspect-square rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden flex items-center justify-center group shadow-xs">
        <Image
          src={defaultImages[selectedIdx]}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-6 sm:p-10 group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    </div>
  );
}
