import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AppButton,
  AppInput,
  AppSelect,
  AppTag,
  AppFilter,
  AppTable,
  AppTableFilter,
  AppPagination,
} from '../index';

// @ts-expect-error global flag for react act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Wonderlab Design System Core Components', () => {
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

  // ----------------------------------------------------
  // AppButton Tests
  // ----------------------------------------------------
  describe('AppButton', () => {
    it('renders with default props and handles click events', () => {
      const handleClick = vi.fn();
      act(() => {
        root.render(<AppButton onClick={handleClick}>Bắt đầu thí nghiệm</AppButton>);
      });

      const button = container.querySelector('button');
      expect(button).not.toBeNull();
      expect(button?.textContent).toBe('Bắt đầu thí nghiệm');

      act(() => {
        button?.click();
      });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders loading state with spinner and disables button', () => {
      const handleClick = vi.fn();
      act(() => {
        root.render(
          <AppButton isLoading loadingText="Đang tính toán..." onClick={handleClick}>
            Tính xác suất
          </AppButton>,
        );
      });

      const button = container.querySelector('button');
      expect(button?.getAttribute('disabled')).toBeDefined();
      expect(button?.getAttribute('aria-busy')).toBe('true');
      expect(button?.textContent).toContain('Đang tính toán...');

      act(() => {
        button?.click();
      });
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders left and right icons properly', () => {
      act(() => {
        root.render(
          <AppButton
            leftIcon={<span data-testid="left-icon">Left</span>}
            rightIcon={<span data-testid="right-icon">Right</span>}
          >
            Hành động
          </AppButton>,
        );
      });

      expect(container.querySelector('[data-testid="left-icon"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="right-icon"]')).not.toBeNull();
      expect(container.textContent).toContain('Hành động');
    });
  });

  // ----------------------------------------------------
  // AppInput Tests
  // ----------------------------------------------------
  describe('AppInput', () => {
    it('renders with label, placeholder, and helper text', () => {
      act(() => {
        root.render(
          <AppInput
            id="test-input"
            label="Số lượng mẫu"
            placeholder="Nhập số từ 1 đến 100"
            helperText="Dữ liệu mẫu cho mô phỏng Monte Carlo"
          />,
        );
      });

      const label = container.querySelector('label');
      expect(label?.textContent).toBe('Số lượng mẫu');

      const input = container.querySelector('input');
      expect(input?.placeholder).toBe('Nhập số từ 1 đến 100');

      expect(container.textContent).toContain('Dữ liệu mẫu cho mô phỏng Monte Carlo');
    });

    it('renders error message when error prop is provided', () => {
      act(() => {
        root.render(<AppInput error="Giá trị không được nhỏ hơn 1" />);
      });

      expect(container.textContent).toContain('Giá trị không được nhỏ hơn 1');
    });

    it('handles clearable button when value is present', () => {
      const handleClear = vi.fn();
      act(() => {
        root.render(
          <AppInput value="Monty Hall" onChange={() => {}} clearable onClear={handleClear} />,
        );
      });

      const clearBtn = container.querySelector('button[aria-label="Xoá nội dung"]');
      expect(clearBtn).not.toBeNull();

      act(() => {
        (clearBtn as HTMLButtonElement).click();
      });
      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------
  // AppSelect Tests
  // ----------------------------------------------------
  describe('AppSelect', () => {
    it('renders options array and responds to change', () => {
      const handleChange = vi.fn();
      const options = [
        { value: 'all', label: 'Tất cả danh mục' },
        { value: 'physics', label: 'Vật lý lượng tử' },
        { value: 'math', label: 'Nghịch lý toán học' },
      ];

      act(() => {
        root.render(
          <AppSelect
            label="Chọn chủ đề"
            options={options}
            value="physics"
            onChange={handleChange}
          />,
        );
      });

      const select = container.querySelector('select');
      expect(select).not.toBeNull();
      expect(select?.value).toBe('physics');

      act(() => {
        if (select) {
          select.value = 'math';
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      expect(handleChange).toHaveBeenCalled();
    });

    it('renders placeholder correctly', () => {
      act(() => {
        root.render(
          <AppSelect placeholder="Chọn trạng thái..." options={[]}>
            <option value="1">Lựa chọn 1</option>
          </AppSelect>,
        );
      });

      const options = container.querySelectorAll('option');
      expect(options[0].textContent).toBe('Chọn trạng thái...');
    });

    it('opens custom styled options dropdown when clicking trigger button and selects an item', () => {
      const handleValueChange = vi.fn();
      const options = [
        { value: 'light', label: 'Lưỡng tính sóng hạt' },
        { value: 'schrodinger', label: 'Con mèo của Schrödinger' },
      ];

      act(() => {
        root.render(
          <AppSelect
            placeholder="Chọn mô phỏng..."
            options={options}
            onValueChange={handleValueChange}
          />,
        );
      });

      // Initially, listbox is closed
      expect(container.querySelector('[role="listbox"]')).toBeNull();

      const triggerBtn = container.querySelector('button[role="combobox"]');
      expect(triggerBtn).not.toBeNull();
      expect(triggerBtn?.getAttribute('aria-expanded')).toBe('false');

      // Click to open custom dropdown
      act(() => {
        (triggerBtn as HTMLButtonElement).click();
      });

      expect(triggerBtn?.getAttribute('aria-expanded')).toBe('true');
      const listbox = container.querySelector('[role="listbox"]');
      expect(listbox).not.toBeNull();

      // Custom option items
      const optionItems = container.querySelectorAll('[role="option"]');
      expect(optionItems.length).toBe(2);
      expect(optionItems[0].textContent).toContain('Lưỡng tính sóng hạt');
      expect(optionItems[1].textContent).toContain('Con mèo của Schrödinger');

      // Click the second custom option
      act(() => {
        (optionItems[1] as HTMLElement).click();
      });

      expect(handleValueChange).toHaveBeenCalledWith('schrodinger');
      // Dropdown closes after selection
      expect(container.querySelector('[role="listbox"]')).toBeNull();
      expect(triggerBtn?.textContent).toContain('Con mèo của Schrödinger');
    });

    it('supports keyboard navigation with ArrowDown, Enter, and Escape', () => {
      const options = [
        { value: 'a', label: 'Lựa chọn A' },
        { value: 'b', label: 'Lựa chọn B' },
      ];

      act(() => {
        root.render(<AppSelect options={options} />);
      });

      const triggerBtn = container.querySelector('button[role="combobox"]');
      expect(triggerBtn).not.toBeNull();

      // Press ArrowDown on trigger to open
      act(() => {
        triggerBtn?.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
        );
      });

      expect(container.querySelector('[role="listbox"]')).not.toBeNull();

      // Press Escape to close
      act(() => {
        triggerBtn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      });

      expect(container.querySelector('[role="listbox"]')).toBeNull();
    });
  });

  // ----------------------------------------------------
  // AppTag Tests
  // ----------------------------------------------------
  describe('AppTag', () => {
    it('renders tag with variant and dot indicator', () => {
      act(() => {
        root.render(
          <AppTag variant="emerald" dot>
            Đang hoạt động
          </AppTag>,
        );
      });

      expect(container.textContent).toContain('Đang hoạt động');
      // Dot span exists
      const dot = container.querySelector('span.rounded-full');
      expect(dot).not.toBeNull();
    });

    it('handles onRemove callback when removable is true', () => {
      const handleRemove = vi.fn();
      act(() => {
        root.render(
          <AppTag removable onRemove={handleRemove}>
            Toán học
          </AppTag>,
        );
      });

      const removeBtn = container.querySelector('button[aria-label="Xoá thẻ"]');
      expect(removeBtn).not.toBeNull();

      act(() => {
        (removeBtn as HTMLButtonElement).click();
      });
      expect(handleRemove).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------
  // AppFilter Tests
  // ----------------------------------------------------
  describe('AppFilter', () => {
    it('renders search input, filter selects, and triggers onReset', () => {
      const handleSearch = vi.fn();
      const handleReset = vi.fn();
      const handleFilterChange = vi.fn();

      act(() => {
        root.render(
          <AppFilter
            searchValue="Zeno"
            onSearchChange={handleSearch}
            filters={[
              {
                id: 'status',
                value: 'active',
                options: [
                  { value: 'all', label: 'Tất cả' },
                  { value: 'active', label: 'Kích hoạt' },
                ],
                onChange: handleFilterChange,
              },
            ]}
            activeFilters={[
              {
                id: 'status',
                label: 'Trạng thái',
                valueLabel: 'Kích hoạt',
                onRemove: vi.fn(),
              },
            ]}
            onReset={handleReset}
          />,
        );
      });

      expect(container.textContent).toContain('Đang lọc:');
      expect(container.textContent).toContain('Trạng thái:');
      expect(container.textContent).toContain('Kích hoạt');

      const resetBtn = Array.from(container.querySelectorAll('button')).find(btn =>
        btn.textContent?.includes('Đặt lại'),
      );
      expect(resetBtn).not.toBeNull();

      act(() => {
        resetBtn?.click();
      });
      expect(handleReset).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------
  // AppTable Tests
  // ----------------------------------------------------
  describe('AppTable', () => {
    interface TestData {
      id: string;
      name: string;
      trials: number;
    }

    const testColumns = [
      { key: 'name', header: 'Tên thí nghiệm', sortable: true },
      {
        key: 'trials',
        header: 'Số lượt thử',
        align: 'right' as const,
        render: (item: TestData) => `${item.trials} lượt`,
      },
    ];

    const testData: TestData[] = [
      { id: '1', name: 'Monty Hall', trials: 120 },
      { id: '2', name: 'Nghịch lý Zeno', trials: 85 },
    ];

    it('renders table columns and rows accurately', () => {
      act(() => {
        root.render(<AppTable columns={testColumns} data={testData} />);
      });

      expect(container.textContent).toContain('Tên thí nghiệm');
      expect(container.textContent).toContain('Số lượt thử');
      expect(container.textContent).toContain('Monty Hall');
      expect(container.textContent).toContain('120 lượt');
      expect(container.textContent).toContain('Nghịch lý Zeno');
    });

    it('triggers onSort when clicking sortable header', () => {
      const handleSort = vi.fn();
      act(() => {
        root.render(
          <AppTable
            columns={testColumns}
            data={testData}
            sortColumn="name"
            sortDirection="asc"
            onSort={handleSort}
          />,
        );
      });

      const header = container.querySelector('th');
      act(() => {
        header?.click();
      });
      expect(handleSort).toHaveBeenCalledWith('name');
    });

    it('supports row selection with checkboxes', () => {
      const handleSelectChange = vi.fn();
      act(() => {
        root.render(
          <AppTable
            columns={testColumns}
            data={testData}
            selectable
            selectedKeys={['1']}
            onSelectChange={handleSelectChange}
          />,
        );
      });

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(3); // 1 header + 2 rows

      // Select all checkbox
      act(() => {
        (checkboxes[0] as HTMLInputElement).click();
      });
      expect(handleSelectChange).toHaveBeenCalled();
    });

    it('renders loading state when isLoading is true', () => {
      act(() => {
        root.render(
          <AppTable
            columns={testColumns}
            data={[]}
            isLoading
            loadingMessage="Đang nạp dữ liệu..."
          />,
        );
      });

      expect(container.textContent).toContain('Đang nạp dữ liệu...');
    });
  });

  // ----------------------------------------------------
  // AppPagination Tests
  // ----------------------------------------------------
  describe('AppPagination', () => {
    it('renders pagination details and handles navigation', () => {
      const handlePageChange = vi.fn();
      act(() => {
        root.render(
          <AppPagination page={1} pageSize={10} total={25} onPageChange={handlePageChange} />,
        );
      });

      expect(container.textContent).toContain('Hiển thị 1 - 10 trong số 25 kết quả');

      const nextBtn = container.querySelector('button[aria-label="Trang kế tiếp"]');
      expect(nextBtn).not.toBeNull();

      act(() => {
        (nextBtn as HTMLButtonElement).click();
      });
      expect(handlePageChange).toHaveBeenCalledWith(2);
    });
  });

  // ----------------------------------------------------
  // AppTableFilter Compound Tests
  // ----------------------------------------------------
  describe('AppTableFilter', () => {
    it('integrates header, filter, table, and client-side pagination seamlessly', () => {
      const data = [
        { id: '1', title: 'Bài viết 1' },
        { id: '2', title: 'Bài viết 2' },
        { id: '3', title: 'Bài viết 3' },
      ];

      const columns = [{ key: 'title', header: 'Tiêu đề' }];

      act(() => {
        root.render(
          <AppTableFilter
            header={{
              title: 'Thư Viện Bài Viết',
              description: 'Danh sách các chuyên luận khoa học',
            }}
            searchValue=""
            onSearchChange={vi.fn()}
            columns={columns}
            data={data}
            clientSidePagination
            pageSize={2}
          />,
        );
      });

      expect(container.textContent).toContain('Thư Viện Bài Viết');
      expect(container.textContent).toContain('Danh sách các chuyên luận khoa học');
      expect(container.textContent).toContain('Bài viết 1');
      expect(container.textContent).toContain('Bài viết 2');
      // Because pageSize is 2, item 3 is on page 2!
      expect(container.textContent).not.toContain('Bài viết 3');
      expect(container.textContent).toContain('Hiển thị 1 - 2 trong số 3 kết quả');
    });
  });
});
