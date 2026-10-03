'use client';

// =====================================================================
// Customer Web Platform — Order Detail & Live Shipment Tracking
// (Visual 5-Stage Stepper, Cancel Action, Return Initiation)
// =====================================================================

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  RotateCcw,
  XCircle,
  AlertCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Order, OrderItem, CreateReturnPayload } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { formatPaisa, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const TRACKING_STAGES = [
  { id: 'CONFIRMED', label: 'Order Confirmed', desc: 'Seller has accepted the order' },
  { id: 'PROCESSING', label: 'Packed & Ready', desc: 'Item packed in warehouse' },
  { id: 'SHIPPED', label: 'In Transit', desc: 'Dispatched with logistics partner' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Courier agent is arriving' },
  { id: 'DELIVERED', label: 'Delivered', desc: 'Handed over to customer' },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const queryClient = useQueryClient();

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Order placed by mistake');
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState<OrderItem | null>(null);
  const [returnReason, setReturnReason] = useState('Defective/Damaged product');
  const [returnNotes, setReturnNotes] = useState('');

  // 1. Fetch Order Details
  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: () => api.get<Order>(API_ENDPOINTS.ORDER_BY_ID(orderId)),
    enabled: !!orderId,
  });

  // Cancel Order Mutation
  const cancelMutation = useMutation({
    mutationFn: (reason: string) =>
      api.post(API_ENDPOINTS.CANCEL_ORDER(orderId), { reason }),
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      setIsCancelOpen(false);
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'me'] });
    },
    onError: (err: any) => toast.error(err.message || 'Could not cancel order'),
  });

  // Return Mutation
  const returnMutation = useMutation({
    mutationFn: (payload: CreateReturnPayload) =>
      api.post(API_ENDPOINTS.RETURNS, payload),
    onSuccess: () => {
      toast.success('Return request initiated! Our courier will inspect upon pickup.');
      setIsReturnOpen(false);
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to submit return request'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-500">Order not found.</p>
        <Button asChild className="mt-4">
          <Link href="/account/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  // Calculate current stage index in tracking
  const getActiveStageIndex = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 4;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'SHIPPED':
        return 2;
      case 'PROCESSING':
      case 'PAID':
        return 1;
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  const activeStage = getActiveStageIndex(order.status);
  const isCancellable = ['CREATED', 'PAYMENT_PENDING', 'PAID', 'PROCESSING'].includes(
    order.status
  );
  const isReturnable = order.status === 'DELIVERED';

  let addressObj: any = null;
  if (order.shippingAddressSnapshot) {
    try {
      addressObj = JSON.parse(order.shippingAddressSnapshot);
    } catch {
      addressObj = { line1: order.shippingAddressSnapshot };
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Orders
        </Link>

        {isCancellable && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCancelOpen(true)}
            className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
          >
            Cancel Order
          </Button>
        )}
      </div>

      {/* ─── 1. Live Tracking Stepper ───────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
              Order Tracking #{order.orderNumber}
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              Status: <span className="text-blue-600">{order.status}</span>
            </h2>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 block">Ordered On</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        {order.status === 'CANCELLED' ? (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-3 text-red-700 dark:text-red-300 text-xs font-semibold">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>This order was cancelled. Any prepaid payments will be automatically refunded within 3-5 business days.</span>
          </div>
        ) : (
          /* Visual Stepper */
          <div className="pt-4 pb-2">
            <div className="relative">
              <div className="hidden sm:block absolute top-4 left-6 right-6 h-1 bg-slate-100 dark:bg-slate-800 -z-0">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${(activeStage / 4) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                {TRACKING_STAGES.map((stage, idx) => {
                  const isCompleted = idx <= activeStage;
                  const isCurrent = idx === activeStage;

                  return (
                    <div key={stage.id} className="flex sm:flex-col items-center gap-3 text-left sm:text-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isCompleted
                            ? 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-100 dark:ring-blue-950'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                      </div>
                      <div>
                        <h4
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-blue-600 dark:text-blue-400'
                              : isCompleted
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          {stage.label}
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-tight hidden sm:block mt-0.5">
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── 2. Ordered Items List ──────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Items in this Order ({order.items?.length || 0})
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {order.items?.map((item) => (
            <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {item.productTitle}
                </h4>
                <p className="text-slate-400">
                  Qty: {item.qty} • SKU: {item.sku}
                </p>
                <div className="flex items-center gap-2 pt-1 font-bold">
                  <span>Price: {formatPaisa(item.unitPricePaisa)} each</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-blue-600">Total: {formatPaisa(item.totalPaisa)}</span>
                </div>
              </div>

              {isReturnable && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedReturnItem(item);
                    setIsReturnOpen(true);
                  }}
                  className="rounded-xl font-bold text-xs gap-1 border-amber-300 text-amber-700 hover:bg-amber-50 shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Request Return
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. Address & Billing Summary ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Address */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <MapPin className="h-4 w-4 text-blue-600" />
            Delivery Address
          </div>
          {addressObj ? (
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 leading-relaxed">
              <p className="font-bold text-slate-900 dark:text-white">{addressObj.label || 'Home'}</p>
              <p>{addressObj.line1}</p>
              {addressObj.line2 && <p>{addressObj.line2}</p>}
              <p>
                {addressObj.city}, {addressObj.state} - {addressObj.pincode}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Address recorded on order file.</p>
          )}
        </div>

        {/* Payment Summary */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <FileText className="h-4 w-4 text-indigo-600" />
            Billing Breakdown
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatPaisa(order.subtotalPaisa)}</span>
            </div>
            {order.discountPaisa > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount</span>
                <span>-{formatPaisa(order.discountPaisa)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Shipping Fee</span>
              <span>{order.shippingPaisa === 0 ? 'FREE' : formatPaisa(order.shippingPaisa)}</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 dark:text-white text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Total Paid</span>
              <span>{formatPaisa(order.totalPaisa)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Cancel Order Modal ─────────────────────────────────────── */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-red-600">
              Cancel Order #{order.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Are you sure you wish to cancel this order? This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Reason for cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Order placed by mistake">Order placed by mistake</option>
                <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Need to change shipping address">Need to change shipping address</option>
              </select>
            </div>

            <Button
              onClick={() => cancelMutation.mutate(cancelReason)}
              isLoading={cancelMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 font-bold"
            >
              Confirm Cancellation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Return Request Modal ───────────────────────────────────── */}
      <Dialog open={isReturnOpen} onOpenChange={setIsReturnOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">
              Request Return & Replacement
            </DialogTitle>
            <DialogDescription>
              Submit a return request for: {selectedReturnItem?.productTitle}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedReturnItem) {
                returnMutation.mutate({
                  orderItemId: selectedReturnItem.id,
                  reason: returnReason,
                  customerNotes: returnNotes,
                });
              }
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Return Reason *
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Defective/Damaged product">Defective or Damaged product</option>
                <option value="Wrong item delivered">Wrong item delivered</option>
                <option value="Product not matching description">Product not matching description</option>
                <option value="Size or fit issue">Size or fit issue</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Additional Comments
              </label>
              <textarea
                rows={3}
                placeholder="Explain the defect or reason for return"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <Button
              type="submit"
              isLoading={returnMutation.isPending}
              className="w-full font-bold bg-blue-600 hover:bg-blue-700"
            >
              Submit Return Request
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
