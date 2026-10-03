'use client';

// =====================================================================
// Customer Web Platform — My Orders History Page
// =====================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  ChevronRight,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Order, PageResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPaisa, formatDate } from '@/lib/utils';

export default function OrdersPage() {
  const { data: ordersData, isLoading } = useQuery<PageResponse<Order> | Order[]>({
    queryKey: ['orders', 'me'],
    queryFn: () => api.get<any>(API_ENDPOINTS.MY_ORDERS),
  });

  const orders: Order[] = Array.isArray(ordersData)
    ? ordersData
    : (ordersData as PageResponse<Order>)?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </span>
        );
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
            <Truck className="h-3 w-3" /> In Transit
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-2.5 py-0.5 rounded-full">
            <AlertCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
            <Clock className="h-3 w-3" /> {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800/40 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 mx-auto flex items-center justify-center">
          <Package className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          You Have No Orders Yet
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Start browsing our catalog to discover exclusive deals and place your first order.
        </p>
        <Button asChild className="rounded-full px-6 font-bold bg-blue-600 hover:bg-blue-700">
          <Link href="/">
            <ShoppingBag className="mr-2 h-4 w-4" /> Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="pb-2">
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
          Your Order History ({orders.length})
        </h2>
        <p className="text-xs text-slate-500">
          Check the status of current shipments and past orders.
        </p>
      </div>

      {orders.map((order) => (
        <div
          key={order.id}
          className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4"
        >
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Order Number
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {order.orderNumber}
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Placed On
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getStatusBadge(order.status)}
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {formatPaisa(order.totalPaisa)}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs gap-4">
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate">
                    {item.productTitle}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Qty: {item.qty} • {formatPaisa(item.unitPricePaisa)} each
                  </p>
                </div>
                <span className="font-bold text-slate-900 dark:text-white shrink-0">
                  {formatPaisa(item.totalPaisa)}
                </span>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">
              {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
            </span>

            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-xl font-bold text-xs gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Link href={`/account/orders/${order.id}`}>
                <span>Track & Manage Order</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
