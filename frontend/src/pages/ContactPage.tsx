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
    <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))] uppercase pt-[112px] sm:pt-[116px] lg:pt-[124px]">
      {/* Breadcrumbs */}
      <div className="w-full border-b-2 border-black dark:border-white px-6 sm:px-10 py-4 flex items-center text-xs font-bold tracking-widest text-zinc-500">
        <Link to="/" className="hover:text-[hsl(var(--foreground))] transition-colors">HOME</Link>
        <ChevronRight size={10} strokeWidth={3} className="mx-2" />
        <span className="text-[hsl(var(--foreground))]">CONTACT</span>
      </div>

      {/* Header */}
      <div className="w-full border-b-2 border-black dark:border-white">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <p className="text-xs sm:text-sm font-black tracking-[0.25em] text-zinc-500 mb-3">GET IN TOUCH</p>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight text-[hsl(var(--foreground))] leading-none">
            CONTACT US
          </h1>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row">
        {/* Info */}
        <div className="w-full lg:w-[40%] border-b-2 lg:border-b-0 lg:border-r-2 border-black dark:border-white p-8 sm:p-12 lg:p-14">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-8">GET IN TOUCH</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 flex items-center justify-center border-2 border-black dark:border-white shrink-0">
                <Mail size={18} strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-black tracking-widest mb-1">EMAIL</p>
                <p className="text-sm text-zinc-500 font-medium normal-case">prajapatikuldeep3456@gmail.com</p>
                <p className="text-sm text-zinc-500 font-medium normal-case">yogen12@gmail.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 flex items-center justify-center border-2 border-black dark:border-white shrink-0">
                <Phone size={18} strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-black tracking-widest mb-1">PHONE</p>
                <p className="text-sm text-zinc-500 font-medium">+91 8235494985</p>
                <p className="text-sm text-zinc-500 font-medium">Mon–Sat, 9AM–8PM IST</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 flex items-center justify-center border-2 border-black dark:border-white shrink-0">
                <MapPin size={18} strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-black tracking-widest mb-1">ADDRESS</p>
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
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-8">SEND US A MESSAGE</h2>
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
                  className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-sm font-bold tracking-widest focus:outline-none placeholder:text-zinc-400"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="YOUR EMAIL"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-sm font-bold tracking-widest focus:outline-none placeholder:text-zinc-400"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="SUBJECT"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-sm font-bold tracking-widest focus:outline-none placeholder:text-zinc-400"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="YOUR MESSAGE"
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-sm font-bold tracking-widest focus:outline-none placeholder:text-zinc-400 resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-sm font-black tracking-widest border-2 border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={16} strokeWidth={2.5} />
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
