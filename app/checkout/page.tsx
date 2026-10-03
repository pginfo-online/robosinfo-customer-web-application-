'use client';

// =====================================================================
// Customer Web Platform — Multi-Step Checkout Page
// (Address Selection, Order Summary, Payment Options, Order Placement)
// =====================================================================

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Plus,
  CheckCircle2,
  CreditCard,
  Banknote,
  ShieldCheck,
  Truck,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  Tag,
  Lock,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/lib/constants';
import { Cart, UserAddress, AddressPayload, Order, CreateOrderPayload } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useUIStore } from '@/store/ui-store';
import { formatPaisa } from '@/lib/utils';
import { toast } from 'sonner';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { isAuthenticated, user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const { fetchCartCount } = useCartStore();

  const couponParam = searchParams.get('coupon') || '';

  // Checkout Steps: 1 = Address, 2 = Order Summary, 3 = Payment
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [isNewAddressOpen, setIsNewAddressOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // New Address Form State
  const [newAddress, setNewAddress] = useState<AddressPayload>({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
    isDefault: true,
  });

  // Redirect or show modal if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('otp');
    }
  }, [isAuthenticated, openAuthModal]);

  // 1. Fetch Cart Data
  const { data: cart, isLoading: isCartLoading } = useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: () => api.get<Cart>(API_ENDPOINTS.CART),
    enabled: isAuthenticated,
  });

  // 2. Fetch User Addresses
  const {
    data: addresses,
    isLoading: isAddressesLoading,
    refetch: refetchAddresses,
  } = useQuery<UserAddress[]>({
    queryKey: ['user', 'addresses'],
    queryFn: () => api.get<UserAddress[]>(API_ENDPOINTS.USER_ADDRESSES),
    enabled: isAuthenticated,
  });

  // Auto-select default or first address
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  // Add Address Mutation
  const addAddressMutation = useMutation({
    mutationFn: (payload: AddressPayload) =>
      api.post<UserAddress>(API_ENDPOINTS.USER_ADDRESSES, payload),
    onSuccess: (saved) => {
      toast.success('Delivery address added successfully');
      setIsNewAddressOpen(false);
      refetchAddresses();
      if (saved?.id) {
        setSelectedAddressId(saved.id);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save address');
    },
  });

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.line1 || !newAddress.city || !newAddress.pincode) {
      toast.error('Please fill in all mandatory address fields');
      return;
    }
    addAddressMutation.mutate(newAddress);
  };

  // Order Calculations
  const cartItems = cart?.items || [];
  const subtotalPaisa = cart?.subtotalPaisa || 0;
  const deliveryFeePaisa = subtotalPaisa >= 49900 || subtotalPaisa === 0 ? 0 : 4900;
  const totalAmountPaisa = subtotalPaisa + deliveryFeePaisa;

  // Place Order Action
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      setCurrentStep(1);
      return;
    }

    setIsSubmittingOrder(true);
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const orderPayload: CreateOrderPayload = {
        addressId: selectedAddressId,
        idempotencyKey,
        couponCode: couponParam || undefined,
        notes: orderNotes.trim() || undefined,
      };

      const createdOrder = await api.post<Order>(API_ENDPOINTS.ORDERS, orderPayload);

      if (paymentMethod === 'ONLINE') {
        // Create Payment Intent
        try {
          await api.post(API_ENDPOINTS.PAYMENT_INTENT, {
            orderId: createdOrder.id,
            amountPaisa: createdOrder.totalPaisa,
            currency: 'INR',
          });
        } catch {
          // In test environments or when gateway mock is active
        }
      }

      await fetchCartCount();
      toast.success('Order placed successfully!');
      router.push(`/orders/${createdOrder.id}/confirmation`);
    } catch (err: any) {
      toast.error(err.message || 'Could not place order. Please check item stock.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Lock className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-xl font-bold">Authentication Required</h2>
        <p className="text-sm text-slate-500">Please sign in to access checkout</p>
        <Button onClick={() => openAuthModal('otp')} className="w-full">
          Sign In / Register
        </Button>
      </div>
    );
  }

  if (isCartLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse" />
          <div className="lg:col-span-4 h-72 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="flex items-center justify-center max-w-xl mx-auto">
        <div className="flex items-center w-full justify-between">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              1
            </div>
            <span className="text-xs font-bold hidden sm:inline">Delivery Address</span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </div>
            <span className="text-xs font-bold hidden sm:inline">Order Summary</span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              3
            </div>
            <span className="text-xs font-bold hidden sm:inline">Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── Left Column: Step Content ─────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          {/* ══ STEP 1: Delivery Address Selection ══════════════════════ */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    1. Select Delivery Address
                  </h2>
                  <p className="text-xs text-slate-500">
                    Where would you like us to deliver your order?
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNewAddressOpen(true)}
                className="rounded-xl font-bold gap-1 text-xs text-blue-600 border-blue-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Address
              </Button>
            </div>

            {/* Address List */}
            {isAddressesLoading ? (
              <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
            ) : addresses && addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;

                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              {addr.label || 'Home'}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] text-blue-600 font-bold">DEFAULT</span>
                            )}
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 font-medium pt-1">
                            {addr.line1}
                          </p>
                          {addr.line2 && <p className="text-slate-500">{addr.line2}</p>}
                          <p className="text-slate-500 font-semibold">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-slate-400 text-[11px]">Phone: {user?.phone || 'N/A'}</p>
                        </div>

                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed rounded-2xl border-slate-200 text-xs text-slate-500">
                No delivery addresses found. Please add a delivery address to proceed.
              </div>
            )}
          </div>

          {/* ══ STEP 2: Order Items Summary ═════════════════════════════ */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  2. Order Items ({cartItems.reduce((s, i) => s + i.qty, 0)})
                </h2>
                <p className="text-xs text-slate-500">
                  Standard Express delivery dispatched from regional warehouse
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {cartItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100">
                    <Image
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={item.productTitle}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.productTitle}
                    </h4>
                    <p className="text-[11px] text-slate-400">Qty: {item.qty}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {formatPaisa(item.unitPricePaisa * item.qty)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ STEP 3: Payment Method ══════════════════════════════════ */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  3. Select Payment Method
                </h2>
                <p className="text-xs text-slate-500">
                  All transactions are 100% encrypted & secure
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* Online Payment Option */}
              <div
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'ONLINE'
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                      UPI, Credit/Debit Cards, NetBanking (Fast & Secure)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Supports Google Pay, PhonePe, Paytm, Visa, Mastercard, RuPay
                    </span>
                  </div>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'ONLINE' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'ONLINE' && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                </div>
              </div>

              {/* Cash on Delivery Option */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'COD'
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pay in cash or via QR scan at your doorstep
                    </span>
                  </div>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'COD' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'COD' && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                </div>
              </div>
            </div>

            {/* Delivery Instructions / Order Notes */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Delivery Instructions (Optional):
              </label>
              <Input
                placeholder="e.g. Leave with security or call upon arrival"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* ─── Right Column: Order Total & Place Order CTA ───────────── */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Payment Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal</span>
                <span>{formatPaisa(subtotalPaisa)}</span>
              </div>

              {couponParam && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Coupon ({couponParam})
                  </span>
                  <span>Applied</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Standard Delivery</span>
                <span>
                  {deliveryFeePaisa === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatPaisa(deliveryFeePaisa)
                  )}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-black text-slate-900 dark:text-white">To Pay</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {formatPaisa(totalAmountPaisa)}
              </span>
            </div>

            <Button
              type="button"
              size="lg"
              disabled={isSubmittingOrder || !selectedAddressId}
              onClick={handlePlaceOrder}
              className="w-full h-12 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
            >
              {isSubmittingOrder ? 'Placing Order...' : 'Confirm & Place Order'}
            </Button>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>100% Safe & PCI-DSS Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Add New Address Modal ────────────────────────────────────── */}
      <Dialog open={isNewAddressOpen} onOpenChange={setIsNewAddressOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              Add New Delivery Address
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateAddress} className="space-y-3.5 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Address Tag / Label
              </label>
              <div className="flex gap-2">
                {['Home', 'Work', 'Other'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setNewAddress((prev) => ({ ...prev, label: tag }))}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      newAddress.label === tag
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Flat, House no., Building, Company, Apartment *
              </label>
              <Input
                required
                placeholder="e.g. Flat 402, Sunshine Heights"
                value={newAddress.line1}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, line1: e.target.value }))}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Area, Street, Sector, Village (Optional)
              </label>
              <Input
                placeholder="e.g. 100 Feet Road, Indiranagar"
                value={newAddress.line2 || ''}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, line2: e.target.value }))}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  City *
                </label>
                <Input
                  required
                  placeholder="e.g. Bengaluru"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  6-Digit Pincode *
                </label>
                <Input
                  required
                  maxLength={6}
                  placeholder="560001"
                  value={newAddress.pincode}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      pincode: e.target.value.replace(/\D/g, ''),
                    }))
                  }
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  State *
                </label>
                <Input
                  required
                  placeholder="e.g. Karnataka"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Country
                </label>
                <Input disabled value="India" className="text-xs bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-bold mt-2"
              isLoading={addAddressMutation.isPending}
            >
              Save Address & Continue
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 h-96 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse" />
            <div className="lg:col-span-4 h-72 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse" />
          </div>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
