import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-slate-800 text-slate-100 hover:bg-slate-700',
        secondary: 'border-transparent bg-slate-800/80 text-slate-300 hover:bg-slate-700',
        cyan: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300 font-mono',
        violet: 'border-violet-500/30 bg-violet-950/40 text-violet-300 font-mono',
        amber: 'border-amber-500/30 bg-amber-950/40 text-amber-300 font-mono',
        emerald: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300 font-mono',
        destructive: 'border-transparent bg-red-900/50 text-red-200',
        outline: 'text-slate-400 border-slate-700',
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
