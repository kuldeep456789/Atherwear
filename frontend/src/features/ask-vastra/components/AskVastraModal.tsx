import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { AskVastraRequest, AskVastraResponse } from '../types';
import { getStylingRecommendations } from '../services/askVastraApi';
import { ProductContextPanel } from './ProductContextPanel';
import { ColorMatchResults } from './ColorMatchResults';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: Partial<AskVastraRequest>;
}

export const AskVastraModal: React.FC<Props> = ({ isOpen, onClose, initialContext }) => {
  const [selections, setSelections] = useState<AskVastraRequest>({
    gender: initialContext?.gender || 'Men',
    category: initialContext?.category || 'Top Wear',
    type: initialContext?.type || 'Shirt',
    color: initialContext?.color || 'Black',
  });

  const [data, setData] = useState<AskVastraResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true;
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const response = await getStylingRecommendations(selections);
        if (isMounted) setData(response);
      } catch (error) {
        console.error("Failed to fetch Ask VASTRA data", error);
        // Handle error state gracefully in a real app
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRecommendations();
    return () => { isMounted = false; };
  }, [selections, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-100 shrink-0">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black text-indigo-700 tracking-tight">
                  ASK VASTRA
                </h2>
                <p className="text-sm font-medium text-zinc-500 mt-1">Your Personal Color Styling Assistant</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden p-8 gap-8">
              <ProductContextPanel 
                selections={selections} 
                setSelections={setSelections} 
                data={data}
              />
              
              <div className="flex-1 flex flex-col overflow-hidden">
                {(data || isLoading) ? (
                  <ColorMatchResults 
                    data={data as AskVastraResponse}
                    isLoading={isLoading}
                    selectedColor={selections.color}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                    <p className="font-medium text-lg">Oops! Something went wrong.</p>
                    <p className="text-sm mt-2 text-zinc-400 max-w-md text-center">
                      We couldn't connect to the AI styling service. Please restart your backend server if you just added this feature.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
