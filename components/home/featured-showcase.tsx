import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FeaturedShowcase() {
  const showcases = [
    {
      title: 'Flagship Smartphones',
      subtitle: 'From ₹12,999 • No Cost EMI',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
      link: '/search?categoryId=mobiles',
      tag: 'Min 30% Off',
      bg: 'from-blue-500/10 to-indigo-500/10',
    },
    {
      title: 'Wireless Audio & Gear',
      subtitle: 'Noise Cancelling • 40Hr Playtime',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      link: '/search?categoryId=electronics',
      tag: 'Special Deals',
      bg: 'from-emerald-500/10 to-teal-500/10',
    },
    {
      title: 'Trending Footwear & Fashion',
      subtitle: 'Sneakers, Tees & Casuals',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      link: '/search?categoryId=fashion',
      tag: 'Up to 60% Off',
      bg: 'from-rose-500/10 to-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-8">
      {showcases.map((card, i) => (
        <Link
          key={i}
          href={card.link}
          className={`group relative flex items-center justify-between p-6 rounded-3xl bg-gradient-to-br ${card.bg} border border-slate-200/80 dark:border-slate-800 hover:shadow-lg transition-all duration-300 overflow-hidden`}
        >
          <div className="space-y-2 z-10 max-w-[60%]">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold tracking-wider uppercase">
              {card.tag}
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 transition-colors">
              {card.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {card.subtitle}
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Explore Collection</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="relative h-28 w-28 shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Image
              src={card.image}
              alt={card.title}
              fill
              className="object-contain drop-shadow-md"
              sizes="112px"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
