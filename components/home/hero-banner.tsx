'use client';

// =====================================================================
// Customer Web Platform — Hero Carousel Banner
// (Matching Flipkart Reference Screenshot #3)
// =====================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { HERO_BANNERS } from '@/lib/constants';

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_BANNERS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === HERO_BANNERS.length - 1 ? 0 : prev + 1));
  };

  // Autoplay
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const banner = HERO_BANNERS[currentSlide];

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-200/60 dark:border-slate-800 my-4 sm:my-6">
      {/* Background Gradient & Layout */}
      <div
        className={`relative min-h-[300px] sm:min-h-[380px] md:min-h-[420px] bg-gradient-to-r ${banner.bgGradient} flex items-center transition-all duration-700`}
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-10 w-full flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-left space-y-4">
            {/* Festival Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/90 text-slate-950 text-xs font-black tracking-wider uppercase shadow-md">
              <Sparkles className="h-3.5 w-3.5" />
              {banner.badge}
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              {banner.title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
              {banner.subtitle}
            </p>

            {/* Highlight */}
            <div className="inline-block px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-amber-300">
              {banner.highlightText}
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href={banner.ctaLink}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white text-slate-950 font-extrabold text-sm hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                <span>{banner.ctaText}</span>
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </div>
          </div>

          {/* Graphic / Highlight Visual */}
          <div className="hidden md:flex relative h-64 w-64 lg:h-80 lg:w-80 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 items-center justify-center p-6 shadow-2xl">
            <Image
              src={banner.image}
              alt={banner.title}
              width={260}
              height={260}
              className="object-contain drop-shadow-2xl rounded-2xl"
            />
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-md backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-md backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_BANNERS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
