'use client';

// =====================================================================
// Customer Web Platform — Order Confirmation Page
// (Success Animation, Order Summary, Address Snapshot, Quick CTAs)
// =====================================================================

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPaisa, formatDate } from '@/lib/utils';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: () => api.get<Order>(API_ENDPOINTS.ORDER_BY_ID(orderId)),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-16 w-16 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto animate-pulse" />
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto animate-pulse" />
        <div className="h-48 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse" />
      </div>
    );
  }

  // Parse shipping snapshot safely
  let addressSnapshot: any = null;
  if (order?.shippingAddressSnapshot) {
    try {
      addressSnapshot = JSON.parse(order.shippingAddressSnapshot);
    } catch {
      addressSnapshot = { line1: order.shippingAddressSnapshot };
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      {/* ─── Success Celebration Header ───────────────────────────────── */}
      <div className="text-center space-y-3">
        <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Thank You! Your Order is Confirmed
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
          We have received your order #{order?.orderNumber || orderId.substring(0, 8)}. A confirmation SMS and email have been sent to your registered contact.
        </p>
      </div>

      {/* ─── Main Order Details Card ──────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        {/* Top Info Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Order Number</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {order?.orderNumber || 'ORD-9821'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Order Date</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {order?.createdAt ? formatDate(order.createdAt) : 'Today'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Order Status</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">
              {order?.status || 'CONFIRMED'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Total Paid</span>
            <span className="font-black text-slate-900 dark:text-white">
              {formatPaisa(order?.totalPaisa || 0)}
            </span>
          </div>
        </div>

        {/* Delivery Address & ETA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Shipping Address */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <MapPin className="h-4 w-4 text-blue-600" />
              Delivery Address
            </div>
            {addressSnapshot ? (
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">
                  {addressSnapshot.label || 'Home'}
                </p>
                <p>{addressSnapshot.line1}</p>
                {addressSnapshot.line2 && <p>{addressSnapshot.line2}</p>}
                <p>
                  {addressSnapshot.city}, {addressSnapshot.state} - {addressSnapshot.pincode}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Address recorded on order file.</p>
            )}
          </div>

          {/* Estimated Arrival */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Truck className="h-4 w-4 text-emerald-600" />
              Estimated Delivery
            </div>
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 space-y-1">
              <span className="text-sm font-extrabold text-emerald-900 dark:text-emerald-300 block">
                Arriving in 2 - 3 Business Days
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Express fulfillment via NovaMarket Logistics partner network.
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Items in this Shipment ({order?.items?.length || 0})
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 px-4">
            {order?.items?.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {item.productTitle}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Qty: {item.qty} • SKU: {item.sku}
                  </p>
                </div>
                <div className="font-black text-slate-900 dark:text-white">
                  {formatPaisa(item.totalPaisa)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            asChild
            size="lg"
            className="flex-1 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700"
          >
            <Link href={`/account/orders/${order?.id || orderId}`}>
              <Package className="mr-2 h-4 w-4" />
              Track Your Order
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="flex-1 rounded-2xl font-bold border-slate-200 hover:bg-slate-50"
          >
            <Link href="/">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
