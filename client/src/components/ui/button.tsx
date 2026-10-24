import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-cyan-500 text-slate-950 font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] shadow-cyan-500/20 hover:bg-cyan-400 active:scale-[0.98]',
        secondary:
          'bg-slate-800 text-slate-100 border border-slate-700/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] hover:bg-slate-700 hover:text-white active:scale-[0.98]',
        outline:
          'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800/80 hover:text-white active:scale-[0.98]',
        ghost: 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
        accent:
          'bg-violet-600 text-white font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] shadow-violet-600/20 hover:bg-violet-500 active:scale-[0.98]',
        link: 'text-cyan-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
