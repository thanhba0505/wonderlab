import * as React from 'react';
import { cn } from '@/lib/utils';
import { AppFilter, type AppFilterField, type AppActiveFilter } from './app-filter';
import { AppTable, type AppTableColumn } from './app-table';
import { AppPagination, type AppPaginationProps } from './app-pagination';

export interface AppTableFilterHeaderProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export interface AppTableFilterProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  // Header Props
  header?: AppTableFilterHeaderProps;

  // Filter Props
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  isSearchable?: boolean;
  filters?: AppFilterField[];
  activeFilters?: AppActiveFilter[];
  onReset?: () => void;
  resetLabel?: string;
  showReset?: boolean;
  filterActions?: React.ReactNode;

  // Table Props
  columns: AppTableColumn<T>[];
  data: T[];
  rowKey?: (item: T, index: number) => string | number;
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: React.ReactNode;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  onRowClick?: (item: T, index: number) => void;
  selectable?: boolean;
  selectedKeys?: Array<string | number>;
  onSelectChange?: (selectedKeys: Array<string | number>) => void;
  tableClassName?: string;

  // Pagination Props
  pagination?: Omit<AppPaginationProps, 'className'>;
  clientSidePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
}

export function AppTableFilter<T>({
  className,
  header,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  isSearchable = true,
  filters = [],
  activeFilters = [],
  onReset,
  resetLabel,
  showReset = true,
  filterActions,
  columns,
  data,
  rowKey,
  isLoading = false,
  loadingMessage,
  emptyMessage,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  selectable,
  selectedKeys,
  onSelectChange,
  tableClassName,
  pagination,
  clientSidePagination = false,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  ...props
}: AppTableFilterProps<T>) {
  // Client-side pagination state if enabled
  const [internalPage, setInternalPage] = React.useState<number>(1);
  const [internalPageSize, setInternalPageSize] = React.useState<number>(pageSize);

  // Reset internal page if data length changes
  React.useEffect(() => {
    if (clientSidePagination) {
      setInternalPage(1);
    }
  }, [clientSidePagination, data.length, searchValue]);

  // Compute table data based on client-side pagination
  const displayedData = React.useMemo(() => {
    if (!clientSidePagination) return data;
    const start = (internalPage - 1) * internalPageSize;
    return data.slice(start, start + internalPageSize);
  }, [clientSidePagination, data, internalPage, internalPageSize]);

  const hasFilterSection =
    (isSearchable && Boolean(onSearchChange)) ||
    filters.length > 0 ||
    activeFilters.length > 0 ||
    Boolean(filterActions);

  const paginationComponent = pagination ? (
    <AppPagination {...pagination} />
  ) : clientSidePagination && data.length > 0 ? (
    <AppPagination
      page={internalPage}
      pageSize={internalPageSize}
      total={data.length}
      onPageChange={setInternalPage}
      pageSizeOptions={pageSizeOptions}
      onPageSizeChange={setInternalPageSize}
    />
  ) : null;

  return (
    <div className={cn('flex flex-col gap-4 font-sans', className)} {...props}>
      {/* Optional Top Header Banner */}
      {header && (header.title || header.badge || header.actions) ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-300/85 shadow-2xs">
          <div>
            {header.badge ? <div className="mb-1">{header.badge}</div> : null}
            {header.title ? (
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
                {header.title}
              </h2>
            ) : null}
            {header.description ? (
              <p className="text-xs sm:text-sm text-slate-600 font-sans mt-0.5 max-w-2xl">
                {header.description}
              </p>
            ) : null}
          </div>

          {header.actions ? (
            <div className="flex items-center gap-2 shrink-0">{header.actions}</div>
          ) : null}
        </div>
      ) : null}

      {/* Filter Toolbar */}
      {hasFilterSection ? (
        <AppFilter
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          isSearchable={isSearchable}
          filters={filters}
          activeFilters={activeFilters}
          onReset={onReset}
          resetLabel={resetLabel}
          showReset={showReset}
          actions={filterActions}
        />
      ) : null}

      {/* Table & Embedded Pagination Footer */}
      <AppTable
        columns={columns}
        data={displayedData}
        rowKey={rowKey}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        emptyMessage={emptyMessage}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
        onRowClick={onRowClick}
        selectable={selectable}
        selectedKeys={selectedKeys}
        onSelectChange={onSelectChange}
        tableClassName={tableClassName}
        footer={paginationComponent}
      />
    </div>
  );
}
