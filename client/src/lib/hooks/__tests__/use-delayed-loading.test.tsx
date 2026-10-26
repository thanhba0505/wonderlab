import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDelayedLoading } from '../use-delayed-loading';

// @ts-expect-error global flag for react act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

interface TestHarnessProps {
  isLoading: boolean;
  delay?: number;
  minDuration?: number;
}

let latestValue = false;

function TestHarness({ isLoading, delay = 180, minDuration = 250 }: TestHarnessProps) {
  const showLoading = useDelayedLoading(isLoading, { delay, minDuration });
  latestValue = showLoading;
  return <div data-testid="status">{showLoading ? 'LOADING' : 'IDLE'}</div>;
}

describe('useDelayedLoading (Anti-Flicker Loading Hook)', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    latestValue = false;
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  it('does NOT show loading if operation finishes before delay threshold (grace period)', () => {
    act(() => {
      root.render(<TestHarness isLoading={true} delay={180} minDuration={250} />);
    });
    // Immediately after start, still in grace period
    expect(latestValue).toBe(false);

    // Fast response after 50ms (< 180ms)
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(latestValue).toBe(false);

    // Set isLoading to false before 180ms
    act(() => {
      root.render(<TestHarness isLoading={false} delay={180} minDuration={250} />);
    });
    expect(latestValue).toBe(false);

    // Advance time past 180ms: loader should NEVER have appeared!
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(latestValue).toBe(false);
  });

  it('shows loading after delay threshold passes for slower operations', () => {
    act(() => {
      root.render(<TestHarness isLoading={true} delay={180} minDuration={250} />);
    });
    expect(latestValue).toBe(false);

    // Advance to 180ms
    act(() => {
      vi.advanceTimersByTime(180);
    });
    expect(latestValue).toBe(true);

    // Stays true while operation is running (advance 300ms -> total 300ms visible > minDuration 250ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(latestValue).toBe(true);

    // Operation finishes after 300ms (> minDuration 250ms elapsed since shown)
    act(() => {
      root.render(<TestHarness isLoading={false} delay={180} minDuration={250} />);
    });
    expect(latestValue).toBe(false);
  });

  it('holds loading for minDuration if operation completes shortly after delay', () => {
    act(() => {
      root.render(<TestHarness isLoading={true} delay={180} minDuration={250} />);
    });

    // 180ms: Loader shows up
    act(() => {
      vi.advanceTimersByTime(180);
    });
    expect(latestValue).toBe(true);

    // Operation completes at 200ms (only 20ms of display time)
    act(() => {
      vi.advanceTimersByTime(20);
      root.render(<TestHarness isLoading={false} delay={180} minDuration={250} />);
    });
    // Must remain true because minimum 250ms has not passed yet!
    expect(latestValue).toBe(true);

    // Advance 220ms (total 240ms display time - still holding)
    act(() => {
      vi.advanceTimersByTime(220);
    });
    expect(latestValue).toBe(true);

    // Advance remaining 15ms (total > 250ms display time)
    act(() => {
      vi.advanceTimersByTime(15);
    });
    expect(latestValue).toBe(false);
  });

  it('shows immediately when delay is set to 0', () => {
    act(() => {
      root.render(<TestHarness isLoading={true} delay={0} minDuration={0} />);
    });
    expect(latestValue).toBe(true);

    act(() => {
      root.render(<TestHarness isLoading={false} delay={0} minDuration={0} />);
    });
    expect(latestValue).toBe(false);
  });
});
