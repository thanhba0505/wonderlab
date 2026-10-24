import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-slate-200 bg-slate-100 text-slate-800 shadow-2xs hover:bg-slate-200',
        secondary: 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
        cyan: 'border-blue-200 bg-blue-50 text-blue-700 font-mono shadow-2xs',
        violet: 'border-violet-200 bg-violet-50 text-violet-700 font-mono shadow-2xs',
        amber: 'border-amber-200 bg-amber-50 text-amber-800 font-mono shadow-2xs',
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800 font-mono shadow-2xs',
        destructive: 'border-red-200 bg-red-50 text-red-700 font-mono',
        outline: 'text-slate-600 border-slate-300 bg-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
