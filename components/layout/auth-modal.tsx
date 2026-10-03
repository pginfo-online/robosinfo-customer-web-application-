'use client';

// =====================================================================
// Customer Web Platform — Auth Modal (Phone OTP & Password Tabs)
// =====================================================================

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Smartphone, Lock, ArrowRight, ShieldCheck, Mail, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal } = useUIStore();
  const setAuth = useAuthStore((s) => s.setAuth);

  // OTP Flow States
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<'SMS' | 'WHATSAPP'>('SMS');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Password Flow States
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Register States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [isRegLoading, setIsRegLoading] = useState(false);

  // ─── OTP Send ────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsOtpLoading(true);
    try {
      await api.post(API_ENDPOINTS.OTP_SEND, {
        phone: phone.trim(),
        channel,
        purpose: 'LOGIN',
      });
      toast.success(`OTP sent to ${phone} via ${channel}`);
      setStep('otp');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP';
      toast.error(msg);
    } finally {
      setIsOtpLoading(false);
    }
  };

  // ─── OTP Verify ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setIsOtpLoading(true);
    try {
      const res: any = await api.post(API_ENDPOINTS.OTP_VERIFY, {
        phone: phone.trim(),
        otp: otp.trim(),
        purpose: 'LOGIN',
      });

      const user = res.user;
      const accessToken = res.accessToken;
      const refreshToken = res.refreshToken;

      setAuth(user, accessToken, refreshToken);
      toast.success('Welcome back! Logged in successfully.');
      closeAuthModal();
      setStep('phone');
      setOtp('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid OTP code';
      toast.error(msg);
    } finally {
      setIsOtpLoading(false);
    }
  };

  // ─── Password Login ──────────────────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone || !loginPassword) {
      toast.error('Please enter your phone number and password');
      return;
    }

    setIsLoginLoading(true);
    try {
      const res: any = await api.post(API_ENDPOINTS.LOGIN, {
        phone: loginPhone.trim(),
        password: loginPassword,
      });

      setAuth(res.user, res.accessToken, res.refreshToken);
      toast.success('Logged in successfully!');
      closeAuthModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast.error(msg);
    } finally {
      setIsLoginLoading(false);
    }
  };

  // ─── Register ────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || !regPassword || !regName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsRegLoading(true);
    try {
      const res: any = await api.post(API_ENDPOINTS.REGISTER, {
        name: regName.trim(),
        email: regEmail.trim() || undefined,
        phone: regPhone.trim(),
        password: regPassword,
        userType: 'CUSTOMER',
      });

      setAuth(res.user, res.accessToken, res.refreshToken);
      toast.success('Account created successfully!');
      closeAuthModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toast.error(msg);
    } finally {
      setIsRegLoading(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white text-center">
          <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-black tracking-tight text-white">
            Welcome to NovaMarket
          </DialogTitle>
          <p className="text-xs text-blue-100 font-medium mt-1">
            Sign in to track orders, save wishlists, and unlock member discounts
          </p>
        </div>

        <div className="p-6">
          <Tabs
            defaultValue={authModalTab || 'otp'}
            onValueChange={(val) => openAuthModal(val as any)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="otp">Phone OTP</TabsTrigger>
              <TabsTrigger value="login">Password</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* TAB 1: Phone OTP */}
            <TabsContent value="otp">
              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                      Mobile Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        +91
                      </div>
                      <Input
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        leftIcon={<Smartphone className="h-4 w-4" />}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Channel Toggle */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs text-slate-500 font-medium">Send via:</span>
                    <button
                      type="button"
                      onClick={() => setChannel('SMS')}
                      className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${
                        channel === 'SMS'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('WHATSAPP')}
                      className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${
                        channel === 'WHATSAPP'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      WhatsApp
                    </button>
                  </div>

                  <Button type="submit" className="w-full h-11" isLoading={isOtpLoading}>
                    Request OTP
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-2.5 rounded-xl text-center">
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                      💡 <strong>Dev Mode</strong>: OTP code is also logged to backend terminal. Try code <code className="font-bold underline">123456</code> if running locally.
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center pb-1">
                    <p className="text-xs text-slate-500">
                      We sent a 6-digit code to <strong>+91 {phone}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="text-xs font-bold text-blue-600 hover:underline mt-1"
                    >
                      Change Phone Number
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider text-center">
                      Enter 6-Digit OTP Code
                    </label>
                    <Input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="text-center tracking-widest text-lg font-extrabold h-12"
                      placeholder="• • • • • •"
                      required
                      autoFocus
                    />
                  </div>

                  <Button type="submit" className="w-full h-11" isLoading={isOtpLoading}>
                    Verify & Continue
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs font-bold text-slate-500 hover:text-blue-600"
                    >
                      Didn&apos;t receive code? Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </TabsContent>

            {/* TAB 2: Password Login */}
            <TabsContent value="login">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Registered phone number"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    leftIcon={<Smartphone className="h-4 w-4" />}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    leftIcon={<Lock className="h-4 w-4" />}
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-11" isLoading={isLoginLoading}>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>

            {/* TAB 3: Register */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    leftIcon={<UserIcon className="h-4 w-4" />}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    leftIcon={<Smartphone className="h-4 w-4" />}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider">
                    Email Address (Optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    leftIcon={<Mail className="h-4 w-4" />}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider">
                    Password *
                  </label>
                  <Input
                    type="password"
                    placeholder="Min 8 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    leftIcon={<Lock className="h-4 w-4" />}
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-11 mt-2" isLoading={isRegLoading}>
                  Create Customer Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
