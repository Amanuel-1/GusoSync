"use client"

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SmartPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  showFirstLast?: boolean;
  showInfo?: boolean;
}

export default function SmartPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  maxVisiblePages = 5,
  showFirstLast = true,
  showInfo = true,
}: SmartPaginationProps) {
  if (totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const renderPageButtons = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Show first page if not in range
    if (showFirstLast && startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="px-3 py-2 border border-[#d9d9d9] text-[#7d7d7d] hover:bg-gray-50 rounded-md transition-colors"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2 text-[#7d7d7d]">
            ...
          </span>
        );
      }
    }

    // Show page range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-2 border rounded-md transition-colors ${
            currentPage === i
              ? "bg-[#0097fb] text-white border-[#0097fb]"
              : "border-[#d9d9d9] text-[#7d7d7d] hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    // Show last page if not in range
    if (showFirstLast && endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2 text-[#7d7d7d]">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-2 border border-[#d9d9d9] text-[#7d7d7d] hover:bg-gray-50 rounded-md transition-colors"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
      {showInfo && (
        <div className="text-sm text-[#7d7d7d]">
          Showing {startIndex + 1} to {endIndex} of {totalItems} results
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {/* First page button */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 border border-[#d9d9d9] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            title="First page"
          >
            <ChevronLeft size={16} />
            <ChevronLeft size={16} className="-ml-2" />
          </button>
        )}
        
        {/* Previous page button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-[#d9d9d9] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page buttons */}
        {renderPageButtons()}

        {/* Next page button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-[#d9d9d9] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>

        {/* Last page button */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 border border-[#d9d9d9] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            title="Last page"
          >
            <ChevronRight size={16} />
            <ChevronRight size={16} className="-ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}
