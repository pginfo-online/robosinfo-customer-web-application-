'use client';

// =====================================================================
// Customer Web Platform — Customer Support Helpdesk & Tickets
// =====================================================================

import React, { useState } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface LocalTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  lastMessage: string;
}

const INITIAL_TICKETS: LocalTicket[] = [
  {
    id: 't-1',
    ticketNumber: 'TKT-84920',
    subject: 'Query regarding delivery slot rescheduling',
    category: 'Delivery',
    status: 'RESOLVED',
    createdAt: '2026-09-14T10:30:00Z',
    lastMessage: 'Your delivery has been rescheduled to tomorrow evening as requested.',
  },
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<LocalTicket[]>(INITIAL_TICKETS);
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Order & Delivery');
  const [message, setMessage] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter subject and details');
      return;
    }

    const newTicket: LocalTicket = {
      id: `t-${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
      subject: subject.trim(),
      category,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      lastMessage: message.trim(),
    };

    setTickets([newTicket, ...tickets]);
    setIsOpen(false);
    setSubject('');
    setMessage('');
    toast.success(`Support ticket ${newTicket.ticketNumber} created! Our team will respond within 2 hours.`);
  };

  return (
    <div className="space-y-8">
      {/* ─── Contact Banner ─────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700 text-white shadow-md shadow-blue-500/10 space-y-4">
        <div>
          <span className="text-xs font-bold text-sky-200 uppercase tracking-widest">
            24x7 Customer Care
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            How can we assist you today?
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 max-w-xl mt-1">
            Our specialized support team is available 24 hours a day, 7 days a week to resolve your queries with priority attention.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md flex items-center gap-3">
            <Phone className="h-5 w-5 text-sky-200 shrink-0" />
            <div>
              <span className="text-[11px] text-sky-200 block">Toll-Free Customer Line</span>
              <span className="font-bold text-sm">{APP_CONFIG.supportPhone}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md flex items-center gap-3">
            <Mail className="h-5 w-5 text-sky-200 shrink-0" />
            <div>
              <span className="text-[11px] text-sky-200 block">Email Desk</span>
              <span className="font-bold text-sm">{APP_CONFIG.supportEmail}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Ticket History & Creation ──────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Support Inquiries & Tickets ({tickets.length})
            </h3>
            <p className="text-xs text-slate-500">
              Track the resolution status of your raised tickets.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="rounded-xl font-bold gap-1 text-xs bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Raise New Ticket
          </Button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {tickets.map((t) => (
            <div key={t.id} className="py-4 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600">{t.ticketNumber}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="font-semibold text-slate-500">{t.category}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.subject}</h4>
              <p className="text-slate-600 dark:text-slate-400">{t.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Raise Ticket Modal ─────────────────────────────────────── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Raise a Support Ticket</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTicket} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Issue Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Order & Delivery">Order & Delivery</option>
                <option value="Refund & Return">Refund & Return</option>
                <option value="Payment & Billing">Payment & Billing</option>
                <option value="Product Quality">Product Quality & Warranty</option>
                <option value="Account & Security">Account & Security</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Subject Headline *
              </label>
              <Input
                required
                placeholder="Brief summary of your query"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Detailed Message *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Please describe your issue or question in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200"
              />
            </div>

            <Button type="submit" className="w-full font-bold bg-blue-600 hover:bg-blue-700">
              Submit Ticket
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
