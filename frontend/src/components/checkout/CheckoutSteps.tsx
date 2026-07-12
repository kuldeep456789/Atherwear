import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

interface CheckoutStepsProps {
  step1?: boolean;
  step2?: boolean;
  step3?: boolean;
}

const steps = [
  { num: 1, label: 'Shipping', path: '/shipping', key: 'step1' as const },
  { num: 2, label: 'Payment', path: '/payment', key: 'step2' as const },
  { num: 3, label: 'Review', path: '/placeorder', key: 'step3' as const },
];

const CheckoutSteps = ({ step1, step2, step3 }: CheckoutStepsProps) => {
  const active = { step1, step2, step3 };

  return (
    <div className="w-full max-w-sm mx-auto mb-10">
      <div className="flex items-center">
        {steps.map((s, idx) => {
          const isActive = active[s.key];
          const isPast =
            (s.key === 'step1' && (step2 || step3)) ||
            (s.key === 'step2' && step3);

          return (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                {/* Circle */}
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-black border-2 transition-all duration-300 ${
                    isPast
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : isActive
                      ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black shadow-[0_0_16px_rgba(0,0,0,0.25)] dark:shadow-[0_0_16px_rgba(255,255,255,0.15)] scale-110'
                      : 'bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600'
                  }`}
                >
                  {isPast && !isActive ? <Check size={14} strokeWidth={3} /> : s.num}
                </div>

                {/* Label */}
                {isActive ? (
                  <Link
                    to={s.path}
                    className="text-[9px] font-black uppercase tracking-[0.15em] text-black dark:text-white"
                  >
                    {s.label}
                  </Link>
                ) : (
                  <span
                    className={`text-[9px] font-bold uppercase tracking-[0.15em] ${
                      isPast ? 'text-emerald-500' : 'text-zinc-400 dark:text-zinc-600'
                    }`}
                  >
                    {s.label}
                  </span>
                )}
              </div>

              {/* Connector bar */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-px mx-3 relative overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className={`absolute inset-y-0 left-0 bg-black dark:bg-white transition-all duration-500 ${
                      isPast ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutSteps;
