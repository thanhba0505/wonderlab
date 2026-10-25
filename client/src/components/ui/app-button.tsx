import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const appButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-600 text-white font-bold shadow-xs hover:bg-blue-700 active:scale-[0.98] border border-transparent',
        secondary:
          'bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 active:scale-[0.98] border border-slate-200/80',
        outline:
          'border border-slate-300/85 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 active:scale-[0.98] shadow-2xs',
        ghost:
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] border border-transparent',
        danger:
          'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 active:scale-[0.98] font-semibold',
        'danger-solid':
          'bg-red-600 text-white font-bold hover:bg-red-700 active:scale-[0.98] shadow-xs border border-transparent',
        accent:
          'bg-violet-600 text-white font-bold shadow-xs hover:bg-violet-700 active:scale-[0.98] border border-transparent',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-9.5 px-4 text-xs font-medium rounded-lg',
        lg: 'h-11 px-5 text-sm font-semibold rounded-lg',
        'icon-sm': 'h-8 w-8 p-0 rounded-md shrink-0',
        icon: 'h-9.5 w-9.5 p-0 rounded-lg shrink-0',
        'icon-lg': 'h-11 w-11 p-0 rounded-lg shrink-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

export interface AppButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof appButtonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(appButtonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            {loadingText ? <span>{loadingText}</span> : children}
          </>
        ) : (
          <>
            {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
            {children}
            {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
          </>
        )}
      </button>
    );
  },
);

AppButton.displayName = 'AppButton';
