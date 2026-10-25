import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AppDropdown,
  AppDropdownItem,
  AppDropdownHeader,
  AppDropdownSeparator,
  AppDropdownLabel,
  AppDropdownGroup,
} from '../index';

// @ts-expect-error global flag for react act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('AppDropdown Component', () => {
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

  it('renders trigger button and starts closed by default', () => {
    act(() => {
      root.render(
        <AppDropdown trigger={<button id="my-trigger">Tùy chọn</button>}>
          <AppDropdownItem>Mục 1</AppDropdownItem>
        </AppDropdown>,
      );
    });

    const trigger = container.querySelector('#my-trigger');
    expect(trigger).not.toBeNull();
    expect(trigger?.textContent).toBe('Tùy chọn');
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it('opens and closes dropdown on trigger click', () => {
    act(() => {
      root.render(
        <AppDropdown trigger={<button id="toggle-btn">Mở Menu</button>}>
          <AppDropdownItem>Mục 1</AppDropdownItem>
          <AppDropdownItem>Mục 2</AppDropdownItem>
        </AppDropdown>,
      );
    });

    const trigger = container.querySelector('#toggle-btn');
    expect(container.querySelector('[role="menu"]')).toBeNull();

    // Click to open
    act(() => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.querySelector('[role="menu"]')).not.toBeNull();
    expect(container.textContent).toContain('Mục 1');
    expect(container.textContent).toContain('Mục 2');

    // Click to close
    act(() => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it('renders header, label, separator, items and groups properly', () => {
    act(() => {
      root.render(
        <AppDropdown defaultOpen trigger={<button>Open</button>}>
          <AppDropdownHeader>
            <span>User Info</span>
          </AppDropdownHeader>
          <AppDropdownLabel>Tài khoản</AppDropdownLabel>
          <AppDropdownGroup>
            <AppDropdownItem href="/my-account">Thông tin tài khoản</AppDropdownItem>
          </AppDropdownGroup>
          <AppDropdownSeparator />
          <AppDropdownGroup>
            <AppDropdownItem variant="danger">Đăng xuất</AppDropdownItem>
          </AppDropdownGroup>
        </AppDropdown>,
      );
    });

    expect(container.textContent).toContain('User Info');
    expect(container.textContent).toContain('Tài khoản');
    expect(container.textContent).toContain('Thông tin tài khoản');
    expect(container.textContent).toContain('Đăng xuất');
    expect(container.querySelector('[role="separator"]')).not.toBeNull();

    const link = container.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('/my-account');
  });

  it('handles item click and auto-closes dropdown', () => {
    const handleAction = vi.fn();

    act(() => {
      root.render(
        <AppDropdown defaultOpen trigger={<button>Open</button>}>
          <AppDropdownItem onClick={handleAction}>Thực hiện hành động</AppDropdownItem>
        </AppDropdown>,
      );
    });

    expect(container.querySelector('[role="menu"]')).not.toBeNull();

    const itemBtn = container.querySelector('button[role="menuitem"]');
    expect(itemBtn).not.toBeNull();

    act(() => {
      itemBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it('respects preventClose on item', () => {
    const handleAction = vi.fn();

    act(() => {
      root.render(
        <AppDropdown defaultOpen trigger={<button>Open</button>}>
          <AppDropdownItem onClick={handleAction} preventClose>
            Không đóng menu
          </AppDropdownItem>
        </AppDropdown>,
      );
    });

    const itemBtn = container.querySelector('button[role="menuitem"]');
    act(() => {
      itemBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[role="menu"]')).not.toBeNull();
  });

  it('closes when clicking outside', () => {
    act(() => {
      root.render(
        <AppDropdown defaultOpen trigger={<button>Open</button>}>
          <AppDropdownItem>Item</AppDropdownItem>
        </AppDropdown>,
      );
    });

    expect(container.querySelector('[role="menu"]')).not.toBeNull();

    // Click outside on body
    act(() => {
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it('closes when pressing Escape key', () => {
    act(() => {
      root.render(
        <AppDropdown defaultOpen trigger={<button>Open</button>}>
          <AppDropdownItem>Item</AppDropdownItem>
        </AppDropdown>,
      );
    });

    expect(container.querySelector('[role="menu"]')).not.toBeNull();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it('supports controlled isOpen and onOpenChange', () => {
    const handleOpenChange = vi.fn();

    act(() => {
      root.render(
        <AppDropdown
          isOpen={true}
          onOpenChange={handleOpenChange}
          trigger={<button id="ctrl-btn">Open</button>}
        >
          <AppDropdownItem>Controlled item</AppDropdownItem>
        </AppDropdown>,
      );
    });

    expect(container.querySelector('[role="menu"]')).not.toBeNull();

    const trigger = container.querySelector('#ctrl-btn');
    act(() => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
