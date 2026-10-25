import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthModal } from '../auth-modal';
import * as authContext from '@/lib/auth-context';

// @ts-expect-error global flag for react act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/lib/auth-context', () => ({
  useAuth: vi.fn(),
}));

describe('AuthModal (Register flow)', () => {
  let container: HTMLDivElement;
  let root: Root;
  const mockRegister = vi.fn();
  const mockClose = vi.fn();

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    mockRegister.mockReset();
    mockClose.mockReset();

    vi.mocked(authContext.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthModalOpen: true,
      authModalMode: 'register',
      pendingEmail: '',
      isProfileModalOpen: false,
      openAuthModal: vi.fn(),
      closeAuthModal: mockClose,
      openProfileModal: vi.fn(),
      closeProfileModal: vi.fn(),
      login: vi.fn(),
      register: mockRegister,
      verifyEmail: vi.fn(),
      resendOtp: vi.fn(),
      loginWithGoogle: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      changePassword: vi.fn(),
      setPassword: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function changeInput(input: HTMLInputElement, value: string) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  it('allows registering with simple password and arbitrary email in development', async () => {
    mockRegister.mockResolvedValue({ success: true, email: 'test_dev', devOtpCode: '123456' });

    await act(async () => {
      root.render(<AuthModal />);
    });

    const inputs = container.querySelectorAll('input');
    const usernameInput = inputs[0];
    const emailInput = inputs[1];
    const passwordInput = inputs[2];

    expect(usernameInput).toBeDefined();
    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();

    // Fill in arbitrary values
    await act(async () => {
      changeInput(usernameInput, 'dev_user');
      changeInput(emailInput, 'arbitrary_email');
      changeInput(passwordInput, '123');
    });

    const form = container.querySelector('form');
    expect(form).not.toBeNull();

    await act(async () => {
      form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockRegister).toHaveBeenCalledWith('dev_user', 'arbitrary_email', '123');
  });
});
