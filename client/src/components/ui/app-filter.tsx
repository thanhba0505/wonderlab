import * as React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppInput } from './app-input';
import { AppSelect, type AppSelectOption } from './app-select';
import { AppButton } from './app-button';
import { AppTag } from './app-tag';

export interface AppFilterField {
  id: string;
  label?: string;
  value: string | number;
  placeholder?: string;
  options: AppSelectOption[];
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export interface AppActiveFilter {
  id: string;
  label: string;
  valueLabel: string;
  onRemove: () => void;
}

export interface AppFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: AppFilterField[];
  activeFilters?: AppActiveFilter[];
  onFilter?: () => void;
  filterLabel?: string;
  showFilterButton?: boolean;
  isFiltering?: boolean;
  onReset?: () => void;
  resetLabel?: string;
  showReset?: boolean;
  actions?: React.ReactNode;
  isSearchable?: boolean;
}

export const AppFilter: React.FC<AppFilterProps> = ({
  className,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm dữ liệu...',
  filters = [],
  activeFilters = [],
  onFilter,
  filterLabel = 'Lọc',
  showFilterButton = true,
  isFiltering = false,
  onReset,
  resetLabel = 'Đặt lại',
  showReset = true,
  actions,
  isSearchable = true,
  ...props
}) => {
  const hasActiveFilters = activeFilters.length > 0;
  const hasSearch = Boolean(searchValue.trim());
  const canReset = hasActiveFilters || hasSearch;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-slate-300/85 bg-white p-3.5 sm:p-4 shadow-2xs font-sans',
        className,
      )}
      {...props}
    >
      {/* Primary Toolbar: Search + Select Dropdowns + Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left Side: Search + Dropdown Filters */}
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
          {/* Search Box */}
          {isSearchable && onSearchChange ? (
            <div className="w-full sm:w-64 sm:min-w-[220px]">
              <AppInput
                size="sm"
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && onFilter) {
                    e.preventDefault();
                    onFilter();
                  }
                }}
                placeholder={searchPlaceholder}
                leftIcon={<Search className="h-3.5 w-3.5" />}
                clearable
                onClear={() => onSearchChange('')}
              />
            </div>
          ) : null}

          {/* Dynamic Select Filters */}
          {filters.map(filter => (
            <div key={filter.id} className={cn('w-full sm:w-44 shrink-0', filter.className)}>
              <AppSelect
                size="sm"
                value={filter.value}
                onChange={e => filter.onChange(e.target.value)}
                placeholder={filter.placeholder}
                options={filter.options}
                disabled={filter.disabled}
              />
            </div>
          ))}

          {/* Filter Button */}
          {showFilterButton && onFilter ? (
            <AppButton
              type="button"
              variant="primary"
              size="sm"
              onClick={onFilter}
              isLoading={isFiltering}
              disabled={isFiltering}
              className="text-xs font-semibold gap-1.5 shrink-0"
              leftIcon={<Filter className="h-3.5 w-3.5" />}
            >
              {filterLabel}
            </AppButton>
          ) : null}

          {/* Reset Filters Button */}
          {showReset && onReset ? (
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canReset}
              onClick={onReset}
              className="text-xs text-slate-600 hover:text-slate-900 gap-1.5 shrink-0"
              leftIcon={<RotateCcw className="h-3 w-3" />}
            >
              {resetLabel}
            </AppButton>
          ) : null}
        </div>

        {/* Right Side: Additional Action Buttons */}
        {actions ? (
          <div className="flex items-center gap-2 justify-end shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
            {actions}
          </div>
        ) : null}
      </div>

      {/* Active Filter Tags Summary */}
      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-mono uppercase tracking-wider shrink-0 mr-1">
            Đang lọc:
          </span>
          {activeFilters.map(item => (
            <AppTag
              key={item.id}
              variant="blue"
              size="sm"
              removable
              onRemove={item.onRemove}
              className="max-w-xs"
            >
              <span className="text-slate-600 font-sans">{item.label}:</span>{' '}
              <span className="font-semibold">{item.valueLabel}</span>
            </AppTag>
          ))}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium ml-1 transition-colors"
            >
              Xoá tất cả
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

AppFilter.displayName = 'AppFilter';
