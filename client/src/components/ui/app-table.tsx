import * as React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppPagination, type AppPaginationProps } from './app-pagination';

export interface AppTableColumn<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  className?: string;
  headerClassName?: string;
}

export interface AppTableFetchParams {
  page: number;
  limit: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, string | number>;
}

export interface AppTableFetchResult<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface AppTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
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
  footer?: React.ReactNode;

  // Server Pagination & Fetch Props
  page?: number;
  pageSize?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
  pagination?: boolean | Omit<AppPaginationProps, 'className'>;
  fetchData?: (params: AppTableFetchParams) => Promise<AppTableFetchResult<T> | T[]>;
}

export function AppTable<T>({
  className,
  tableClassName,
  columns,
  data: externalData,
  rowKey,
  isLoading = false,
  loadingMessage = 'Đang tải dữ liệu...',
  emptyMessage = 'Không có dữ liệu phù hợp.',
  sortColumn,
  sortDirection = 'asc',
  onSort,
  onRowClick,
  selectable = false,
  selectedKeys = [],
  onSelectChange,
  footer,
  page,
  pageSize,
  limit,
  total,
  onPageChange,
  onPageSizeChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50, 100],
  pagination,
  fetchData,
  ...props
}: AppTableProps<T>) {
  const initialLimit = limit ?? pageSize ?? 20;
  const [internalData, setInternalData] = React.useState<T[]>(externalData ?? []);
  const [internalTotal, setInternalTotal] = React.useState<number>(
    total ?? externalData?.length ?? 0,
  );
  const [internalPage, setInternalPage] = React.useState<number>(page ?? 1);
  const [internalLimit, setInternalLimit] = React.useState<number>(initialLimit);
  const [internalLoading, setInternalLoading] = React.useState<boolean>(false);

  // Sync external data if not using fetchData
  React.useEffect(() => {
    if (!fetchData && externalData !== undefined) {
      setInternalData(externalData);
      setInternalTotal(total ?? externalData.length);
    }
  }, [fetchData, externalData, total]);

  // Execute fetchData when params change
  React.useEffect(() => {
    if (!fetchData) return;
    let isCancelled = false;
    setInternalLoading(true);

    fetchData({
      page: internalPage,
      limit: internalLimit,
      sortColumn,
      sortDirection,
    })
      .then(res => {
        if (isCancelled) return;
        if (Array.isArray(res)) {
          setInternalData(res);
          setInternalTotal(res.length);
        } else if (res && Array.isArray(res.data)) {
          setInternalData(res.data);
          setInternalTotal(res.total ?? res.data.length);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setInternalData([]);
          setInternalTotal(0);
        }
      })
      .finally(() => {
        if (!isCancelled) setInternalLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [fetchData, internalPage, internalLimit, sortColumn, sortDirection]);

  const effectiveData = React.useMemo(
    () => (fetchData ? internalData : (externalData ?? [])),
    [fetchData, internalData, externalData],
  );
  const effectiveLoading = fetchData ? internalLoading : isLoading;
  const effectiveTotal = fetchData ? internalTotal : (total ?? effectiveData.length);
  const effectivePage = fetchData ? internalPage : (page ?? 1);
  const effectiveLimit = fetchData ? internalLimit : (limit ?? pageSize ?? 20);

  const handlePageChange = React.useCallback(
    (nextPage: number) => {
      if (fetchData) {
        setInternalPage(nextPage);
      }
      onPageChange?.(nextPage);
    },
    [fetchData, onPageChange],
  );

  const handlePageSizeChange = React.useCallback(
    (nextSize: number) => {
      if (fetchData) {
        setInternalLimit(nextSize);
        setInternalPage(1);
      }
      if (onPageSizeChange) {
        onPageSizeChange(nextSize);
      } else if (onLimitChange) {
        onLimitChange(nextSize);
      }
    },
    [fetchData, onPageSizeChange, onLimitChange],
  );

  const paginationFooter = React.useMemo(() => {
    if (footer !== undefined) return footer;
    if (typeof pagination === 'object' && pagination !== null) {
      return <AppPagination {...pagination} />;
    }
    const shouldRenderPagination =
      pagination === true ||
      fetchData !== undefined ||
      (total !== undefined && onPageChange !== undefined);

    if (shouldRenderPagination) {
      return (
        <AppPagination
          page={effectivePage}
          pageSize={effectiveLimit}
          total={effectiveTotal}
          onPageChange={handlePageChange}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={handlePageSizeChange}
        />
      );
    }
    return null;
  }, [
    footer,
    pagination,
    fetchData,
    total,
    onPageChange,
    effectivePage,
    effectiveLimit,
    effectiveTotal,
    handlePageChange,
    pageSizeOptions,
    handlePageSizeChange,
  ]);

  const getRowKey = React.useCallback(
    (item: T, index: number): string | number => {
      if (rowKey) return rowKey(item, index);
      if (typeof item === 'object' && item !== null && 'id' in item) {
        return (item as { id: string | number }).id;
      }
      return index;
    },
    [rowKey],
  );

  const allRowKeys = React.useMemo(
    () => effectiveData.map((item, index) => getRowKey(item, index)),
    [effectiveData, getRowKey],
  );

  const isAllSelected =
    effectiveData.length > 0 &&
    allRowKeys.length > 0 &&
    allRowKeys.every(key => selectedKeys.includes(key));

  const isPartiallySelected =
    effectiveData.length > 0 &&
    selectedKeys.length > 0 &&
    !isAllSelected &&
    allRowKeys.some(key => selectedKeys.includes(key));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectChange) return;
    if (e.target.checked) {
      // Merge all row keys without duplicates
      const newKeys = Array.from(new Set([...selectedKeys, ...allRowKeys]));
      onSelectChange(newKeys);
    } else {
      // Remove current table keys from selectedKeys
      const remainingKeys = selectedKeys.filter(key => !allRowKeys.includes(key));
      onSelectChange(remainingKeys);
    }
  };

  const handleSelectRow = (key: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectChange) return;
    if (selectedKeys.includes(key)) {
      onSelectChange(selectedKeys.filter(k => k !== key));
    } else {
      onSelectChange([...selectedKeys, key]);
    }
  };

  return (
    <div
      className={cn(
        'w-full rounded-xl border border-slate-300/85 bg-white shadow-2xs overflow-hidden flex flex-col font-sans',
        className,
      )}
      {...props}
    >
      <div className="overflow-x-auto w-full">
        <table
          className={cn('w-full min-w-full text-left border-collapse text-xs', tableClassName)}
        >
          {/* Header */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 font-mono text-xs uppercase tracking-wider text-slate-500">
              {selectable ? (
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    aria-label="Chọn tất cả"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isPartiallySelected;
                    }}
                    onChange={handleSelectAll}
                    disabled={effectiveLoading || effectiveData.length === 0}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 focus:ring-2 cursor-pointer transition-colors"
                  />
                </th>
              ) : null}

              {columns.map(col => {
                const isSorted = sortColumn === col.key;
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                      ? 'text-right'
                      : 'text-left';

                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={cn(
                      'p-3.5 font-semibold select-none',
                      alignClass,
                      col.sortable && 'cursor-pointer hover:bg-slate-100/70 transition-colors',
                      col.headerClassName,
                    )}
                    onClick={() => {
                      if (col.sortable && onSort) {
                        onSort(col.key);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        col.align === 'center' && 'justify-center',
                        col.align === 'right' && 'justify-end',
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable ? (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-3.5 w-3.5 text-blue-600 font-bold" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-blue-600 font-bold" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                          )}
                        </span>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
            {effectiveLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center text-xs text-slate-500 font-sans"
                >
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="font-medium text-slate-600">{loadingMessage}</span>
                  </div>
                </td>
              </tr>
            ) : effectiveData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center text-xs text-slate-500 font-sans"
                >
                  {typeof emptyMessage === 'string' ? (
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Database className="h-8 w-8 stroke-[1.5]" />
                      <p className="text-slate-500 text-xs font-medium">{emptyMessage}</p>
                    </div>
                  ) : (
                    emptyMessage
                  )}
                </td>
              </tr>
            ) : (
              effectiveData.map((item, index) => {
                const key = getRowKey(item, index);
                const isSelected = selectedKeys.includes(key);

                return (
                  <tr
                    key={String(key)}
                    onClick={() => onRowClick && onRowClick(item, index)}
                    className={cn(
                      'transition-colors',
                      isSelected ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50/70',
                      onRowClick && 'cursor-pointer',
                    )}
                  >
                    {selectable ? (
                      <td className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Chọn dòng ${index + 1}`}
                          checked={isSelected}
                          onClick={e => handleSelectRow(key, e)}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 focus:ring-2 cursor-pointer transition-colors"
                        />
                      </td>
                    ) : null}

                    {columns.map(col => {
                      const alignClass =
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                            ? 'text-right'
                            : 'text-left';

                      return (
                        <td
                          key={col.key}
                          style={{ width: col.width }}
                          className={cn('p-3.5 align-middle', alignClass, col.className)}
                        >
                          {col.render
                            ? col.render(item, index)
                            : (item as Record<string, unknown>)[col.key] !== undefined &&
                                (item as Record<string, unknown>)[col.key] !== null
                              ? String((item as Record<string, unknown>)[col.key])
                              : '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Optional Table / Pagination Footer */}
      {paginationFooter ? (
        <div className="border-t border-slate-200 bg-slate-50/60 p-3 sm:px-4">
          {paginationFooter}
        </div>
      ) : null}
    </div>
  );
}
