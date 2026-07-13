import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center py-10 gap-0 border-t-2 border-black dark:border-white">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center font-black text-sm transition-all cursor-pointer -ml-[2px] first:ml-0 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
      >
        <ChevronLeft size={16} strokeWidth={3} />
      </button>

      {pageNumbers[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center font-black text-sm transition-all cursor-pointer -ml-[2px] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] ${
              currentPage === 1
                ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]'
                : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))]'
            }`}
          >
            1
          </button>
          {pageNumbers[0] > 2 && (
            <span className="w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center font-black text-sm -ml-[2px] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
              ...
            </span>
          )}
        </>
      )}

      {pageNumbers.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center font-black text-sm transition-all cursor-pointer -ml-[2px] ${
            currentPage === pageNum
              ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]'
              : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]'
          }`}
        >
          {pageNum}
        </button>
      ))}

      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center font-black text-sm -ml-[2px] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
              ...
            </span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center font-black text-sm transition-all cursor-pointer -ml-[2px] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] ${
              currentPage === totalPages
                ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]'
                : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))]'
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center font-black text-sm transition-all cursor-pointer -ml-[2px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
      >
        <ChevronRight size={16} strokeWidth={3} />
      </button>
    </div>
  );
};

export default Pagination;
