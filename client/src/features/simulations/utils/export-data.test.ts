import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCsv, exportToJson, copyToClipboard } from './export-data';

describe('export-data utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportToCsv', () => {
    it('should create and trigger download with proper escaping', () => {
      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURLMock = vi.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      const clickMock = vi.fn();
      const realElement = document.createElement('a');
      realElement.click = clickMock;

      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') return realElement;
        return document.createElement(tagName);
      });

      exportToCsv(
        'test-report',
        ['Trial', 'Formula, "Special"', 'Value'],
        [[1, 'Text with, comma', 0.507]],
      );

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(realElement);
      expect(removeChildSpy).toHaveBeenCalledWith(realElement);
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
      expect(realElement.getAttribute('download')).toBe('test-report.csv');
    });
  });

  describe('exportToJson', () => {
    it('should create a JSON blob and trigger click', () => {
      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-json-url');
      const revokeObjectURLMock = vi.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      const clickMock = vi.fn();
      const realElement = document.createElement('a');
      realElement.click = clickMock;

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') return realElement;
        return document.createElement(tagName);
      });

      exportToJson('data-test', { groupSize: 23, collisions: 507 });

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-json-url');
      expect(realElement.getAttribute('download')).toBe('data-test.json');
    });
  });

  describe('copyToClipboard', () => {
    it('should write text to clipboard successfully', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const success = await copyToClipboard('# Test Report');
      expect(success).toBe(true);
      expect(writeTextMock).toHaveBeenCalledWith('# Test Report');
    });
  });
});
