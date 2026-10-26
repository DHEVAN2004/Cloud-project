import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Eye, EyeOff, Lock, Mail, ShieldCheck, Server, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const featureList = [
  { icon: BarChart3, title: 'Real-time Monitoring', text: 'Track CPU, RAM, storage and network usage' },
  { icon: Server, title: 'Easy Management', text: 'Start, stop, restart and monitor VMs' },
  { icon: ShieldCheck, title: 'Secure & Reliable', text: 'Built for performance and security' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isRegistering, setIsRegistering] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '', general: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (isRegistering && !form.username.trim()) nextErrors.username = 'Username is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (!form.password.trim()) nextErrors.password = 'Password is required';
    if (isRegistering && form.password.length < 8) nextErrors.password = 'Password must contain at least 8 characters';

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      if (isRegistering) {
        await register({ username: form.username.trim(), email: form.email.trim(), password: form.password });
      } else {
        await login(form.email.trim(), form.password);
      }
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: error.message || 'Unable to authenticate. Check your credentials and try again.' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#edf2f7] p-6">
      <div className="flex w-full max-w-[1380px] overflow-hidden rounded-[28px] bg-white shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
        <aside className="hidden w-[34%] min-w-[360px] flex-col justify-between bg-gradient-to-b from-[#031d38] via-[#071d39] to-[#0d2b52] p-8 text-white md:flex">
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0d2f5e] ring-1 ring-white/10">
                <Cloud className="h-7 w-7 text-sky-300" />
              </div>
              <div>
                <div className="text-[2rem] font-extrabold leading-none tracking-tight">CloudVM</div>
                <div className="mt-1 text-sm font-medium text-sky-200/80">Manager</div>
              </div>
            </div>

            <div className="mb-8 mt-8 space-y-1 text-[2rem] font-semibold leading-tight tracking-tight text-white">
              <div>Your Virtual Machines,</div>
              <div>Under Control</div>
            </div>

            <p className="max-w-xs text-base leading-relaxed text-sky-100/80">
              Securely monitor and manage your cloud-based virtual machines from anywhere, anytime.
            </p>

            <div className="mt-12 space-y-5">
              {featureList.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f3c71] text-sky-200">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">{title}</div>
                    <div className="text-sm text-sky-100/70">{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-end justify-center">
            <div className="relative h-44 w-72">
              <div className="absolute inset-x-8 bottom-0 h-24 rounded-t-[24px] bg-[#0d2f5e] shadow-[0_0_18px_rgba(47,119,215,0.5)]" />
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="absolute bottom-0 w-14 rounded-t-xl bg-[#143f72] shadow-[0_0_12px_rgba(47,119,215,0.4)]"
                  style={{ left: `${index * 72 + 28}px`, height: `${110 + index * 18}px` }}
                />
              ))}
              <div className="absolute left-1/2 top-8 h-20 w-20 -translate-x-1/2 rounded-full bg-[#4ec8ff] shadow-[0_0_30px_rgba(78,200,255,0.8)]" />
              <div className="absolute left-1/2 top-20 h-24 w-28 -translate-x-1/2 rounded-[28px] border border-sky-300/40 bg-white/5 backdrop-blur-sm" />
            </div>
          </div>
        </aside>

        <div className="flex flex-1 items-center justify-center bg-[#f5f7fb] px-4 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-[540px]">
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight text-slate-800">{isRegistering ? 'Create Account' : 'Welcome Back!'}</h1>
              <p className="mt-2 text-base text-slate-500">{isRegistering ? 'Register to manage your virtual machines' : 'Login to your account to continue'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegistering ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Username</label>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                    <Mail size={18} className="text-slate-400" />
                    <input
                      value={form.username}
                      onChange={(event) => updateField('username', event.target.value)}
                      placeholder="Your username"
                      autoComplete="username"
                      className="w-full border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  {errors.username ? <p className="mt-2 text-sm text-red-500">{errors.username}</p> : null}
                </div>
              ) : null}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                {errors.email ? <p className="mt-2 text-sm text-red-500">{errors.email}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Password</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                  <Lock size={18} className="text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    placeholder="Password"
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    className="w-full border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password ? <p className="mt-2 text-sm text-red-500">{errors.password}</p> : null}
              </div>

              {!isRegistering ? <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">Session-only sign-in</span>
                <button type="button" className="font-medium text-sky-600 hover:text-sky-700">
                  Forgot Password?
                </button>
              </div> : null}

              {errors.general ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{errors.general}</p> : null}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d8df3] px-5 py-3.5 text-lg font-semibold text-white shadow-[0_10px_18px_rgba(20,104,224,0.35)] transition hover:bg-[#0b7fe8]"
              >
                {loading ? 'Please wait…' : isRegistering ? 'Create Account' : 'Login'} <ArrowRight size={18} />
              </button>

              {!isRegistering ? <div className="my-3 flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                <span>OR</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div> : null}

              {!isRegistering ? <button type="button" className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-base font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">G</span>
                Continue with Google
              </button> : null}

              <div className="mt-6 text-center text-sm text-slate-500">
                {isRegistering ? 'Already have an account? ' : 'Don’t have an account? '}
                <button type="button" onClick={() => { setIsRegistering((current) => !current); setErrors({}); }} className="font-semibold text-sky-600 hover:text-sky-700">
                  {isRegistering ? 'Login' : 'Sign Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
