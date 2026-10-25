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
  minWidth?: string | number;
  className?: string;
  headerClassName?: string;
}

function formatDimension(dim?: string | number): string | undefined {
  if (dim === undefined || dim === null) return undefined;
  return typeof dim === 'number' ? `${dim}px` : String(dim);
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
  tableLayout?: 'fixed' | 'auto';
  minWidth?: string | number;
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
  tableLayout = 'fixed',
  minWidth,
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

  const calculatedMinWidth = React.useMemo(() => {
    if (minWidth !== undefined) {
      return formatDimension(minWidth);
    }
    if (tableLayout === 'auto') {
      return undefined;
    }

    let totalPixels = selectable ? 48 : 0;
    for (const col of columns) {
      if (col.width !== undefined) {
        if (typeof col.width === 'number') {
          totalPixels += col.width;
        } else if (typeof col.width === 'string' && col.width.endsWith('px')) {
          const parsed = parseFloat(col.width);
          if (!Number.isNaN(parsed)) totalPixels += parsed;
        } else {
          totalPixels += 120;
        }
      } else if (col.minWidth !== undefined) {
        if (typeof col.minWidth === 'number') {
          totalPixels += col.minWidth;
        } else if (typeof col.minWidth === 'string' && col.minWidth.endsWith('px')) {
          const parsed = parseFloat(col.minWidth);
          if (!Number.isNaN(parsed)) totalPixels += parsed;
        } else {
          totalPixels += 120;
        }
      } else {
        totalPixels += 120;
      }
    }

    return totalPixels > 0 ? `${totalPixels}px` : undefined;
  }, [minWidth, tableLayout, columns, selectable]);

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
          style={calculatedMinWidth ? { minWidth: calculatedMinWidth } : undefined}
          className={cn(
            'w-full min-w-full text-left border-collapse text-xs',
            tableLayout === 'fixed' ? 'table-fixed' : 'table-auto',
            tableClassName,
          )}
        >
          {/* Column widths */}
          <colgroup>
            {selectable ? <col style={{ width: 48, minWidth: 48 }} /> : null}
            {columns.map(col => {
              const width = formatDimension(col.width);
              const minColWidth = formatDimension(col.minWidth);
              const colStyle: React.CSSProperties = {};
              if (width) colStyle.width = width;
              if (minColWidth) colStyle.minWidth = minColWidth;

              return (
                <col
                  key={col.key}
                  style={Object.keys(colStyle).length > 0 ? colStyle : undefined}
                />
              );
            })}
          </colgroup>

          {/* Header */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 font-mono text-xs uppercase tracking-wider text-slate-500 divide-x divide-slate-200/80">
              {selectable ? (
                <th
                  style={{ width: 48, minWidth: 48 }}
                  className="px-3.5 py-3.5 w-12 text-center align-middle border-r border-slate-200/80"
                >
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

                const width = formatDimension(col.width);
                const minColWidth = formatDimension(col.minWidth);
                const cellStyle: React.CSSProperties = {};
                if (width) cellStyle.width = width;
                if (minColWidth) cellStyle.minWidth = minColWidth;

                return (
                  <th
                    key={col.key}
                    style={Object.keys(cellStyle).length > 0 ? cellStyle : undefined}
                    className={cn(
                      'px-4 py-3.5 font-semibold select-none align-middle',
                      'first:pl-6 sm:first:pl-7 last:pr-6 sm:last:pr-7',
                      'border-r border-slate-200/80 last:border-r-0',
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
                        'inline-flex items-center gap-1.5 max-w-full',
                        col.align === 'center' && 'justify-center',
                        col.align === 'right' && 'justify-end',
                      )}
                    >
                      <span className="whitespace-normal break-words leading-tight">
                        {col.header}
                      </span>
                      {col.sortable ? (
                        <span className="text-slate-400 shrink-0 self-center">
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
                  className="py-16 text-center text-xs text-slate-500 font-sans px-4"
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
                  className="py-16 text-center text-xs text-slate-500 font-sans px-4"
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
                      <td
                        style={{ width: 48, minWidth: 48 }}
                        className="px-3.5 py-3.5 w-12 text-center align-middle"
                      >
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

                      const width = formatDimension(col.width);
                      const minColWidth = formatDimension(col.minWidth);
                      const cellStyle: React.CSSProperties = {};
                      if (width) cellStyle.width = width;
                      if (minColWidth) cellStyle.minWidth = minColWidth;

                      return (
                        <td
                          key={col.key}
                          style={Object.keys(cellStyle).length > 0 ? cellStyle : undefined}
                          className={cn(
                            'px-4 py-3.5 align-middle',
                            'first:pl-6 sm:first:pl-7 last:pr-6 sm:last:pr-7',
                            alignClass,
                            col.className,
                          )}
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
        <div className="border-t border-slate-200 bg-slate-50/60 px-6 py-3 sm:px-7">
          {paginationFooter}
        </div>
      ) : null}
    </div>
  );
}
