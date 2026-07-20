import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ChevronRight, Search } from 'lucide-react';

const faqData = [
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Visa, Mastercard, American Express, UPI, and PayPal.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Standard shipping takes 5-8 business days within India. Express shipping (2-3 days) is available at checkout. International orders typically take 7-14 business days.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer free returns within 15 days of delivery. Items must be unworn with tags attached. Refunds are processed within 5-7 business days after we receive the return.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order ships, you will receive a tracking link via email and SMS. You can also track your order anytime from your Account dashboard.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes! We ship to over 40 countries worldwide. International shipping rates and delivery times vary by destination and are calculated at checkout.',
  },
  {
    q: 'How do I find my size?',
    a: 'Each product page has a detailed size guide with measurements in inches and centimeters. If you are between sizes, we recommend sizing up for an oversized fit.',
  },
  {
    q: 'Can I cancel or modify my order?',
    a: 'Orders can be cancelled within 2 hours of placement, provided they have not been shipped. Contact our support team immediately for assistance.',
  },
  {
    q: 'Are your products authentic?',
    a: 'Absolutely. Every product on VASTRA is sourced directly from verified manufacturers. We guarantee 100% authentic quality.',
  },
];

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = faqData.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))] uppercase">
      {/* Breadcrumbs */}
      <div className="w-full border-b-2 border-black dark:border-white px-6 sm:px-10 py-4 flex items-center text-xs font-bold tracking-widest text-zinc-500">
        <Link to="/" className="hover:text-[hsl(var(--foreground))] transition-colors">HOME</Link>
        <ChevronRight size={10} strokeWidth={3} className="mx-2" />
        <span className="text-[hsl(var(--foreground))]">FAQ</span>
      </div>

      {/* Header */}
      <div className="w-full border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-10 py-10">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-zinc-500 mb-2">HAVE QUESTIONS?</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#111111] dark:text-white leading-none">
            FAQ
          </h1>
        </div>
      </div>

      {/* Search */}
      <div className="w-full border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12">
          <div className="flex border border-[#111111] dark:border-white bg-white dark:bg-zinc-900">
            <input
              type="text"
              placeholder="SEARCH FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-transparent text-[11px] font-bold tracking-[0.15em] text-[#111111] dark:text-white focus:outline-none placeholder:text-zinc-400"
            />
            <span className="flex items-center justify-center w-12 border-l border-[#111111] dark:border-white text-[#111111] dark:text-white">
              <Search size={16} strokeWidth={2} />
            </span>
          </div>
        </div>
      </div>

      {/* FAQ items */}
      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl block mb-4 text-zinc-300">?</span>
            <h3 className="text-xl font-bold tracking-tight mb-2 text-[#111111] dark:text-white normal-case">No Results Found</h3>
            <p className="text-[14px] text-zinc-500 normal-case">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-0">
            {filtered.map((item, index) => (
              <div key={index} className="border-b border-[#111111] dark:border-white">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
                >
                  <span className="text-[13px] font-extrabold tracking-wide text-[#111111] dark:text-white pr-4 group-hover:text-zinc-500 transition-colors normal-case">
                    {item.q}
                  </span>
                  <ChevronDown 
                    size={16} 
                    strokeWidth={2} 
                    className={`shrink-0 text-[#111111] dark:text-white transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`} 
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                  }`}
                >
                  <p className="text-[14px] text-zinc-600 dark:text-zinc-400 normal-case tracking-normal leading-relaxed pr-8">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};

export default FaqPage;
