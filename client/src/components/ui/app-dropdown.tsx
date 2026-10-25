'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Context & Types
// ---------------------------------------------------------------------------

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  closeDropdown: () => void;
  align: 'start' | 'center' | 'end';
  side: 'top' | 'bottom';
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within an <AppDropdown>');
  }
  return context;
}

// ---------------------------------------------------------------------------
// AppDropdown Root
// ---------------------------------------------------------------------------

export interface AppDropdownProps {
  children?: React.ReactNode;
  /** Custom trigger node or render function receiving { isOpen } */
  trigger?: React.ReactNode | ((props: { isOpen: boolean }) => React.ReactNode);
  /** Horizontal alignment relative to trigger button */
  align?: 'start' | 'center' | 'end';
  /** Vertical placement */
  side?: 'top' | 'bottom';
  /** Controlled open state */
  isOpen?: boolean;
  /** Uncontrolled default open */
  defaultOpen?: boolean;
  /** Open change callback */
  onOpenChange?: (open: boolean) => void;
  /** Whether clicking an item automatically closes dropdown */
  closeOnItemClick?: boolean;
  /** Whether clicking outside closes dropdown */
  closeOnOutsideClick?: boolean;
  /** Whether pressing Esc closes dropdown */
  closeOnEsc?: boolean;
  /** Whether the entire dropdown trigger is disabled */
  disabled?: boolean;
  /** Width presets or custom width */
  width?: 'auto' | 'trigger' | 'sm' | 'md' | 'lg' | 'xl' | string;
  className?: string;
  dropdownClassName?: string;
  triggerClassName?: string;
}

const widthClasses: Record<string, string> = {
  auto: 'w-auto min-w-[200px]',
  trigger: 'w-full',
  sm: 'w-48',
  md: 'w-60',
  lg: 'w-72',
  xl: 'w-80',
};

export function AppDropdown({
  children,
  trigger,
  align = 'end',
  side = 'bottom',
  isOpen: controlledIsOpen,
  defaultOpen = false,
  onOpenChange,
  closeOnItemClick = true,
  closeOnOutsideClick = true,
  closeOnEsc = true,
  disabled = false,
  width = 'md',
  className,
  dropdownClassName,
  triggerClassName,
}: AppDropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = React.useState<boolean>(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const setIsOpen = React.useCallback(
    (valueOrUpdater: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(isOpen) : valueOrUpdater;
      if (!isControlled) {
        setInternalIsOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, isOpen, onOpenChange],
  );

  const closeDropdown = React.useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  // Click outside listener
  React.useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen, closeOnOutsideClick, closeDropdown]);

  // Escape key listener
  React.useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDropdown();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEsc, closeDropdown]);

  // Alignment classes
  const alignClass =
    align === 'start' ? 'left-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0';

  const sideClass = side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5';

  const widthClass = widthClasses[width] || width;

  const contextValue = React.useMemo(
    () => ({
      isOpen,
      setIsOpen,
      closeDropdown: closeOnItemClick ? closeDropdown : () => {},
      align,
      side,
    }),
    [isOpen, setIsOpen, closeOnItemClick, closeDropdown, align, side],
  );

  return (
    <DropdownContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn('relative inline-flex text-left font-sans', className)}>
        {/* Trigger Button */}
        {trigger && (
          <div
            className={cn('inline-flex items-center', triggerClassName)}
            onClick={e => {
              if (disabled) return;
              e.stopPropagation();
              setIsOpen(prev => !prev);
            }}
          >
            {typeof trigger === 'function' ? trigger({ isOpen }) : trigger}
          </div>
        )}

        {/* Dropdown Popover */}
        {isOpen && (
          <div
            role="menu"
            aria-orientation="vertical"
            tabIndex={-1}
            className={cn(
              'absolute z-50 rounded-xl border border-slate-300/85 bg-white py-1.5 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.12),0_4px_10px_-2px_rgba(15,23,42,0.04)] ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-100 focus:outline-none overflow-hidden',
              alignClass,
              sideClass,
              widthClass,
              dropdownClassName,
            )}
          >
            {children}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// AppDropdownItem
// ---------------------------------------------------------------------------

export interface AppDropdownItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'accent';
  className?: string;
  preventClose?: boolean;
  selected?: boolean;
}

export function AppDropdownItem({
  children,
  icon,
  rightElement,
  description,
  href,
  onClick,
  disabled = false,
  variant = 'default',
  className,
  preventClose = false,
  selected = false,
}: AppDropdownItemProps) {
  const { closeDropdown } = useDropdownContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (!preventClose) {
      closeDropdown();
    }
    onClick?.(e);
  };

  const variantStyles = {
    default: 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/70',
    danger: 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100/70',
    accent: 'text-blue-700 hover:text-blue-800 hover:bg-blue-50 active:bg-blue-100/70',
  }[variant];

  const commonClasses = cn(
    'group w-full flex items-center justify-between gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors duration-150 outline-none select-none cursor-pointer text-left',
    variantStyles,
    selected && 'bg-blue-50/80 text-blue-700 font-bold',
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className,
  );

  const innerContent = (
    <>
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {icon && (
          <span
            className={cn(
              'shrink-0 flex items-center justify-center transition-colors',
              variant === 'danger'
                ? 'text-rose-500 group-hover:text-rose-600'
                : variant === 'accent'
                  ? 'text-blue-600'
                  : 'text-slate-500 group-hover:text-slate-700',
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate leading-snug">{children}</div>
          {description && (
            <div className="text-xs font-normal text-slate-500 truncate leading-snug mt-0.5">
              {description}
            </div>
          )}
        </div>
      </div>
      {rightElement && <div className="shrink-0 text-xs font-mono">{rightElement}</div>}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} onClick={handleClick} className={commonClasses} role="menuitem">
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={commonClasses}
    >
      {innerContent}
    </button>
  );
}

// ---------------------------------------------------------------------------
// AppDropdownSeparator
// ---------------------------------------------------------------------------

export function AppDropdownSeparator({ className }: { className?: string }) {
  return <div className={cn('my-1 h-px bg-slate-200/90', className)} role="separator" />;
}

// ---------------------------------------------------------------------------
// AppDropdownHeader
// ---------------------------------------------------------------------------

export function AppDropdownHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'px-3.5 py-3 border-b border-slate-200/80 bg-slate-50/60 -mt-1.5 mb-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AppDropdownLabel
// ---------------------------------------------------------------------------

export function AppDropdownLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 select-none',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AppDropdownGroup
// ---------------------------------------------------------------------------

export function AppDropdownGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('px-1.5 py-0.5 space-y-0.5', className)}>{children}</div>;
}
