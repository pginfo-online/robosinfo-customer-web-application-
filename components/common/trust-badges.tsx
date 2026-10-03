import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: Truck,
      title: 'Free & Fast Delivery',
      desc: 'On all orders above ₹499',
    },
    {
      icon: ShieldCheck,
      title: '100% Genuine Products',
      desc: 'Sourced directly from verified brands',
    },
    {
      icon: RotateCcw,
      title: '7-Day Easy Returns',
      desc: 'Hassle-free reverse pickups & refunds',
    },
    {
      icon: Headphones,
      title: '24x7 Customer Support',
      desc: 'Dedicated assistance anytime you need',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-slate-200 dark:border-slate-800 my-8">
      {badges.map((b, idx) => (
        <div key={idx} className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
          <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <b.icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {b.title}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {b.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
