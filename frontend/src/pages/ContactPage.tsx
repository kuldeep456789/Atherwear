import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Mail, MapPin, Phone, Send, Check } from 'lucide-react';

const ContactPage = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))] uppercase">
      {/* Breadcrumbs */}
      <div className="w-full border-b-2 border-black dark:border-white px-6 sm:px-10 py-4 flex items-center text-xs font-bold tracking-widest text-zinc-500">
        <Link to="/" className="hover:text-[hsl(var(--foreground))] transition-colors">HOME</Link>
        <ChevronRight size={10} strokeWidth={3} className="mx-2" />
        <span className="text-[hsl(var(--foreground))]">CONTACT</span>
      </div>

      {/* Header */}
      <div className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-10 py-10 sm:py-12">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-zinc-500 mb-2">GET IN TOUCH</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-[hsl(var(--foreground))] leading-none">
            CONTACT US
          </h1>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row">
        {/* Info */}
        <div className="w-full lg:w-[40%] border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 lg:p-14">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-8">CONTACT INFORMATION</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0">
                <Mail size={18} strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-[13px] font-bold tracking-widest text-zinc-800 dark:text-zinc-200 mb-1">EMAIL</p>
                <p className="text-sm text-zinc-500 font-medium normal-case">prajapatikuldeep3456@gmail.com</p>
                <p className="text-sm text-zinc-500 font-medium normal-case">yogen12@gmail.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0">
                <Phone size={18} strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-[13px] font-bold tracking-widest text-zinc-800 dark:text-zinc-200 mb-1">PHONE</p>
                <p className="text-sm text-zinc-500 font-medium">+91 8235494985</p>
                <p className="text-sm text-zinc-500 font-medium">Mon–Sat, 9AM–8PM IST</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0">
                <MapPin size={18} strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-[13px] font-bold tracking-widest text-zinc-800 dark:text-zinc-200 mb-1">ADDRESS</p>
                <p className="text-sm text-zinc-500 font-medium normal-case">
                  VASTRA HQ<br />
                  Banglore, Karnatak 560052<br />
                  India
                </p>
              </div>
            </div>
          </div>

          {/* <div className="mt-10 pt-8 border-t-2 border-black dark:border-white">
            
          </div> */}
        </div>

        {/* Form */}
        <div className="w-full lg:w-[60%] p-8 sm:p-12 lg:p-14">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-8">SEND US A MESSAGE</h2>
          {sent ? (
            <div className="border-2 border-green-600 bg-green-50 dark:bg-green-950/30 p-8 text-center">
              <Check size={40} strokeWidth={2.5} className="mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-black tracking-widest text-green-700 dark:text-green-400 mb-2">MESSAGE SENT!</h3>
              <p className="text-sm text-zinc-500 normal-case">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="text"
                  placeholder="YOUR NAME"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-4 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm font-medium focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 placeholder:text-zinc-400"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="YOUR EMAIL"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-4 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm font-medium focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 placeholder:text-zinc-400"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="SUBJECT"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 placeholder:text-zinc-400"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="YOUR MESSAGE"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-4 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 placeholder:text-zinc-400 resize-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] py-4 rounded-xl text-[13px] font-bold tracking-widest hover:opacity-90 transition-opacity"
              >
                <Send size={16} strokeWidth={2} />
                SEND MESSAGE
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
