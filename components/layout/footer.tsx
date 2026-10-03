import React from 'react';
import Link from 'next/link';
import { Shield, Truck, HelpCircle, Mail, Phone, MapPin } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Col */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white">
                N
              </div>
              <span className="text-xl font-black text-white">
                Nova<span className="text-blue-500">Market</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              India&apos;s fastest growing multi-seller marketplace delivering authentic electronics, fashion, lifestyle, and home goods with 100% buyer protection.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-400" /> {APP_CONFIG.supportEmail}
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-blue-400" /> {APP_CONFIG.supportPhone} (Toll Free)
              </span>
            </div>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">About</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/seller-portal" className="hover:text-white transition-colors text-amber-400 font-semibold">Sell on NovaMarket</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Press & Media</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Help & Support</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/account/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/account/tickets" className="hover:text-white transition-colors">Customer Helpdesk</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>

          {/* Consumer Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Consumer Policy</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Security & Privacy</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Grievance Redressal</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">EPR Compliance</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} NovaMarket India Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Shield className="h-4 w-4 text-emerald-400" /> 100% Secure Payment Gateways
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Truck className="h-4 w-4 text-blue-400" /> Verified Delivery Network
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
