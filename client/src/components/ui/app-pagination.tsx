import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppButton } from './app-button';
import { AppSelect } from './app-select';

export interface AppPaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeSelectPlacement?: 'top' | 'bottom' | 'auto';
  showTotal?: boolean;
}

export const AppPagination: React.FC<AppPaginationProps> = ({
  className,
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  pageSizeSelectPlacement = 'top',
  showTotal = true,
  ...props
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startRecord = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, total);

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:px-4 bg-white font-sans text-xs',
        className,
      )}
      {...props}
    >
      {/* Records Summary */}
      <div className="flex items-center gap-3 text-slate-500 font-sans">
        {showTotal ? (
          <div>
            Hiển thị{' '}
            <span className="font-mono font-bold text-slate-800 tabular-nums">
              {startRecord} - {endRecord}
            </span>{' '}
            trong số{' '}
            <span className="font-mono font-bold text-slate-800 tabular-nums">{total}</span> kết quả
          </div>
        ) : null}

        {pageSizeOptions && onPageSizeChange ? (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-slate-500">Mỗi trang:</span>
            <div className="w-20">
              <AppSelect
                size="sm"
                placement={pageSizeSelectPlacement}
                value={pageSize}
                onChange={e => onPageSizeChange(Number(e.target.value))}
                options={pageSizeOptions.map(size => ({
                  value: size,
                  label: `${size}`,
                }))}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1">
        <AppButton
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Trang trước"
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </AppButton>

        {getPageNumbers().map((item, idx) => {
          if (item === 'ellipsis') {
            return (
              <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 select-none">
                …
              </span>
            );
          }

          const isCurrent = item === currentPage;
          return (
            <AppButton
              key={`page-${item}`}
              type="button"
              variant={isCurrent ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(item)}
              aria-label={`Trang ${item}`}
              className={cn(
                'h-8 w-8 p-0 font-mono text-xs',
                isCurrent && 'pointer-events-none font-bold',
              )}
            >
              {item}
            </AppButton>
          );
        })}

        <AppButton
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Trang kế tiếp"
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </AppButton>
      </div>
    </div>
  );
};

AppPagination.displayName = 'AppPagination';
