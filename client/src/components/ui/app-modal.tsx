'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppButton } from './app-button';

export interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * Modal placement in viewport.
   * - 'top' (default): Horizontally centered, positioned towards top ('giữa, trên top')
   * - 'center': Centered both horizontally and vertically
   */
  position?: 'top' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  portal?: boolean;
  portalContainer?: HTMLElement | null;
  className?: string;
  overlayClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const sizeClasses: Record<NonNullable<AppModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

export function AppModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = 'top',
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  portal = true,
  portalContainer,
  className,
  overlayClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
}: AppModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for Escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  // Lock body scroll when open
  React.useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Focus trap initiation
  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  const modalContent = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      onClick={handleBackdropClick}
      className={cn(
        'fixed inset-0 z-50 flex justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-xs duration-150 animate-in fade-in-0',
        position === 'top' ? 'items-start pt-14 pb-12 sm:pt-20' : 'items-center py-6',
        overlayClassName,
      )}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className={cn(
          'relative w-full rounded-2xl border border-slate-300/85 bg-white font-sans shadow-[0_20px_60px_-15px_rgba(15,23,42,0.18)] duration-150 animate-in zoom-in-95 focus:outline-none',
          sizeClasses[size],
          className,
        )}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div
            className={cn(
              'flex items-center justify-between rounded-t-2xl border-b border-slate-200/90 bg-slate-50/70 px-6 py-4',
              headerClassName,
            )}
          >
            <div className="min-w-0 flex-1 pr-3">
              {title ? (
                typeof title === 'string' ? (
                  <h3 id={titleId} className="font-heading text-base font-bold text-slate-900">
                    {title}
                  </h3>
                ) : (
                  <div id={titleId}>{title}</div>
                )
              ) : null}

              {description ? (
                typeof description === 'string' ? (
                  <p id={descriptionId} className="mt-1 text-xs text-slate-500">
                    {description}
                  </p>
                ) : (
                  <div id={descriptionId}>{description}</div>
                )
              ) : null}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-200/80 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95"
                aria-label="Đóng cửa sổ"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        {children ? (
          <div className={cn('p-6 text-xs leading-relaxed text-slate-600', bodyClassName)}>
            {children}
          </div>
        ) : null}

        {/* Modal Footer */}
        {footer ? (
          <div
            className={cn(
              'flex items-center justify-end gap-2.5 rounded-b-2xl border-t border-slate-200/90 bg-slate-50/70 px-6 py-3.5',
              footerClassName,
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (!portal) {
    return modalContent;
  }

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalContent, portalContainer ?? document.body);
}

// ----------------------------------------------------------------------
// Compound Subcomponents
// ----------------------------------------------------------------------

export function AppModalHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-t-2xl border-b border-slate-200/90 bg-slate-50/70 px-6 py-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AppModalTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className={cn('font-heading text-base font-bold text-slate-900', className)}>{children}</h3>
  );
}

export function AppModalDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <p className={cn('mt-1 text-xs text-slate-500', className)}>{children}</p>;
}

export function AppModalBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('p-6 text-xs leading-relaxed text-slate-600', className)}>{children}</div>
  );
}

export function AppModalFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2.5 rounded-b-2xl border-t border-slate-200/90 bg-slate-50/70 px-6 py-3.5',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ----------------------------------------------------------------------
// AppConfirmModal: Drop-in replacement for window.confirm
// ----------------------------------------------------------------------

export interface AppConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: React.ReactNode;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'info';
  isLoading?: boolean;
  position?: 'top' | 'center';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  portal?: boolean;
  portalContainer?: HTMLElement | null;
  className?: string;
}

export function AppConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = 'Hủy bỏ',
  variant = 'danger',
  isLoading = false,
  position = 'top',
  size = 'sm',
  icon,
  portal = true,
  portalContainer,
  className,
}: AppConfirmModalProps) {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-200/70 bg-red-50 text-red-600 shadow-2xs">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
        );
      case 'warning':
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-50 text-amber-600 shadow-2xs">
            <AlertCircle className="h-4.5 w-4.5" />
          </div>
        );
      case 'info':
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-200/70 bg-cyan-50 text-cyan-600 shadow-2xs">
            <Info className="h-4.5 w-4.5" />
          </div>
        );
      case 'primary':
      default:
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-200/70 bg-blue-50 text-blue-600 shadow-2xs">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
        );
    }
  };

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger-solid';
      case 'warning':
        return 'primary';
      case 'info':
      case 'primary':
      default:
        return 'primary';
    }
  };

  const defaultTitle =
    variant === 'danger'
      ? 'Xác nhận xóa'
      : variant === 'warning'
        ? 'Cảnh báo thao tác'
        : 'Xác nhận thao tác';

  const defaultConfirmText = variant === 'danger' ? 'Xác nhận xóa' : 'Xác nhận';

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      size={size}
      portal={portal}
      portalContainer={portalContainer}
      className={className}
      showCloseButton={!isLoading}
      closeOnBackdropClick={!isLoading}
      closeOnEsc={!isLoading}
      title={
        <div className="flex items-center gap-3">
          {icon ?? getDefaultIcon()}
          <span className="font-heading text-base font-bold text-slate-900">
            {title ?? defaultTitle}
          </span>
        </div>
      }
      footer={
        <>
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </AppButton>
          <AppButton
            type="button"
            variant={getConfirmButtonVariant()}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText ?? defaultConfirmText}
          </AppButton>
        </>
      }
    >
      <div className="text-xs leading-relaxed text-slate-600">{message}</div>
    </AppModal>
  );
}
