import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { AppForm, AppFormField, AppFormSubmit, useAppFormContext } from '../index';

// @ts-expect-error global flag for react act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('AppForm & AppFormField Components', () => {
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

  // 1. Label and Input Association
  it('connects label to input via htmlFor and id, and renders red asterisk for required fields', () => {
    act(() => {
      root.render(
        <AppForm initialValues={{ username: '' }}>
          <AppFormField
            name="username"
            label="Tên đăng nhập (Username)"
            required
            placeholder="VD: admin"
          />
        </AppForm>,
      );
    });

    const label = container.querySelector('label');
    const input = container.querySelector('input');

    expect(label).not.toBeNull();
    expect(input).not.toBeNull();

    // Verify htmlFor matches input id
    const inputId = input?.getAttribute('id');
    expect(inputId).toBeDefined();
    expect(label?.getAttribute('for')).toBe(inputId);

    // Verify required red asterisk
    expect(label?.textContent).toContain('Tên đăng nhập (Username)');
    expect(label?.textContent).toContain('*');
    const asterisk = label?.querySelector('span');
    expect(asterisk?.textContent).toBe('*');
    expect(asterisk?.className).toContain('text-red-500');

    // Verify aria-required
    expect(input?.getAttribute('aria-required')).toBe('true');
  });

  it('does not render red asterisk when field is not required', () => {
    act(() => {
      root.render(
        <AppForm initialValues={{ note: '' }}>
          <AppFormField name="note" label="Ghi chú tùy chọn" />
        </AppForm>,
      );
    });

    const label = container.querySelector('label');
    expect(label?.textContent).toBe('Ghi chú tùy chọn');
    expect(label?.querySelector('span')).toBeNull();
  });

  // 2. Error Display under Input
  it('renders a list of small red errors under input when validation rules fail', async () => {
    const handleSubmit = vi.fn();
    const handleErr = vi.fn();

    act(() => {
      root.render(
        <AppForm initialValues={{ password: '' }} onSubmit={handleSubmit} onError={handleErr}>
          <AppFormField
            name="password"
            label="Mật khẩu"
            type="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { minLength: 8, message: 'Mật khẩu phải từ 8 ký tự' },
              { pattern: /[A-Z]/, message: 'Cần có ít nhất 1 chữ hoa' },
            ]}
          />
          <AppFormSubmit>Đăng ký</AppFormSubmit>
        </AppForm>,
      );
    });

    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    // Initially no errors visible
    expect(container.querySelector('[role="alert"]')).toBeNull();

    // Trigger submit to trigger validation
    await act(async () => {
      submitBtn.click();
    });

    // Submit should be prevented
    expect(handleSubmit).not.toHaveBeenCalled();
    expect(handleErr).toHaveBeenCalledTimes(1);

    // Error list should be visible under input
    const errorList = container.querySelector('ul[role="alert"]');
    expect(errorList).not.toBeNull();
    expect(errorList?.className).toContain('text-xs');
    expect(errorList?.className).toContain('text-red-600');

    const errorItems = errorList?.querySelectorAll('li');
    expect(errorItems?.length).toBe(1);
    expect(errorItems?.[0].textContent).toContain('Vui lòng nhập mật khẩu');

    // Now type a value that fails minLength and pattern
    const input = container.querySelector('input') as HTMLInputElement;
    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(input, 'abc');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    });

    // Re-verify list of failing errors
    const updatedErrorList = container.querySelector('ul[role="alert"]');
    expect(updatedErrorList).not.toBeNull();
    const items = updatedErrorList?.querySelectorAll('li');
    expect(items?.length).toBe(2);
    expect(items?.[0].textContent).toContain('Mật khẩu phải từ 8 ký tự');
    expect(items?.[1].textContent).toContain('Cần có ít nhất 1 chữ hoa');

    // Bullet points should have red color
    const bullets = updatedErrorList?.querySelectorAll('span.text-red-500');
    expect(bullets?.length).toBe(2);
  });

  // 3. Zod Schema Validation Support
  it('validates with Zod schema and reports errors on submit', async () => {
    const registerSchema = z.object({
      email: z.string().email('Địa chỉ email không hợp lệ'),
      username: z.string().min(3, 'Tên người dùng tối thiểu 3 ký tự'),
    });

    const handleSubmit = vi.fn();

    act(() => {
      root.render(
        <AppForm
          initialValues={{ email: 'invalid-email', username: 'ab' }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          <AppFormField name="email" label="Email" />
          <AppFormField name="username" label="Tên người dùng" />
          <AppFormSubmit>Gửi</AppFormSubmit>
        </AppForm>,
      );
    });

    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    await act(async () => {
      submitBtn.click();
    });

    expect(handleSubmit).not.toHaveBeenCalled();

    const alerts = container.querySelectorAll('[role="alert"]');
    expect(alerts.length).toBe(2);
    expect(container.textContent).toContain('Địa chỉ email không hợp lệ');
    expect(container.textContent).toContain('Tên người dùng tối thiểu 3 ký tự');
  });

  // 4. Successful Submission
  it('submits form successfully when values are valid', async () => {
    const handleSubmit = vi.fn();

    act(() => {
      root.render(
        <AppForm
          initialValues={{ email: 'researcher@wonderlab.vn', username: 'researcher' }}
          onSubmit={handleSubmit}
        >
          <AppFormField name="email" label="Email" rules={[{ required: true }, { email: true }]} />
          <AppFormField name="username" label="Username" rules={[{ required: true }]} />
          <AppFormSubmit>Xác nhận</AppFormSubmit>
        </AppForm>,
      );
    });

    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    await act(async () => {
      submitBtn.click();
    });

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      {
        email: 'researcher@wonderlab.vn',
        username: 'researcher',
      },
      expect.anything(),
    );
  });

  // 5. Password toggle support
  it('toggles password visibility when showPasswordToggle is enabled', async () => {
    act(() => {
      root.render(
        <AppForm initialValues={{ password: 'my-secret-password' }}>
          <AppFormField name="password" label="Mật khẩu" type="password" showPasswordToggle />
        </AppForm>,
      );
    });

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('password');

    const toggleBtn = container.querySelector(
      'button[aria-label="Hiển thị mật khẩu"]',
    ) as HTMLButtonElement;
    expect(toggleBtn).not.toBeNull();

    await act(async () => {
      toggleBtn.click();
    });

    expect(input.type).toBe('text');
    expect(container.querySelector('button[aria-label="Ẩn mật khẩu"]')).not.toBeNull();

    // Toggle back
    await act(async () => {
      (container.querySelector('button[aria-label="Ẩn mật khẩu"]') as HTMLButtonElement).click();
    });

    expect(input.type).toBe('password');
  });

  // 6. Custom Children and Render Props Support
  it('supports render props in AppFormField', async () => {
    act(() => {
      root.render(
        <AppForm initialValues={{ bio: 'Hello Wonderlab' }}>
          <AppFormField name="bio" label="Tiểu sử">
            {({ id, value, onChange, onBlur }) => (
              <textarea
                id={id}
                data-testid="custom-textarea"
                value={String(value ?? '')}
                onChange={onChange}
                onBlur={onBlur}
              />
            )}
          </AppFormField>
        </AppForm>,
      );
    });

    const textarea = container.querySelector(
      '[data-testid="custom-textarea"]',
    ) as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();
    expect(textarea.value).toBe('Hello Wonderlab');

    const label = container.querySelector('label');
    expect(label?.getAttribute('for')).toBe(textarea.id);
  });

  // 7. Standalone Mode without AppForm
  it('functions standalone with manual errors and value', () => {
    act(() => {
      root.render(
        <AppFormField
          name="standaloneField"
          label="Trường độc lập"
          required
          errors={['Lỗi mẫu số 1', 'Lỗi mẫu số 2']}
        />,
      );
    });

    const label = container.querySelector('label');
    expect(label?.textContent).toContain('Trường độc lập');
    expect(label?.textContent).toContain('*');

    const errorItems = container.querySelectorAll('ul[role="alert"] li');
    expect(errorItems.length).toBe(2);
    expect(errorItems[0].textContent).toContain('Lỗi mẫu số 1');
    expect(errorItems[1].textContent).toContain('Lỗi mẫu số 2');
  });

  // 8. useAppFormContext hook accessibility
  it('provides form state and control methods via useAppFormContext', () => {
    function CustomControls() {
      const { values, isSubmitting, isValid } = useAppFormContext<{ test: string }>();
      return (
        <div>
          <span data-testid="val">{values.test}</span>
          <span data-testid="submitting">{String(isSubmitting)}</span>
          <span data-testid="valid">{String(isValid)}</span>
        </div>
      );
    }

    act(() => {
      root.render(
        <AppForm initialValues={{ test: 'lab-value' }}>
          <AppFormField name="test" label="Test" />
          <CustomControls />
        </AppForm>,
      );
    });

    expect(container.querySelector('[data-testid="val"]')?.textContent).toBe('lab-value');
    expect(container.querySelector('[data-testid="submitting"]')?.textContent).toBe('false');
    expect(container.querySelector('[data-testid="valid"]')?.textContent).toBe('true');
  });
});
