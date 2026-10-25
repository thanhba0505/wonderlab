import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdminSidebar } from './admin-sidebar';
import { AuthUser } from '@/types';

// @ts-expect-error global flag for react act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('next/navigation', () => ({
  usePathname: () => '/my-account',
}));

describe('AdminSidebar (Role-based Console Navigation)', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders only personal account tabs for regular USER role without admin tabs', () => {
    const regularUser: AuthUser = {
      id: 'user-1',
      username: 'einstein',
      email: 'einstein@wonderlab.vn',
      role: 'USER',
      createdAt: '2026-10-24T12:00:00.000Z',
      updatedAt: '2026-10-24T12:00:00.000Z',
    };
    const onLogout = vi.fn();

    act(() => {
      root.render(<AdminSidebar user={regularUser} onLogout={onLogout} />);
    });

    const text = container.textContent || '';
    // Personal tabs MUST be present
    expect(text).toContain('Tổng quan Cá nhân');
    expect(text).toContain('Hồ sơ & Bảo mật');

    // Admin-exclusive tabs MUST NOT be present
    expect(text).not.toContain('Cài đặt Thí nghiệm');
    expect(text).not.toContain('Quản lý Người dùng');
    expect(text).not.toContain('Kiểm duyệt Bình luận');
    expect(text).not.toContain('Cài đặt Nền tảng');
    expect(text).not.toContain('Quản trị Toàn sàn');
  });

  it('renders both personal tabs and admin management tabs for ADMIN role', () => {
    const adminUser: AuthUser = {
      id: 'admin-1',
      username: 'admin',
      email: 'admin@wonderlab.vn',
      role: 'ADMIN',
      createdAt: '2026-10-24T12:00:00.000Z',
      updatedAt: '2026-10-24T12:00:00.000Z',
    };
    const onLogout = vi.fn();

    act(() => {
      root.render(<AdminSidebar user={adminUser} onLogout={onLogout} />);
    });

    const text = container.textContent || '';
    // Both personal and admin tabs must be present
    expect(text).toContain('Tổng quan Cá nhân');
    expect(text).toContain('Hồ sơ & Bảo mật');
    expect(text).toContain('Quản trị Toàn sàn');
    expect(text).toContain('Tổng quan Hệ thống');
    expect(text).toContain('Cài đặt Thí nghiệm');
    expect(text).toContain('Quản lý Người dùng');
    expect(text).toContain('Kiểm duyệt Bình luận');
    expect(text).toContain('Cài đặt Nền tảng');
  });

  it('triggers onLogout callback when mobile drawer logout button is clicked and omits logout button from desktop sidebar', () => {
    const regularUser: AuthUser = {
      id: 'user-1',
      username: 'bohr',
      email: 'bohr@quantum.org',
      role: 'USER',
      createdAt: '2026-10-24T12:00:00.000Z',
      updatedAt: '2026-10-24T12:00:00.000Z',
    };
    const onLogout = vi.fn();

    act(() => {
      root.render(<AdminSidebar user={regularUser} onLogout={onLogout} />);
    });

    // Desktop sidebar intentionally omits logout button
    const desktopAside = container.querySelector('aside');
    expect(desktopAside?.querySelector('button[title="Đăng xuất"]')).toBeNull();
    expect(desktopAside?.querySelector('button[aria-label="Đăng xuất"]')).toBeNull();

    // Open mobile drawer
    const mobileToggle = container.querySelector(
      'button[aria-label="Toggle navigation"]',
    ) as HTMLButtonElement;
    expect(mobileToggle).toBeTruthy();

    act(() => {
      mobileToggle.click();
    });

    const logoutButtons = container.querySelectorAll('button[title="Đăng xuất"]');
    expect(logoutButtons.length).toBeGreaterThan(0);

    act(() => {
      (logoutButtons[0] as HTMLButtonElement).click();
    });

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
