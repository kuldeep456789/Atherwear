import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Sparkles, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { setCredentials } from '../store/slices/authSlice';
import { useLoginMutation, useRegisterMutation } from '../store/slices/userApiSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const [isRegister, setIsRegister] = useState(location.pathname === '/register');
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  // Register fields
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const isLoading = loginLoading || registerLoading;

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [navigate, redirect, userInfo]);

  const switchMode = (toRegister: boolean) => {
    setIsRegister(toRegister);
    setErrorMessage('');
    setLoginEmail('');
    setLoginPassword('');
    setFullName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setConfirmPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Email and password are required.');
      return;
    }

    try {
      const payload = await login({ email: loginEmail.trim(), password: loginPassword }).unwrap();
      dispatch(setCredentials({ ...payload.user, accessToken: payload.token || payload.accessToken }));
      navigate(redirect);
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!registerEmail.trim()) {
      setErrorMessage('Email is required.');
      return;
    }
    if (registerPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const payload = await register({
        name: fullName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
      }).unwrap();
      dispatch(setCredentials({ ...payload.user, accessToken: payload.token || payload.accessToken }));
      navigate(redirect);
    } catch (err: any) {
      const apiMessage =
        Array.isArray(err?.data?.message)
          ? err.data.message.join(', ')
          : typeof err?.data?.message === 'string'
            ? err.data.message
            : typeof err?.error === 'string'
              ? err.error
              : '';
      setErrorMessage(apiMessage || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] pt-[112px] sm:pt-[116px] lg:pt-[124px]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

        {/* ─── Left hero panel ─── */}
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

        {/* ─── Right form panel ─── */}
        <section className="flex items-center justify-center px-5 py-12 sm:px-8">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <Link to="/" className="mb-6 block text-2xl font-black tracking-tight lg:hidden">VASTRA</Link>

            {/* Heading */}
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
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-[hsl(var(--secondary))] p-1">
              <button
                type="button"
                onClick={() => switchMode(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-black uppercase tracking-wider transition-all ${!isRegister
                    ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
                    : 'text-zinc-500 hover:text-[hsl(var(--foreground))]'
                  }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchMode(true)}
                className={`rounded-lg px-3 py-2.5 text-sm font-black uppercase tracking-wider transition-all ${isRegister
                    ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
                    : 'text-zinc-500 hover:text-[hsl(var(--foreground))]'
                  }`}
              >
                Register
              </button>
            </div>

            {/* ─── LOGIN FORM ─── */}
            {!isRegister && (
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <Field
                  icon={Mail}
                  label="Email address"
                  value={loginEmail}
                  onChange={setLoginEmail}
                  placeholder="you@example.com"
                  type="email"
                  id="login-email"
                />

                <PasswordField
                  label="Password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  show={showLoginPassword}
                  onToggle={() => setShowLoginPassword((p) => !p)}
                  placeholder="Enter your password"
                  id="login-password"
                />

                {errorMessage && <ErrorBox message={errorMessage} />}

                <button
                  id="login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full rounded-xl bg-[hsl(var(--primary))] py-4 text-sm font-black uppercase tracking-wider text-[hsl(var(--primary-foreground))] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Signing in...' : 'Login'}
                </button>

                <p className="text-center text-xs text-zinc-500">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => switchMode(true)} className="font-bold text-[hsl(var(--foreground))] underline underline-offset-2">
                    Register
                  </button>
                </p>
              </form>
            )}

            {/* ─── REGISTER FORM ─── */}
            {isRegister && (
              <form onSubmit={handleRegister} className="space-y-4" noValidate>
                <Field
                  icon={User}
                  label="Full name"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Aarav Sharma"
                  id="register-name"
                />

                <Field
                  icon={Mail}
                  label="Email address"
                  value={registerEmail}
                  onChange={setRegisterEmail}
                  placeholder="you@example.com"
                  type="email"
                  id="register-email"
                />

                <PasswordField
                  label="Password"
                  value={registerPassword}
                  onChange={setRegisterPassword}
                  show={showRegisterPassword}
                  onToggle={() => setShowRegisterPassword((p) => !p)}
                  placeholder="Minimum 6 characters"
                  id="register-password"
                />

                <PasswordField
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((p) => !p)}
                  placeholder="Re-enter your password"
                  id="register-confirm-password"
                />

                {errorMessage && <ErrorBox message={errorMessage} />}

                <button
                  id="register-submit"
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full rounded-xl bg-[hsl(var(--primary))] py-4 text-sm font-black uppercase tracking-wider text-[hsl(var(--primary-foreground))] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>

                <p className="text-center text-xs text-zinc-500">
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode(false)} className="font-bold text-[hsl(var(--foreground))] underline underline-offset-2">
                    Login
                  </button>
                </p>
              </form>
            )}

            <p className="mt-8 text-center text-xs text-zinc-400">
              Test account: <span className="font-bold text-zinc-600 dark:text-zinc-300">customer@vastra.com</span> / password
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

/* ─── Reusable field components ─── */

const Field = ({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  id,
}: {
  icon: typeof User;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  id: string;
}) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-widest text-zinc-500">
      {label}
    </label>
    <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3.5 transition focus-within:border-zinc-500">
      <Icon size={17} className="shrink-0 text-zinc-400" />
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
      />
    </div>
  </div>
);

const PasswordField = ({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  id: string;
}) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-widest text-zinc-500">
      {label}
    </label>
    <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3.5 transition focus-within:border-zinc-500">
      <Lock size={17} className="shrink-0 text-zinc-400" />
      <input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
      />
      <button type="button" onClick={onToggle} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white" aria-label="Toggle password visibility">
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  </div>
);

const ErrorBox = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
    {message}
  </div>
);

export default LoginPage;
