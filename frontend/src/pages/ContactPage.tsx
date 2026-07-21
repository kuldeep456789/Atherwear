import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Mail, MapPin, Phone, Send, Check, User, Tag, PenLine, Clock } from 'lucide-react';

const ContactPage = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) throw new Error('Failed to send message');
      
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))] uppercase">
      {/* Breadcrumbs */}
      <div className="w-full border-b-2 border-black dark:border-white px-6 sm:px-10 py-4 flex items-center text-xs font-bold tracking-widest text-zinc-500">
        <Link to="/" className="hover:text-[hsl(var(--foreground))] transition-colors">HOME</Link>
        <ChevronRight size={10} strokeWidth={3} className="mx-2" />
        <span className="text-[hsl(var(--foreground))]">CONTACT</span>
      </div>



      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-12 sm:py-20 flex flex-col lg:flex-row lg:gap-16 items-start">
        {/* Info */}
        <div className="w-full lg:w-[45%] border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-8 sm:p-10 lg:p-12 shadow-sm bg-white dark:bg-zinc-900/20">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-8 text-[#111111] dark:text-white">CONTACT INFORMATION</h2>
          <div className="flex flex-col">
            {/* Email */}
            <div className="flex items-center py-6 border-b border-zinc-100 dark:border-zinc-800/50">
              <span className="w-[64px] h-[64px] flex items-center justify-center rounded-2xl bg-[#F9F6EE] dark:bg-[#F9F6EE]/5 shrink-0 border border-black/5 dark:border-white/5">
                <Mail size={24} className="text-[#b4904b]" strokeWidth={1.5} />
              </span>
              <div className="ml-5">
                <p className="text-[13px] font-bold tracking-widest text-zinc-900 dark:text-zinc-100 mb-1">EMAIL</p>
                <p className="text-[15px] text-zinc-600 dark:text-zinc-400 font-medium normal-case">support@vastra.in</p>
                <p className="text-[14px] text-zinc-500 normal-case mt-0.5">Response within 24 hours</p>
              </div>
            </div>
            {/* Phone */}
            <div className="flex items-center py-6 border-b border-zinc-100 dark:border-zinc-800/50">
              <span className="w-[64px] h-[64px] flex items-center justify-center rounded-2xl bg-[#F9F6EE] dark:bg-[#F9F6EE]/5 shrink-0 border border-black/5 dark:border-white/5">
                <Phone size={24} className="text-[#b4904b]" strokeWidth={1.5} />
              </span>
              <div className="ml-5">
                <p className="text-[13px] font-bold tracking-widest text-zinc-900 dark:text-zinc-100 mb-1">PHONE</p>
                <p className="text-[15px] text-zinc-600 dark:text-zinc-400 font-medium normal-case">+91 81234 56789</p>
                <p className="text-[14px] text-zinc-500 normal-case mt-0.5">Mon - Sat, 9:00 AM - 8:00 PM</p>
              </div>
            </div>
            {/* Address */}
            <div className="flex items-center py-6 border-b border-zinc-100 dark:border-zinc-800/50">
              <span className="w-[64px] h-[64px] flex items-center justify-center rounded-2xl bg-[#F9F6EE] dark:bg-[#F9F6EE]/5 shrink-0 border border-black/5 dark:border-white/5">
                <MapPin size={24} className="text-[#b4904b]" strokeWidth={1.5} />
              </span>
              <div className="ml-5">
                <p className="text-[13px] font-bold tracking-widest text-zinc-900 dark:text-zinc-100 mb-1">ADDRESS</p>
                <p className="text-[15px] text-zinc-600 dark:text-zinc-400 font-medium normal-case">VASTRA HQ</p>
                <p className="text-[14px] text-zinc-500 normal-case mt-0.5">HSR Layout, Bangalore - 560102<br/>Karnataka, India</p>
              </div>
            </div>
            {/* Working Hours */}
            <div className="flex items-center pt-6">
              <span className="w-[64px] h-[64px] flex items-center justify-center rounded-2xl bg-[#F9F6EE] dark:bg-[#F9F6EE]/5 shrink-0 border border-black/5 dark:border-white/5">
                <Clock size={24} className="text-[#b4904b]" strokeWidth={1.5} />
              </span>
              <div className="ml-5">
                <p className="text-[13px] font-bold tracking-widest text-zinc-900 dark:text-zinc-100 mb-1">WORKING HOURS</p>
                <p className="text-[15px] text-zinc-600 dark:text-zinc-400 font-medium normal-case">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                <p className="text-[14px] text-zinc-500 normal-case mt-0.5">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="w-full lg:w-[55%] mt-8 lg:mt-0 p-8 sm:p-10 lg:p-12 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl shadow-sm bg-white dark:bg-zinc-900/20">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-8 text-[#111111] dark:text-white">SEND US A MESSAGE</h2>
          {sent ? (
            <div className="border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20 p-8 text-center rounded-xl">
              <Check size={40} strokeWidth={2.5} className="mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-black tracking-widest text-green-700 dark:text-green-400 mb-2">MESSAGE SENT!</h3>
              <p className="text-sm text-zinc-500 normal-case">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} strokeWidth={1.5} />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900/50 text-[15px] font-medium focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 placeholder:text-zinc-400 normal-case transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} strokeWidth={1.5} />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900/50 text-[15px] font-medium focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 placeholder:text-zinc-400 normal-case transition-colors"
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900/50 text-[15px] font-medium focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 placeholder:text-zinc-400 normal-case transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <PenLine className="absolute left-4 top-4 text-zinc-400" size={18} strokeWidth={1.5} />
                <textarea
                  placeholder="Message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900/50 text-[15px] font-medium focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 placeholder:text-zinc-400 normal-case resize-none transition-colors"
                  required
                ></textarea>
              </div>
              {error && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-3 rounded-lg text-center normal-case">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] py-4 rounded-lg text-[14px] font-bold tracking-[0.1em] hover:bg-black/80 dark:hover:bg-white/80 transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 dark:border-[#111111]/20 border-t-white dark:border-t-[#111111] rounded-full animate-spin" />
                    SENDING...
                  </>
                ) : (
                  <>
                    <Send size={16} strokeWidth={1.5} />
                    SEND MESSAGE
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
