import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const appSelectVariants = cva(
  'w-full flex items-center justify-between text-left rounded-lg border border-slate-300/85 bg-white text-slate-900 font-sans transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:pointer-events-none disabled:bg-slate-100/60 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer select-none',
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-xs rounded-md',
        md: 'h-9.5 px-3 text-xs rounded-lg',
        lg: 'h-11 px-3.5 text-sm rounded-lg',
      },
      hasError: {
        true: 'border-red-500 focus:border-red-500 focus:ring-red-500/80 text-red-900',
      },
      isOpen: {
        true: 'ring-2 ring-blue-600 border-blue-600 shadow-sm',
      },
    },
    defaultVariants: {
      size: 'md',
      hasError: false,
      isOpen: false,
    },
  },
);

export interface AppSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface AppSelectProps
  extends
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'>,
    VariantProps<typeof appSelectVariants> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: string | boolean;
  leftIcon?: React.ReactNode;
  options?: AppSelectOption[];
  placeholder?: string;
  containerClassName?: string;
  selectClassName?: string;
  dropdownClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onValueChange?: (value: string) => void;
}

export const AppSelect = React.forwardRef<HTMLSelectElement, AppSelectProps>(
  (
    {
      className,
      selectClassName,
      containerClassName,
      dropdownClassName,
      label,
      helperText,
      error,
      leftIcon,
      options = [],
      placeholder,
      size = 'md',
      disabled,
      children,
      id,
      name,
      value,
      defaultValue,
      onChange,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : null;

    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const internalSelectRef = React.useRef<HTMLSelectElement | null>(null);
    const listboxRef = React.useRef<HTMLUListElement>(null);

    // Sync external ref with internalSelectRef
    React.useImperativeHandle(ref, () => internalSelectRef.current as HTMLSelectElement);

    // Parse options from either `options` prop or `<option>` JSX children
    const parsedOptions = React.useMemo<AppSelectOption[]>(() => {
      if (options && options.length > 0) {
        return options;
      }
      if (children) {
        const items: AppSelectOption[] = [];
        React.Children.forEach(children, child => {
          if (React.isValidElement(child) && child.type === 'option') {
            const childProps = child.props as {
              value?: string | number;
              children?: React.ReactNode;
              disabled?: boolean;
            };
            items.push({
              value: childProps.value ?? '',
              label:
                typeof childProps.children === 'string'
                  ? childProps.children
                  : String(childProps.value ?? ''),
              disabled: childProps.disabled,
            });
          }
        });
        return items;
      }
      return [];
    }, [options, children]);

    // Track controlled vs uncontrolled value
    const [internalValue, setInternalValue] = React.useState<string | number>(() => {
      if (value !== undefined) return Array.isArray(value) ? (value[0] ?? '') : value;
      if (defaultValue !== undefined) {
        return Array.isArray(defaultValue) ? (defaultValue[0] ?? '') : defaultValue;
      }
      return '';
    });

    const activeValue = value !== undefined ? value : internalValue;

    // Find currently selected option
    const selectedOption = React.useMemo(() => {
      return parsedOptions.find(opt => String(opt.value) === String(activeValue));
    }, [parsedOptions, activeValue]);

    // Handle outside click to close dropdown
    React.useEffect(() => {
      if (!isOpen) return;

      const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      };

      document.addEventListener('mousedown', handlePointerDownOutside);
      document.addEventListener('touchstart', handlePointerDownOutside);

      return () => {
        document.removeEventListener('mousedown', handlePointerDownOutside);
        document.removeEventListener('touchstart', handlePointerDownOutside);
      };
    }, [isOpen]);

    // Select an option
    const handleSelectOption = (opt: AppSelectOption) => {
      if (opt.disabled || disabled) return;

      setInternalValue(opt.value);
      setIsOpen(false);
      setHighlightedIndex(-1);

      if (onValueChange) {
        onValueChange(String(opt.value));
      }

      // Dispatch native change event on hidden select so standard React onChange works
      if (internalSelectRef.current) {
        internalSelectRef.current.value = String(opt.value);
        const event = new Event('change', { bubbles: true });
        internalSelectRef.current.dispatchEvent(event);
      }
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0 && highlightedIndex < parsedOptions.length) {
            handleSelectOption(parsedOptions[highlightedIndex]);
          } else {
            setIsOpen(prev => !prev);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(0);
          } else {
            setHighlightedIndex(prev => (prev < parsedOptions.length - 1 ? prev + 1 : 0));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(parsedOptions.length - 1);
          } else {
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : parsedOptions.length - 1));
          }
          break;
        case 'Escape':
          if (isOpen) {
            e.preventDefault();
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          break;
        case 'Tab':
          if (isOpen) {
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          break;
      }
    };

    // Keep hidden select value in sync and handle onChange
    const handleNativeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setInternalValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div
        ref={containerRef}
        className={cn('relative w-full flex flex-col font-sans', containerClassName)}
      >
        {/* Optional Label */}
        {label ? (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-slate-700 mb-1.5 select-none"
          >
            {label}
          </label>
        ) : null}

        {/* Custom Select Trigger Button */}
        <div className="relative w-full">
          <button
            type="button"
            id={`${selectId}-trigger`}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={`${selectId}-listbox`}
            aria-disabled={disabled}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(prev => !prev)}
            onKeyDown={handleKeyDown}
            className={cn(
              appSelectVariants({ size, hasError, isOpen }),
              leftIcon && (size === 'sm' ? 'pl-8' : size === 'lg' ? 'pl-11' : 'pl-9'),
              selectClassName,
              className,
            )}
          >
            {/* Left Icon */}
            {leftIcon ? (
              <span className="pointer-events-none absolute left-3 flex items-center justify-center text-slate-400">
                {leftIcon}
              </span>
            ) : null}

            {/* Display Text or Custom Selected Icon */}
            <span className="flex items-center gap-2 truncate min-w-0 flex-1">
              {selectedOption?.icon ? (
                <span className="shrink-0">{selectedOption.icon}</span>
              ) : null}
              {selectedOption ? (
                <span className="truncate">{selectedOption.label}</span>
              ) : (
                <span className="text-slate-400 truncate">{placeholder || 'Chọn một mục...'}</span>
              )}
            </span>

            {/* Dropdown Chevron Indicator */}
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ml-2',
                isOpen && 'rotate-180 text-blue-600',
              )}
            />
          </button>

          {/* Custom Styled Dropdown Popover */}
          {isOpen && (
            <div
              id={`${selectId}-listbox`}
              role="listbox"
              className={cn(
                'absolute left-0 right-0 top-[calc(100%+4px)] z-50 w-full min-w-0 max-w-full rounded-xl border border-slate-300/85 bg-white p-1.5 shadow-lg shadow-slate-900/10 animate-in fade-in-0 zoom-in-95 duration-150',
                dropdownClassName,
              )}
            >
              <ul
                ref={listboxRef}
                className="max-h-60 overflow-y-auto overflow-x-hidden space-y-0.5 focus:outline-none"
                tabIndex={-1}
              >
                {parsedOptions.length === 0 ? (
                  <li className="px-3 py-3 text-center text-xs text-slate-400 font-sans">
                    Không có lựa chọn nào
                  </li>
                ) : (
                  parsedOptions.map((opt, idx) => {
                    const isSelected = String(opt.value) === String(activeValue);
                    const isHighlighted = idx === highlightedIndex;

                    return (
                      <li
                        key={String(opt.value)}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled}
                        onClick={() => handleSelectOption(opt)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={cn(
                          'relative flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors font-sans select-none',
                          isSelected
                            ? 'bg-blue-50/90 text-blue-800 font-bold border border-blue-200/60'
                            : isHighlighted
                              ? 'bg-slate-100 text-slate-900 font-medium'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                          opt.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
                        )}
                      >
                        <div className="flex items-center gap-2 truncate pr-2 min-w-0 flex-1">
                          {opt.icon ? <span className="shrink-0">{opt.icon}</span> : null}
                          <div className="truncate min-w-0 flex-1">
                            <span className="block truncate">{opt.label}</span>
                            {opt.description ? (
                              <span className="block text-xs font-normal text-slate-400 truncate">
                                {opt.description}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-blue-600 shrink-0 ml-1.5 stroke-[2.5]" />
                        ) : null}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}

          {/* Hidden native select for 100% standard form support & test compatibility */}
          <select
            id={selectId}
            ref={internalSelectRef}
            name={name}
            disabled={disabled}
            value={activeValue}
            onChange={handleNativeChange}
            aria-hidden="true"
            tabIndex={-1}
            className="sr-only pointer-events-none"
            {...props}
          >
            {placeholder ? (
              <option value="" disabled hidden={activeValue !== ''}>
                {placeholder}
              </option>
            ) : null}
            {parsedOptions.map(opt => (
              <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error or Helper Message */}
        {errorMessage ? (
          <p className="mt-1 text-xs text-red-600 font-sans">{errorMessage}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500 font-sans">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

AppSelect.displayName = 'AppSelect';
