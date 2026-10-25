import * as React from 'react';
import { cn } from '@/lib/utils';
import { AppFilter, type AppFilterField, type AppActiveFilter } from './app-filter';
import {
  AppTable,
  type AppTableColumn,
  type AppTableFetchParams,
  type AppTableFetchResult,
} from './app-table';
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
  onFilter?: () => void;
  filterLabel?: string;
  showFilterButton?: boolean;
  isFiltering?: boolean;
  onReset?: () => void;
  resetLabel?: string;
  showReset?: boolean;
  filterActions?: React.ReactNode;

  // Table Props
  columns: AppTableColumn<T>[];
  data?: T[];
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
  tableLayout?: 'fixed' | 'auto';
  minWidth?: string | number;

  // Pagination & Fetch Props
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onLimitChange?: (limit: number) => void;
  pagination?: Omit<AppPaginationProps, 'className'>;
  clientSidePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  fetchData?: (params: AppTableFetchParams) => Promise<AppTableFetchResult<T> | T[]>;
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
  onFilter,
  filterLabel = 'Lọc',
  showFilterButton = true,
  isFiltering = false,
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
  tableLayout = 'fixed',
  minWidth,
  page,
  limit,
  total,
  onPageChange,
  onPageSizeChange,
  onLimitChange,
  pagination,
  clientSidePagination = false,
  pageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  fetchData,
  ...props
}: AppTableFilterProps<T>) {
  const initialPageSize = limit ?? pageSize ?? 20;
  const [internalPage, setInternalPage] = React.useState<number>(page ?? 1);
  const [internalPageSize, setInternalPageSize] = React.useState<number>(initialPageSize);
  const [internalData, setInternalData] = React.useState<T[]>(data ?? []);
  const [internalTotal, setInternalTotal] = React.useState<number>(total ?? data?.length ?? 0);
  const [internalLoading, setInternalLoading] = React.useState<boolean>(false);

  // Sync external data if not using fetchData
  React.useEffect(() => {
    if (!fetchData && data !== undefined) {
      setInternalData(data);
      setInternalTotal(total ?? data.length);
    }
  }, [fetchData, data, total]);

  // Execute fetchData when params change
  const filtersRef = React.useRef(filters);
  filtersRef.current = filters;
  const searchRef = React.useRef(searchValue);
  searchRef.current = searchValue;

  const runFetch = React.useCallback(
    async (targetPage: number, targetLimit: number, customSearch?: string) => {
      if (!fetchData) return;
      setInternalLoading(true);
      try {
        const filterMap: Record<string, string | number> = {};
        filtersRef.current.forEach(f => {
          if (f.value !== undefined && f.value !== '' && f.value !== 'all') {
            filterMap[f.id] = f.value;
          }
        });
        const res = await fetchData({
          page: targetPage,
          limit: targetLimit,
          search: customSearch !== undefined ? customSearch : searchRef.current,
          filters: filterMap,
          sortColumn,
          sortDirection,
        });
        if (Array.isArray(res)) {
          setInternalData(res);
          setInternalTotal(res.length);
        } else if (res && Array.isArray(res.data)) {
          setInternalData(res.data);
          setInternalTotal(res.total ?? res.data.length);
        }
      } catch {
        setInternalData([]);
        setInternalTotal(0);
      } finally {
        setInternalLoading(false);
      }
    },
    [fetchData, sortColumn, sortDirection],
  );

  React.useEffect(() => {
    if (fetchData) {
      runFetch(internalPage, internalPageSize);
    }
  }, [fetchData, internalPage, internalPageSize, runFetch]);

  // Sync external page & pageSize props to internal state
  React.useEffect(() => {
    if (page !== undefined) {
      setInternalPage(page);
    }
  }, [page]);

  React.useEffect(() => {
    const size = limit ?? pageSize;
    if (size !== undefined) {
      setInternalPageSize(size);
    }
  }, [limit, pageSize]);

  // Reset internal page if client side data length changes
  React.useEffect(() => {
    if (clientSidePagination) {
      setInternalPage(1);
    }
  }, [clientSidePagination, data?.length, searchValue]);

  const effectiveData = React.useMemo(
    () => (fetchData ? internalData : (data ?? [])),
    [fetchData, internalData, data],
  );
  const effectiveLoading = fetchData ? internalLoading : isLoading;
  const effectiveTotal = fetchData ? internalTotal : (total ?? effectiveData.length);
  const effectivePage = fetchData ? internalPage : (page ?? internalPage);
  const effectivePageSize = fetchData ? internalPageSize : (limit ?? pageSize ?? internalPageSize);

  // Compute table data based on pagination (client-side or overflow fallback)
  const displayedData = React.useMemo(() => {
    const shouldSlice =
      clientSidePagination || (!fetchData && effectiveData.length > effectivePageSize);
    if (!shouldSlice) return effectiveData;
    const start = (effectivePage - 1) * effectivePageSize;
    return effectiveData.slice(start, start + effectivePageSize);
  }, [clientSidePagination, fetchData, effectiveData, effectivePage, effectivePageSize]);

  const handleFilterClick = React.useCallback(() => {
    if (fetchData) {
      setInternalPage(1);
      runFetch(1, internalPageSize);
    }
    onFilter?.();
  }, [fetchData, runFetch, internalPageSize, onFilter]);

  const handlePageChange = React.useCallback(
    (nextPage: number) => {
      if (fetchData) {
        setInternalPage(nextPage);
      } else if (clientSidePagination) {
        setInternalPage(nextPage);
      }
      onPageChange?.(nextPage);
    },
    [fetchData, clientSidePagination, onPageChange],
  );

  const handlePageSizeChange = React.useCallback(
    (nextSize: number) => {
      if (fetchData) {
        setInternalPageSize(nextSize);
        setInternalPage(1);
      } else if (clientSidePagination) {
        setInternalPageSize(nextSize);
        setInternalPage(1);
      }
      if (onPageSizeChange) {
        onPageSizeChange(nextSize);
      } else if (onLimitChange) {
        onLimitChange(nextSize);
      }
    },
    [fetchData, clientSidePagination, onPageSizeChange, onLimitChange],
  );

  const hasFilterSection =
    (isSearchable && Boolean(onSearchChange)) ||
    filters.length > 0 ||
    activeFilters.length > 0 ||
    Boolean(filterActions) ||
    Boolean(onFilter) ||
    Boolean(fetchData);

  const paginationComponent = pagination ? (
    <AppPagination {...pagination} />
  ) : (total !== undefined && onPageChange) ||
    fetchData ||
    (clientSidePagination && effectiveData.length > 0) ? (
    <AppPagination
      page={effectivePage}
      pageSize={effectivePageSize}
      total={effectiveTotal}
      onPageChange={handlePageChange}
      pageSizeOptions={pageSizeOptions}
      onPageSizeChange={handlePageSizeChange}
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
          onFilter={handleFilterClick}
          filterLabel={filterLabel}
          showFilterButton={showFilterButton}
          isFiltering={isFiltering || (fetchData ? internalLoading : false)}
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
        isLoading={effectiveLoading}
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
        tableLayout={tableLayout}
        minWidth={minWidth}
        footer={paginationComponent}
      />
    </div>
  );
}
