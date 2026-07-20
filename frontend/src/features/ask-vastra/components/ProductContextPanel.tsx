import React from 'react';
import type { AskVastraRequest, AskVastraResponse } from '../types';
import { Shirt, Info, Sparkles, Lightbulb } from 'lucide-react';

interface Props {
  selections: AskVastraRequest;
  setSelections: React.Dispatch<React.SetStateAction<AskVastraRequest>>;
  data: AskVastraResponse | null;
}

export const ProductContextPanel: React.FC<Props> = ({ selections, setSelections, data }) => {
  const colors = [
    { name: 'Black', hex: '#18181B' },
    { name: 'Navy', hex: '#1E3A8A' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Brown', hex: '#78350F' },
  ];

  return (
    <div className="w-[320px] shrink-0 border-r border-zinc-200 pr-6 flex flex-col h-full overflow-y-auto">
      
      {/* 1. Item Type */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-zinc-900 mb-3">1. SELECT YOUR ITEM TYPE</h3>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => setSelections(s => ({ ...s, category: 'Top Wear' }))}
            className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${
              selections.category === 'Top Wear' 
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700' 
                : 'border-zinc-200 hover:border-zinc-300 text-zinc-500'
            }`}
          >
            <Shirt size={24} className="mb-2" />
            <span className="text-xs font-bold">Top Wear</span>
          </button>
          <button 
            onClick={() => setSelections(s => ({ ...s, category: 'Bottom Wear' }))}
            className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${
              selections.category === 'Bottom Wear' 
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700' 
                : 'border-zinc-200 hover:border-zinc-300 text-zinc-500'
            }`}
          >
            <div className="w-6 h-6 border-2 border-current rounded-sm border-t-0 mb-2 relative">
               <div className="absolute top-0 left-1/2 w-0.5 h-full bg-current transform -translate-x-1/2"></div>
            </div>
            <span className="text-xs font-bold">Bottom Wear</span>
          </button>
        </div>
      </div>

      {/* 2. Item */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-zinc-900 mb-3">2. SELECT ITEM</h3>
        <div className="relative mb-3">
          <select 
            value={selections.type}
            onChange={(e) => setSelections(s => ({ ...s, type: e.target.value }))}
            className="w-full h-11 border border-zinc-200 rounded-lg px-4 text-sm font-medium focus:outline-none focus:border-indigo-500 appearance-none bg-white text-zinc-900"
          >
            <option value="Shirt">Shirt</option>
            <option value="T-Shirt">T-Shirt</option>
            <option value="Jacket">Jacket</option>
            <option value="Sweater">Sweater</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 1.5L6 6L10.5 1.5" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        {/* Mock Product Image */}
        <div className="bg-zinc-50 border border-zinc-100 rounded-xl aspect-[3/4] flex items-center justify-center p-4">
           {/* Placeholder for the black shirt shown in UI */}
           <div 
             className="w-3/4 h-5/6 rounded-lg shadow-sm relative overflow-hidden transition-colors duration-300 border border-zinc-200" 
             style={{ backgroundColor: colors.find(c => c.name === selections.color)?.hex || '#18181B' }}
           >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
           </div>
        </div>
        <div className="flex justify-center gap-1.5 mt-3">
          <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
          <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
          <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
          <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
        </div>
      </div>

      {/* 3. Color */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-zinc-900 mb-3">3. SELECT COLOR</h3>
        <div className="flex gap-3">
          {colors.map((c) => (
            <div key={c.name} className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => setSelections(s => ({ ...s, color: c.name }))}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${selections.color === c.name ? 'border-indigo-600 p-0.5' : 'border-transparent'}`}>
                 <div className="w-full h-full rounded-full border border-zinc-200" style={{ backgroundColor: c.hex }}></div>
              </div>
              <span className={`text-[10px] font-medium ${selections.color === c.name ? 'text-zinc-900 font-bold' : 'text-zinc-500'}`}>{c.name}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center bg-zinc-50 text-zinc-400">
              <span className="text-lg leading-none -mt-1">...</span>
            </div>
            <span className="text-[10px] font-medium text-zinc-500">Other</span>
          </div>
        </div>
      </div>

      {/* Dynamic Content Based on Data */}
      {data && (
        <div className="space-y-4">
          {/* AI Insight */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-2">
              <Sparkles size={16} /> VASTRA AI Insight
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed">
              {data.insight}
            </p>
          </div>

          {/* Style Tip */}
          <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
              <Lightbulb size={16} /> Style Tip
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              {data.styleTip}
            </p>
          </div>

          {/* About This Color */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-700 font-bold text-sm mb-3">
              <Info size={16} /> About This Color
            </div>
            <ul className="space-y-2">
              {data.aboutColor.map((fact, i) => {
                const [title, desc] = fact.split(' - ');
                return (
                  <li key={i} className="flex gap-2 text-xs">
                    <span className="text-zinc-400 mt-1">•</span>
                    <div>
                      <span className="font-semibold text-zinc-700 block">{title}</span>
                      <span className="text-zinc-500">{desc}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};
