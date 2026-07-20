import React from 'react';
import type { AskVastraResponse } from '../types';
import { Star, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

interface Props {
  data: AskVastraResponse;
  isLoading: boolean;
  selectedColor?: string;
}

export const ColorMatchResults: React.FC<Props> = ({ data, isLoading, selectedColor = 'Black' }) => {
  const colorMap: Record<string, string> = {
    'Black': '#18181B',
    'Navy': '#1E3A8A',
    'White': '#FFFFFF',
    'Brown': '#78350F',
  };
  const selectedHex = colorMap[selectedColor] || '#18181B';
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-zinc-500 font-medium">Analyzing color combinations...</p>
      </div>
    );
  }

  const renderStars = (score: number) => {
    const filled = Math.round(score / 20);
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={16} className={i <= filled ? "fill-indigo-600 text-indigo-600" : "fill-zinc-200 text-zinc-200"} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto pr-2 pb-8">


      {/* Best Combinations */}
      <div className="mb-6">
        <div className="flex items-center gap-2 font-bold text-green-600 mb-3 text-sm">
          <TrendingUp size={16} />
          BEST COLOR COMBINATIONS
        </div>
        
        <div className="space-y-3">
          {data.bestMatches.map((match, i) => (
            <div key={i} className="border border-zinc-200 rounded-2xl p-4 flex gap-4 bg-white relative">
              <div className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-orange-400 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
                {i + 1}
              </div>
              
              {/* Image mockup block */}
              <div className="flex items-center gap-2">
                <div className="w-16 h-20 rounded-lg shrink-0 border border-zinc-200" style={{ backgroundColor: selectedHex }} />
                <span className="text-lg font-light text-zinc-400">+</span>
                <div className="w-12 h-20 rounded-lg shrink-0 border border-zinc-100" style={{ backgroundColor: match.hex || '#E5E7EB' }} />
              </div>
              
              <div className="flex-1 pl-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-zinc-200" style={{ backgroundColor: match.hex }} />
                    <span className="font-bold text-zinc-800">{match.color}</span>
                  </div>
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                    Excellent Match
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(match.score)}
                  <span className="font-bold text-zinc-700 text-sm">{match.score}%</span>
                </div>
                
                <p className="text-xs text-zinc-600 leading-relaxed">{match.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Good Matches */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">Other Good Matches</h3>
        <div className="grid grid-cols-4 gap-3">
          {data.otherGoodMatches.map((match, i) => (
            <div key={i} className="border border-zinc-200 rounded-xl p-2.5 text-center bg-white hover:border-zinc-300 transition-colors">
               <div className="flex items-center justify-center gap-1 mb-2">
                <div className="w-8 h-10 rounded-md shrink-0 border border-zinc-200" style={{ backgroundColor: selectedHex }} />
                <span className="text-xs font-light text-zinc-400">+</span>
                <div className="w-6 h-10 rounded-md shrink-0 border border-zinc-100" style={{ backgroundColor: match.hex || '#E5E7EB' }} />
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className="w-2.5 h-2.5 rounded-full border border-zinc-200" style={{ backgroundColor: match.hex }} />
                <span className="text-xs font-bold text-zinc-800">{match.color}</span>
              </div>
              <div className="flex items-center justify-center gap-1 mb-1.5">
                <span className="font-medium">AI Match Confidence</span>
                <Star size={10} className="fill-indigo-600 text-indigo-600" />
                <Star size={10} className="fill-indigo-600 text-indigo-600" />
                <Star size={10} className="fill-indigo-600 text-indigo-600" />
                <span className="text-[10px] font-bold text-zinc-700">{match.score}%</span>
              </div>
              <p className="text-[9px] text-zinc-500 leading-tight">{match.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Less Recommended & Best Suited For */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 font-bold text-red-500 mb-3 text-xs uppercase tracking-wider">
            <AlertTriangle size={14} />
            Colors Less Recommended
          </div>
          <div className="space-y-2">
             {data.lessRecommended.map((match, i) => (
                <div key={i} className="flex gap-3 items-center border border-zinc-100 bg-red-50/30 rounded-xl p-2.5">
                  <div className="w-6 h-10 rounded-md border border-zinc-100 shrink-0" style={{ backgroundColor: match.hex }} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                       <span className="text-xs font-bold text-zinc-800">{match.color}</span>
                       <span className="text-xs font-bold text-red-500">{match.score}%</span>
                    </div>
                    <p className="text-[9px] text-zinc-500 leading-tight">{match.reason}</p>
                  </div>
                </div>
             ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">Best Suited For</h3>
          <div className="flex flex-wrap gap-2">
            {data.bestSuitedFor.map((occasion, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg">
                <CheckCircle2 size={12} /> {occasion}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer tip */}
      <div className="mt-6 bg-indigo-50/50 rounded-lg p-3 text-center border border-indigo-100 flex items-center justify-center gap-2 text-xs font-medium text-indigo-800">
        Remember: Confidence is the best style. Wear what makes you feel great!
      </div>
    </div>
  );
};
