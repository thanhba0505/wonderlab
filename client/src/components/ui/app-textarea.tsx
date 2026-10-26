'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const appTextAreaVariants = cva(
  'w-full rounded-lg border border-slate-300/85 bg-white text-slate-900 placeholder:text-slate-400 font-sans transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:pointer-events-none disabled:bg-slate-100/60 disabled:text-slate-400 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'min-h-[4.5rem] px-2.5 py-1.5 text-xs rounded-md leading-relaxed',
        md: 'min-h-[5.5rem] px-3.5 py-2.5 text-xs rounded-lg leading-relaxed',
        lg: 'min-h-[7rem] px-3.5 py-2.5 text-sm rounded-lg leading-relaxed',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
      hasError: {
        true: 'border-red-500 focus:border-red-500 focus:ring-red-500/80 text-red-900 placeholder:text-red-300',
      },
    },
    defaultVariants: {
      size: 'md',
      resize: 'vertical',
      hasError: false,
    },
  },
);

export interface AppTextAreaProps
  extends
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof appTextAreaVariants> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: string | string[] | boolean;
  required?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  showCount?: boolean;
  autoResize?: boolean;
  containerClassName?: string;
  textareaClassName?: string;
}

export const AppTextArea = React.forwardRef<HTMLTextAreaElement, AppTextAreaProps>(
  (
    {
      className,
      textareaClassName,
      containerClassName,
      label,
      helperText,
      error,
      hasError: propHasError,
      required,
      clearable,
      onClear,
      showCount,
      autoResize = false,
      size = 'md',
      resize = 'vertical',
      disabled,
      value,
      defaultValue,
      onChange,
      id,
      rows = 3,
      maxLength,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);

    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(
      String(defaultValue ?? ''),
    );
    const currentValue = isControlled ? String(value ?? '') : uncontrolledValue;
    const currentLength = currentValue.length;

    const errorList = React.useMemo(() => {
      if (!error) return [];
      if (Array.isArray(error)) return error.filter(Boolean);
      if (typeof error === 'string') return [error];
      return [];
    }, [error]);

    const hasError =
      propHasError !== undefined
        ? propHasError
        : Boolean(error && (typeof error === 'boolean' ? error : errorList.length > 0));

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [ref],
    );

    const adjustHeight = React.useCallback(() => {
      if (!autoResize) return;
      const el = internalRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }, [autoResize]);

    React.useEffect(() => {
      adjustHeight();
    }, [adjustHeight, currentValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) {
        setUncontrolledValue(e.target.value);
      }
      onChange?.(e);
      if (autoResize) {
        adjustHeight();
      }
    };

    const showClearButton = clearable && !disabled && currentLength > 0;

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isControlled) {
        setUncontrolledValue('');
      }
      if (onClear) {
        onClear();
      }
      if (internalRef.current) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value',
        )?.set;
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(internalRef.current, '');
          const event = new Event('input', { bubbles: true });
          internalRef.current.dispatchEvent(event);
        }
        internalRef.current.focus();
        if (autoResize) {
          adjustHeight();
        }
      }
    };

    const hasBottomContent = errorList.length > 0 || Boolean(helperText) || showCount;

    return (
      <div className={cn('w-full flex flex-col', containerClassName)}>
        {label ? (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold text-slate-700 mb-1.5 select-none cursor-pointer"
          >
            {label}
            {required && (
              <span className="text-rose-500 font-bold ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        ) : null}

        <div className="relative flex w-full">
          <textarea
            id={textareaId}
            ref={setRefs}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            aria-invalid={hasError ? 'true' : undefined}
            aria-required={required ? 'true' : undefined}
            aria-describedby={
              errorList.length > 0
                ? `${textareaId}-errors`
                : helperText
                  ? `${textareaId}-helper`
                  : undefined
            }
            className={cn(
              appTextAreaVariants({ size, resize: autoResize ? 'none' : resize, hasError }),
              showClearButton && 'pr-8',
              textareaClassName,
              className,
            )}
            {...props}
          />

          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Xoá nội dung"
              className="absolute right-2.5 top-2.5 flex items-center justify-center text-slate-400 hover:text-slate-600 active:text-slate-800 transition-colors rounded p-0.5 focus:outline-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {hasBottomContent ? (
          <div className="mt-1.5 flex items-start justify-between gap-2 text-xs">
            <div className="flex-1">
              {errorList.length > 0 ? (
                errorList.length === 1 ? (
                  <p id={`${textareaId}-errors`} className="text-red-600 font-sans" role="alert">
                    {errorList[0]}
                  </p>
                ) : (
                  <ul
                    id={`${textareaId}-errors`}
                    className="space-y-1 text-red-600 font-sans"
                    role="alert"
                  >
                    {errorList.map((err, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-red-500 font-bold shrink-0 leading-tight select-none">
                          •
                        </span>
                        <span className="leading-tight">{err}</span>
                      </li>
                    ))}
                  </ul>
                )
              ) : helperText ? (
                <p id={`${textareaId}-helper`} className="text-slate-500 font-sans">
                  {helperText}
                </p>
              ) : null}
            </div>

            {showCount ? (
              <span
                className={cn(
                  'font-mono tabular-nums text-slate-400 shrink-0 select-none ml-auto text-xs',
                  maxLength !== undefined &&
                    currentLength > maxLength &&
                    'text-red-500 font-semibold',
                )}
                aria-live="polite"
              >
                {currentLength}
                {maxLength !== undefined ? `/${maxLength}` : ''}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);

AppTextArea.displayName = 'AppTextArea';
