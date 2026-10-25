import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppInput } from '../app-input';

// @ts-expect-error global flag for react act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('AppInput', () => {
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

  it('renders label with required indicator and connects htmlFor to input id', async () => {
    await act(async () => {
      root.render(
        <AppInput
          label="Mật khẩu"
          id="test-pwd"
          type="password"
          required
          placeholder="Nhập mật khẩu..."
        />,
      );
    });

    const label = container.querySelector('label');
    const input = container.querySelector('input');

    expect(label).not.toBeNull();
    expect(label?.getAttribute('for')).toBe('test-pwd');
    expect(label?.textContent).toContain('Mật khẩu');
    expect(label?.textContent).toContain('*');
    expect(input?.id).toBe('test-pwd');
    expect(input?.placeholder).toBe('Nhập mật khẩu...');
  });

  it('toggles password visibility when showPasswordToggle is enabled', async () => {
    await act(async () => {
      root.render(
        <AppInput
          label="Mật khẩu bí mật"
          type="password"
          showPasswordToggle
          value="secret123"
          readOnly
        />,
      );
    });

    const input = container.querySelector('input');
    expect(input?.type).toBe('password');

    const toggleButton = container.querySelector('button[aria-label="Hiển thị mật khẩu"]');
    expect(toggleButton).not.toBeNull();

    await act(async () => {
      toggleButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(input?.type).toBe('text');

    const hideButton = container.querySelector('button[aria-label="Ẩn mật khẩu"]');
    expect(hideButton).not.toBeNull();

    await act(async () => {
      hideButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(input?.type).toBe('password');
  });
});
