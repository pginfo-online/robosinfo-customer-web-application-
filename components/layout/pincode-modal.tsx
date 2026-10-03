'use client';

// =====================================================================
// Customer Web Platform — Pincode Delivery Checker Modal
// =====================================================================

import React, { useState } from 'react';
import { MapPin, Check, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/ui-store';
import { toast } from 'sonner';

const POPULAR_PINCODES = [
  { code: '560001', city: 'Bengaluru' },
  { code: '110001', city: 'New Delhi' },
  { code: '400001', city: 'Mumbai' },
  { code: '600001', city: 'Chennai' },
  { code: '700001', city: 'Kolkata' },
  { code: '500001', city: 'Hyderabad' },
];

export function PincodeModal() {
  const { isPincodeModalOpen, setPincodeModalOpen, pincode, setPincode } = useUIStore();
  const [inputCode, setInputCode] = useState(pincode);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputCode.trim();
    if (!/^\d{6}$/.test(clean)) {
      toast.error('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    setPincode(clean);
    setPincodeModalOpen(false);
    toast.success(`Delivery location updated to ${clean}`);
  };

  return (
    <Dialog open={isPincodeModalOpen} onOpenChange={setPincodeModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <MapPin className="h-4 w-4" />
            </div>
            <DialogTitle>Choose Your Delivery Location</DialogTitle>
          </div>
          <DialogDescription>
            Enter your 6-digit pincode to see accurate product availability, delivery times, and local shipping offers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex gap-2">
            <Input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit PIN code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
              className="font-mono tracking-wider text-base"
              autoFocus
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shrink-0">
              Apply
            </Button>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-2">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Popular Metro Locations
            </div>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_PINCODES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setInputCode(item.code);
                    setPincode(item.code);
                    setPincodeModalOpen(false);
                    toast.success(`Delivery location updated to ${item.city} (${item.code})`);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-colors ${
                    pincode === item.code
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{item.city}</div>
                    <div className="font-mono text-[11px] text-slate-400">{item.code}</div>
                  </div>
                  {pincode === item.code && <Check className="h-3.5 w-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
