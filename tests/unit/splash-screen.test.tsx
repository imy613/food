import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SplashScreen } from "@/components/SplashScreen";

describe("SplashScreen", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders real province paths for splash map", () => {
    render(<SplashScreen onComplete={vi.fn()} />);

    expect(screen.getByTestId("splash-province-sichuan")).toBeInTheDocument();
    expect(screen.getByTestId("splash-province-beijing")).toBeInTheDocument();
  });

  it("calls onComplete after splash duration", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<SplashScreen onComplete={onComplete} />);

    vi.advanceTimersByTime(2599);
    expect(onComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("completes normally when reduced motion is preferred", () => {
    vi.useFakeTimers();
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    });

    const onComplete = vi.fn();
    render(<SplashScreen onComplete={onComplete} />);

    vi.advanceTimersByTime(2600);
    expect(onComplete).toHaveBeenCalledTimes(1);

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: originalMatchMedia
    });
  });
});

