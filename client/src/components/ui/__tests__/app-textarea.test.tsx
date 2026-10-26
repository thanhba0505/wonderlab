import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AppTextArea } from '../app-textarea';
import { AppForm, AppFormField } from '../index';

// @ts-expect-error global flag for react act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('AppTextArea', () => {
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

  it('renders label with required indicator and connects htmlFor to textarea id', async () => {
    await act(async () => {
      root.render(
        <AppTextArea
          label="Ghi chú phản biện"
          id="test-notes"
          required
          placeholder="Nhập ghi chú chi tiết..."
          rows={4}
        />,
      );
    });

    const label = container.querySelector('label');
    const textarea = container.querySelector('textarea');

    expect(label).not.toBeNull();
    expect(label?.getAttribute('for')).toBe('test-notes');
    expect(label?.textContent).toContain('Ghi chú phản biện');
    expect(label?.textContent).toContain('*');
    expect(textarea?.id).toBe('test-notes');
    expect(textarea?.placeholder).toBe('Nhập ghi chú chi tiết...');
    expect(textarea?.getAttribute('rows')).toBe('4');
  });

  it('displays character counter when showCount is enabled', async () => {
    await act(async () => {
      root.render(<AppTextArea value="Newton" readOnly showCount maxLength={100} />);
    });

    const countSpan = container.querySelector('span.font-mono');
    expect(countSpan).not.toBeNull();
    expect(countSpan?.textContent).toBe('6/100');
  });

  it('renders error messages and applies error border class', async () => {
    await act(async () => {
      root.render(
        <AppTextArea
          label="Mô tả"
          error="Nội dung không được ngắn hơn 20 ký tự"
          value="Quá ngắn"
          readOnly
        />,
      );
    });

    const textarea = container.querySelector('textarea');
    expect(textarea?.className).toContain('border-red-500');

    const errorMessage = container.querySelector('p[role="alert"]');
    expect(errorMessage).not.toBeNull();
    expect(errorMessage?.textContent).toBe('Nội dung không được ngắn hơn 20 ký tự');
  });

  it('supports clearable functionality and calls onClear', async () => {
    const handleClear = vi.fn();
    await act(async () => {
      root.render(<AppTextArea defaultValue="Một ý tưởng hay" clearable onClear={handleClear} />);
    });

    const clearButton = container.querySelector('button[aria-label="Xoá nội dung"]');
    expect(clearButton).not.toBeNull();

    await act(async () => {
      clearButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleClear).toHaveBeenCalledTimes(1);
    const textarea = container.querySelector('textarea');
    expect(textarea?.value).toBe('');
  });

  it('integrates seamlessly with AppFormField using multiline prop', async () => {
    await act(async () => {
      root.render(
        <AppForm initialValues={{ notes: 'Kế hoạch thí nghiệm' }}>
          <AppFormField
            name="notes"
            label="Ghi chú kế hoạch"
            multiline
            rows={5}
            showCount
            maxLength={500}
          />
        </AppForm>,
      );
    });

    const label = container.querySelector('label');
    const textarea = container.querySelector('textarea');
    const countSpan = container.querySelector('span.font-mono');

    expect(label?.textContent).toContain('Ghi chú kế hoạch');
    expect(textarea).not.toBeNull();
    expect(textarea?.getAttribute('rows')).toBe('5');
    expect(textarea?.value).toBe('Kế hoạch thí nghiệm');
    expect(countSpan?.textContent).toBe('19/500');
  });
});
