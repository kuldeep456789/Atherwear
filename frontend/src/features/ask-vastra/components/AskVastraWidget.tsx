import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AskVastraModal } from './AskVastraModal';

export const AskVastraWidget: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-end justify-end">
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="absolute right-[72px] bottom-2 bg-white px-4 py-2 rounded-2xl shadow-lg border border-zinc-100 text-sm font-bold text-indigo-700 whitespace-nowrap"
            >
              Ask VASTRA ✨
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Sparkles size={24} className="fill-white" />
        </button>
      </div>

      <AskVastraModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
