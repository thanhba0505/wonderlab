import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const appInputVariants = cva(
  'w-full rounded-lg border border-slate-300/85 bg-white text-slate-900 placeholder:text-slate-400 font-sans transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:pointer-events-none disabled:bg-slate-100/60 disabled:text-slate-400 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-xs rounded-md',
        md: 'h-9.5 px-3 text-xs rounded-lg',
        lg: 'h-11 px-3.5 text-sm rounded-lg',
      },
      hasError: {
        true: 'border-red-500 focus:border-red-500 focus:ring-red-500/80 text-red-900 placeholder:text-red-300',
      },
    },
    defaultVariants: {
      size: 'md',
      hasError: false,
    },
  },
);

export interface AppInputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof appInputVariants> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: string | boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
  inputClassName?: string;
}

export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      className,
      inputClassName,
      containerClassName,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      clearable,
      onClear,
      size = 'md',
      disabled,
      value,
      onChange,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : null;

    const showClearButton =
      clearable && !disabled && value !== undefined && value !== null && String(value).length > 0;

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClear) {
        onClear();
      }
    };

    return (
      <div className={cn('w-full flex flex-col', containerClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
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

          <input
            id={inputId}
            ref={ref}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={cn(
              appInputVariants({ size, hasError }),
              leftIcon && (size === 'sm' ? 'pl-8' : size === 'lg' ? 'pl-11' : 'pl-9'),
              (rightIcon || showClearButton) &&
                (size === 'sm' ? 'pr-8' : size === 'lg' ? 'pr-11' : 'pr-9'),
              inputClassName,
              className,
            )}
            {...props}
          />

          {showClearButton ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Xoá nội dung"
              className={cn(
                'absolute flex items-center justify-center text-slate-400 hover:text-slate-600 active:text-slate-800 transition-colors rounded p-0.5',
                size === 'sm' ? 'right-2' : size === 'lg' ? 'right-3' : 'right-2.5',
              )}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : rightIcon ? (
            <div
              className={cn(
                'pointer-events-none absolute flex items-center justify-center text-slate-400',
                size === 'sm' ? 'right-2.5' : size === 'lg' ? 'right-3.5' : 'right-3',
              )}
            >
              {rightIcon}
            </div>
          ) : null}
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

AppInput.displayName = 'AppInput';
