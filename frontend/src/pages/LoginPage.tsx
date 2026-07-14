import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Phone, Smartphone, Sparkles, ArrowLeft, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { setCredentials } from '../store/slices/authSlice';
import {
  useLoginMutation,
  useRegisterMutation,
  useSendMobileOtpMutation,
  useVerifyMobileOtpMutation,
} from '../store/slices/userApiSlice';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  const [isRegister, setIsRegister] = useState(location.pathname === '/register');

  // Email login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Mobile OTP fields
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [sendOtp] = useSendMobileOtpMutation();
  const [verifyOtp] = useVerifyMobileOtpMutation();
  const isLoading = loginLoading || registerLoading || otpLoading;

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [navigate, redirect, userInfo]);

  useEffect(() => {
    if (countdown <= 0) return;
    const int = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(int);
  }, [countdown]);

  const switchMode = (toRegister: boolean) => {
    setIsRegister(toRegister);
    setErrorMessage('');
    setLoginMethod('email');
    setOtpSent(false);
    setOtpValues(['', '', '', '', '', '']);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpValues];
    next[idx] = val;
    setOtpValues(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleSendOtp = async () => {
    const phone = `+91${mobileNumber.replace(/\D/g, '')}`;
    if (phone.length < 12) { setErrorMessage('Enter a valid 10-digit mobile number'); return; }
    setErrorMessage('');
    setOtpLoading(true);
    try {
      await sendOtp({ phone }).unwrap();
      setOtpSent(true);
      setCountdown(30);
      toast.success('OTP sent successfully');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Failed to send OTP');
      toast.error(err?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpValues.join('');
    if (code.length !== 6) { setErrorMessage('Enter the 6-digit OTP'); return; }
    setErrorMessage('');
    setOtpLoading(true);
    try {
      const phone = `+91${mobileNumber.replace(/\D/g, '')}`;
      const payload = await verifyOtp({ phone, code }).unwrap();
      dispatch(setCredentials({ ...payload.user, accessToken: payload.accessToken }));
      toast.success('Login successful');
      navigate(redirect);
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Invalid or expired OTP');
      toast.error(err?.data?.message || 'Invalid OTP');
      setOtpValues(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail.trim() || !loginPassword.trim()) { setErrorMessage('Email and password are required.'); return; }
    try {
      const payload = await login({ email: loginEmail.trim(), password: loginPassword }).unwrap();
      dispatch(setCredentials({ ...payload.user, accessToken: payload.token || payload.accessToken }));
      toast.success('Login successful');
      navigate(redirect);
    } catch (err: any) {
      const msg = err?.data?.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!firstName.trim()) { setErrorMessage('First name is required.'); return; }
    if (!registerEmail.trim()) { setErrorMessage('Email is required.'); return; }
    if (registerPassword.length < 6) { setErrorMessage('Password must be at least 6 characters.'); return; }
    if (registerPassword !== confirmPassword) { setErrorMessage('Passwords do not match.'); return; }
    try {
      const payload = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        ...(registerPhone ? { phone: `+91${registerPhone.replace(/\D/g, '')}` } : {}),
      }).unwrap();
      dispatch(setCredentials({ ...payload.user, accessToken: payload.token || payload.accessToken }));
      toast.success('Registration successful');
      navigate(redirect);
    } catch (err: any) {
      const apiMessage = Array.isArray(err?.data?.message) ? err.data.message.join(', ') : typeof err?.data?.message === 'string' ? err.data.message : typeof err?.error === 'string' ? err.error : '';
      const msg = apiMessage || 'Registration failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left hero panel */}
        <section className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
          <div className="relative z-10 flex h-full flex-col justify-between p-12">
            <Link to="/" className="text-2xl font-black tracking-tight text-white">VASTRA</Link>
            <div className="max-w-xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white backdrop-blur">
                <Sparkles size={14} />
                {isRegister ? 'Join the community' : 'Members get first access'}
              </span>
              <h1 className="text-6xl font-black leading-none tracking-tight text-white">
                {isRegister ? 'Create your wardrobe account.' : 'Your wardrobe dashboard starts here.'}
              </h1>
              <p className="mt-5 text-lg leading-8 text-zinc-300">
                {isRegister
                  ? 'Sign up and unlock wishlist, faster checkout, and exclusive member-only drops.'
                  : 'Save your cart, keep a wishlist, and move faster through checkout with one clean account.'}
              </p>
            </div>
          </div>
        </section>

        {/* Right form panel */}
        <section className="flex items-center justify-center px-5 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-6 block text-2xl font-black tracking-tight lg:hidden">VASTRA</Link>

            <div className="mb-8">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-teal-600 dark:text-teal-400">
                {isRegister ? 'Create account' : 'Welcome back'}
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-tight">
                {isRegister ? 'Join VASTRA' : 'Sign in to continue'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {isRegister
                  ? 'Create your free account — no card required.'
                  : 'Access your cart, wishlist, and order history.'}
              </p>
            </div>

            {/* Login / Register tabs */}
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
              <button type="button" onClick={() => switchMode(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${!isRegister ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm' : 'text-zinc-500 hover:text-[hsl(var(--foreground))]'}`}>
                Login
              </button>
              <button type="button" onClick={() => switchMode(true)}
                className={`rounded-lg px-3 py-2.5 text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${isRegister ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm' : 'text-zinc-500 hover:text-[hsl(var(--foreground))]'}`}>
                Register
              </button>
            </div>

            {/* LOGIN FORM */}
            {!isRegister && (
              <>
                {/* Login method selector */}
                {!otpSent && (
                  <div className="flex gap-2 mb-6">
                    <button type="button" onClick={() => { setLoginMethod('email'); setErrorMessage(''); }}
                      className={`flex-1 h-[46px] rounded-xl text-[13px] font-bold tracking-wide transition-all duration-200 cursor-pointer border-2 ${loginMethod === 'email' ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-[hsl(var(--foreground))]' : 'bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'}`}>
                      <Mail size={16} className="inline mr-1.5" strokeWidth={1.5} /> Email
                    </button>
                    <button type="button" onClick={() => { setLoginMethod('mobile'); setErrorMessage(''); }}
                      className={`flex-1 h-[46px] rounded-xl text-[13px] font-bold tracking-wide transition-all duration-200 cursor-pointer border-2 ${loginMethod === 'mobile' ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-[hsl(var(--foreground))]' : 'bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'}`}>
                      <Smartphone size={16} className="inline mr-1.5" strokeWidth={1.5} /> Mobile
                    </button>
                  </div>
                )}

                {/* Email Login */}
                {loginMethod === 'email' && !otpSent && (
                  <form onSubmit={handleLogin} className="space-y-4" noValidate>
                    <div>
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-zinc-500">Email address</label>
                      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[hsl(var(--card))] px-4 py-3.5 transition focus-within:border-zinc-500">
                        <Mail size={17} className="shrink-0 text-zinc-400" />
                        <input type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-zinc-500">Password</label>
                      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[hsl(var(--card))] px-4 py-3.5 transition focus-within:border-zinc-500">
                        <Lock size={17} className="shrink-0 text-zinc-400" />
                        <input type={showLoginPassword ? 'text' : 'password'} placeholder="Enter your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400" />
                        <button type="button" onClick={() => setShowLoginPassword((p) => !p)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer">
                          {showLoginPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link to="/forgot-password" className="text-[12px] font-semibold text-zinc-500 hover:text-[hsl(var(--foreground))] underline underline-offset-2 transition-colors">
                        Forgot Password?
                      </Link>
                    </div>

                    {errorMessage && (
                      <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">{errorMessage}</div>
                    )}

                    <button type="submit" disabled={isLoading} className="mt-2 w-full rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] py-4 text-sm font-bold tracking-wider transition hover:opacity-90 disabled:opacity-60 cursor-pointer">
                      {isLoading ? 'Signing in...' : 'Login'}
                    </button>
                  </form>
                )}

                {/* Mobile OTP Login */}
                {loginMethod === 'mobile' && (
                  <div className="space-y-4">
                    {!otpSent ? (
                      <>
                        <div>
                          <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-zinc-500">Mobile Number</label>
                          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[hsl(var(--card))] px-4 py-3.5 transition focus-within:border-zinc-500">
                            <Phone size={17} className="shrink-0 text-zinc-400" />
                            <span className="text-sm font-semibold text-zinc-500">+91</span>
                            <input type="tel" placeholder="9876543210" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400" />
                          </div>
                        </div>
                        {errorMessage && <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">{errorMessage}</div>}
                        <button type="button" onClick={handleSendOtp} disabled={otpLoading || mobileNumber.length < 10} className="w-full rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] py-4 text-sm font-bold tracking-wider transition hover:opacity-90 disabled:opacity-50 cursor-pointer">
                          {otpLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => { setOtpSent(false); setOtpValues(['', '', '', '', '', '']); setErrorMessage(''); }} className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-500 hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer mb-2">
                          <ArrowLeft size={14} strokeWidth={2} /> Change number
                        </button>
                        <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-zinc-500">Enter OTP</label>
                        <p className="text-[13px] text-zinc-500 mb-4">OTP sent to +91 {mobileNumber}</p>
                        <div className="flex gap-2 justify-center mb-2">
                          {otpValues.map((val, i) => (
                            <input
                              key={i}
                              ref={(el) => { otpRefs.current[i] = el; }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={val}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(i, e)}
                              className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 bg-[hsl(var(--card))] outline-none transition-all duration-150 ${
                                val ? 'border-[hsl(var(--foreground))]' : 'border-zinc-200 dark:border-zinc-700 focus:border-zinc-500'
                              }`}
                            />
                          ))}
                        </div>
                        {errorMessage && <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">{errorMessage}</div>}
                        <button type="button" onClick={handleVerifyOtp} disabled={otpLoading || otpValues.join('').length !== 6} className="w-full rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] py-4 text-sm font-bold tracking-wider transition hover:opacity-90 disabled:opacity-50 cursor-pointer">
                          {otpLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <div className="text-center">
                          {countdown > 0 ? (
                            <span className="text-[12px] text-zinc-400">Resend in {countdown}s</span>
                          ) : (
                            <button type="button" onClick={handleSendOtp} className="text-[12px] font-semibold text-[hsl(var(--foreground))] underline underline-offset-2 hover:opacity-80 cursor-pointer">
                              Resend OTP
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* REGISTER FORM */}
            {isRegister && (
              <form onSubmit={handleRegister} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-zinc-500">First name</label>
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[hsl(var(--card))] px-4 py-3.5 transition focus-within:border-zinc-500">
                      <input type="text" placeholder="Aarav" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-zinc-500">Last name</label>
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[hsl(var(--card))] px-4 py-3.5 transition focus-within:border-zinc-500">
                      <input type="text" placeholder="Sharma" value={lastName} onChange={(e) => setLastName(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-zinc-500">Email address</label>
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[hsl(var(--card))] px-4 py-3.5 transition focus-within:border-zinc-500">
                    <Mail size={17} className="shrink-0 text-zinc-400" />
                    <input type="email" placeholder="you@example.com" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-zinc-500">Mobile number (optional)</label>
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[hsl(var(--card))] px-4 py-3.5 transition focus-within:border-zinc-500">
                    <Phone size={17} className="shrink-0 text-zinc-400" />
                    <span className="text-sm font-semibold text-zinc-500">+91</span>
                    <input type="tel" placeholder="9876543210" value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-zinc-500">Password</label>
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[hsl(var(--card))] px-4 py-3.5 transition focus-within:border-zinc-500">
                    <Lock size={17} className="shrink-0 text-zinc-400" />
                    <input type={showRegisterPassword ? 'text' : 'password'} placeholder="Minimum 6 characters" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400" />
                    <button type="button" onClick={() => setShowRegisterPassword((p) => !p)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer">
                      {showRegisterPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-zinc-500">Confirm password</label>
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[hsl(var(--card))] px-4 py-3.5 transition focus-within:border-zinc-500">
                    <Lock size={17} className="shrink-0 text-zinc-400" />
                    <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400" />
                    <button type="button" onClick={() => setShowConfirmPassword((p) => !p)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer">
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">{errorMessage}</div>
                )}

                <button type="submit" disabled={isLoading} className="mt-2 w-full rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] py-4 text-sm font-bold tracking-wider transition hover:opacity-90 disabled:opacity-60 cursor-pointer">
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>

                <p className="text-center text-xs text-zinc-500">
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode(false)} className="font-bold text-[hsl(var(--foreground))] underline underline-offset-2 cursor-pointer">Login</button>
                </p>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
