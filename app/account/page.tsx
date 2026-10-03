'use client';

// =====================================================================
// Customer Web Platform — My Profile & Saved Addresses
// =====================================================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Edit2,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { User as UserType, UserAddress, AddressPayload } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  const [nameInput, setNameInput] = useState(user?.name || '');
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isNewAddressOpen, setIsNewAddressOpen] = useState(false);

  // Address Form State
  const [newAddress, setNewAddress] = useState<AddressPayload>({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    country: 'India',
    isDefault: false,
  });

  // Fetch Addresses
  const { data: addresses, isLoading: isAddressesLoading, refetch: refetchAddresses } = useQuery<
    UserAddress[]
  >({
    queryKey: ['user', 'addresses'],
    queryFn: () => api.get<UserAddress[]>(API_ENDPOINTS.USER_ADDRESSES),
  });

  // Update Profile Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const updated = await api.put<UserType>(API_ENDPOINTS.USER_PROFILE, {
        name: nameInput.trim(),
        email: emailInput.trim(),
      });
      updateUser({ name: nameInput.trim(), email: emailInput.trim() });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Add Address Mutation
  const addAddressMutation = useMutation({
    mutationFn: (payload: AddressPayload) =>
      api.post<UserAddress>(API_ENDPOINTS.USER_ADDRESSES, payload),
    onSuccess: () => {
      toast.success('New address added!');
      setIsNewAddressOpen(false);
      refetchAddresses();
      setNewAddress({
        label: 'Home',
        line1: '',
        line2: '',
        city: '',
        state: 'Karnataka',
        pincode: '',
        country: 'India',
        isDefault: false,
      });
    },
    onError: (err: any) => toast.error(err.message || 'Could not save address'),
  });

  // Delete Address
  const handleDeleteAddress = async (id: string) => {
    try {
      await api.delete(`${API_ENDPOINTS.USER_ADDRESSES}/${id}`);
      toast.info('Address removed');
      refetchAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove address');
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── Profile Overview ───────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Personal Information
          </h2>
          <p className="text-xs text-slate-500">
            Manage your personal profile details and contact information.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Full Name
            </label>
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Email Address
            </label>
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. rahul.sharma@example.com"
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Mobile Phone Number
            </label>
            <Input
              disabled
              value={user?.phone || '+91 98765 43210'}
              className="text-xs bg-slate-50 dark:bg-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Primary mobile number linked to OTP authentication.
            </p>
          </div>

          <Button
            type="submit"
            className="font-bold text-xs rounded-xl h-10 px-6 bg-blue-600 hover:bg-blue-700"
            isLoading={isUpdatingProfile}
          >
            Save Changes
          </Button>
        </form>
      </div>

      {/* ─── Manage Addresses ───────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Manage Addresses
            </h2>
            <p className="text-xs text-slate-500">
              Save addresses for effortless 1-click checkout.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsNewAddressOpen(true)}
            className="rounded-xl font-bold gap-1 text-xs text-blue-600 border-blue-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Address
          </Button>
        </div>

        {isAddressesLoading ? (
          <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        ) : addresses && addresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                    {addr.label || 'Home'}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-blue-600">DEFAULT</span>
                  )}
                </div>

                <p className="text-slate-800 dark:text-slate-200 font-medium">{addr.line1}</p>
                {addr.line2 && <p className="text-slate-500">{addr.line2}</p>}
                <p className="text-slate-500 font-semibold">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>

                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed rounded-2xl border-slate-200 text-xs text-slate-500">
            No saved addresses found.
          </div>
        )}
      </div>

      {/* ─── Add Address Modal ────────────────────────────────────────── */}
      <Dialog open={isNewAddressOpen} onOpenChange={setIsNewAddressOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Add Delivery Address</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addAddressMutation.mutate(newAddress);
            }}
            className="space-y-3.5 pt-2"
          >
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tag / Label
              </label>
              <div className="flex gap-2">
                {['Home', 'Work', 'Other'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setNewAddress((prev) => ({ ...prev, label: tag }))}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      newAddress.label === tag
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
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
                Street / House / Building *
              </label>
              <Input
                required
                value={newAddress.line1}
                onChange={(e) => setNewAddress((p) => ({ ...p, line1: e.target.value }))}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Area / Colony (Optional)
              </label>
              <Input
                value={newAddress.line2 || ''}
                onChange={(e) => setNewAddress((p) => ({ ...p, line2: e.target.value }))}
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
                  value={newAddress.city}
                  onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
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
                  value={newAddress.pincode}
                  onChange={(e) =>
                    setNewAddress((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, '') }))
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
                  value={newAddress.state}
                  onChange={(e) => setNewAddress((p) => ({ ...p, state: e.target.value }))}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Country
                </label>
                <Input disabled value="India" className="text-xs bg-slate-100" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-bold mt-2"
              isLoading={addAddressMutation.isPending}
            >
              Save Address
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
