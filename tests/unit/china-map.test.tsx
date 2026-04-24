import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChinaMap } from "@/components/ChinaMap";

describe("ChinaMap", () => {
  afterEach(() => {
    cleanup();
  });

  it("calls onProvinceSelect after province click transition delay", () => {
    vi.useFakeTimers();
    const onProvinceSelect = vi.fn();
    render(<ChinaMap onProvinceSelect={onProvinceSelect} />);

    fireEvent.click(screen.getByTestId("province-sichuan"));
    expect(onProvinceSelect).not.toHaveBeenCalled();

    vi.advanceTimersByTime(600);
    expect(onProvinceSelect).toHaveBeenCalledWith("sichuan");

    vi.useRealTimers();
  });

  it("supports hitPath click for small provinces", () => {
    vi.useFakeTimers();
    const onProvinceSelect = vi.fn();
    const { container } = render(<ChinaMap onProvinceSelect={onProvinceSelect} />);

    const hitPath = container.querySelector('path[d*="A 10 10 0 1 0"]');
    expect(hitPath).not.toBeNull();
    if (hitPath) {
      fireEvent.click(hitPath);
    }

    vi.advanceTimersByTime(600);
    expect(onProvinceSelect).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("renders south china sea inset", () => {
    const { container } = render(<ChinaMap onProvinceSelect={vi.fn()} />);
    const insetLabel = container.querySelector('text[x="854"][y="614"]');
    const allLabels = Array.from(container.querySelectorAll("text")).map((node) => node.textContent ?? "");

    expect(insetLabel).not.toBeNull();
    expect(insetLabel?.textContent).toBe("南海诸岛");
    expect(container.querySelector('path[d="M 772 452 L 936 452 L 936 620 L 772 620 Z"]')).not.toBeNull();
    expect(allLabels).toContain("南沙群岛");
    expect(allLabels).toContain("西沙群岛");
  });

  it("renders map compliance note for contest submission", () => {
    render(<ChinaMap onProvinceSelect={vi.fn()} />);
    const note = screen.getByTestId("map-compliance-note");

    expect(note).toHaveTextContent("审图号：提交前补齐");
    expect(note).toHaveTextContent("http://bzdt.ch.mnr.gov.cn/");
    expect(note).toHaveTextContent("南海诸岛");
  });
});
