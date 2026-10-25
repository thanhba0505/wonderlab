import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const appTagVariants = cva(
  'inline-flex items-center gap-1.5 border font-semibold tracking-wide transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'border-slate-200 bg-slate-100 text-slate-700 shadow-2xs',
        blue: 'border-blue-200 bg-blue-50 text-blue-700 font-mono shadow-2xs',
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800 font-mono shadow-2xs',
        amber: 'border-amber-200 bg-amber-50 text-amber-800 font-mono shadow-2xs',
        red: 'border-red-200 bg-red-50 text-red-700 font-mono shadow-2xs',
        violet: 'border-violet-200 bg-violet-50 text-violet-700 font-mono shadow-2xs',
        outline: 'border-slate-300 bg-white text-slate-700 shadow-2xs',
      },
      size: {
        sm: 'h-5 px-2 text-xs rounded-md',
        md: 'h-6 px-2.5 text-xs rounded-md',
        lg: 'h-7 px-3 text-xs font-semibold rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

const dotColorMap: Record<string, string> = {
  default: 'bg-slate-400',
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  violet: 'bg-violet-500',
  outline: 'bg-slate-400',
};

export interface AppTagProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof appTagVariants> {
  dot?: boolean | string;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

export const AppTag = React.forwardRef<HTMLDivElement, AppTagProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      dot,
      removable,
      onRemove,
      icon,
      children,
      ...props
    },
    ref,
  ) => {
    const activeVariant = variant || 'default';
    const dotColorClass =
      typeof dot === 'string' ? dot : dotColorMap[activeVariant] || 'bg-slate-400';

    const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (onRemove) {
        onRemove();
      }
    };

    return (
      <div ref={ref} className={cn(appTagVariants({ variant, size }), className)} {...props}>
        {dot ? <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColorClass)} /> : null}

        {icon ? <span className="shrink-0 flex items-center">{icon}</span> : null}

        <span className="truncate">{children}</span>

        {removable ? (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Xoá thẻ"
            className="rounded-full p-0.5 hover:bg-black/10 active:bg-black/20 text-current opacity-70 hover:opacity-100 transition-opacity ml-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        ) : null}
      </div>
    );
  },
);

AppTag.displayName = 'AppTag';
