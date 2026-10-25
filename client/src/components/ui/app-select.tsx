import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const appSelectVariants = cva(
  'w-full appearance-none rounded-lg border border-slate-300/85 bg-white text-slate-900 font-sans transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:pointer-events-none disabled:bg-slate-100/60 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer',
  {
    variants: {
      size: {
        sm: 'h-8 pl-2.5 pr-8 text-xs rounded-md',
        md: 'h-9.5 pl-3 pr-9 text-xs rounded-lg',
        lg: 'h-11 pl-3.5 pr-10 text-sm rounded-lg',
      },
      hasError: {
        true: 'border-red-500 focus:border-red-500 focus:ring-red-500/80 text-red-900',
      },
    },
    defaultVariants: {
      size: 'md',
      hasError: false,
    },
  },
);

export interface AppSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface AppSelectProps
  extends
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof appSelectVariants> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: string | boolean;
  leftIcon?: React.ReactNode;
  options?: AppSelectOption[];
  placeholder?: string;
  containerClassName?: string;
  selectClassName?: string;
}

export const AppSelect = React.forwardRef<HTMLSelectElement, AppSelectProps>(
  (
    {
      className,
      selectClassName,
      containerClassName,
      label,
      helperText,
      error,
      leftIcon,
      options,
      placeholder,
      size = 'md',
      disabled,
      children,
      id,
      value,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : null;

    return (
      <div className={cn('w-full flex flex-col', containerClassName)}>
        {label ? (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-slate-700 mb-1.5 select-none"
          >
            {label}
          </label>
        ) : null}

        <div className="relative flex items-center w-full">
          {leftIcon ? (
            <div className="pointer-events-none absolute left-3 flex items-center justify-center text-slate-400">
              {leftIcon}
            </div>
          ) : null}

          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            value={value}
            className={cn(
              appSelectVariants({ size, hasError }),
              leftIcon && (size === 'sm' ? 'pl-8' : size === 'lg' ? 'pl-11' : 'pl-9'),
              selectClassName,
              className,
            )}
            {...props}
          >
            {placeholder ? (
              <option value="" disabled hidden={value !== ''}>
                {placeholder}
              </option>
            ) : null}

            {options
              ? options.map(opt => (
                  <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div
            className={cn(
              'pointer-events-none absolute flex items-center justify-center text-slate-400',
              size === 'sm' ? 'right-2' : size === 'lg' ? 'right-3.5' : 'right-2.5',
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

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
