import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeExperience } from "@/components/HomeExperience";
import { onboardingStorageKey } from "@/lib/mapCompliance";

vi.mock("@/components/ChinaMap", () => ({
  ChinaMap: () => <div data-testid="china-map-mock" />
}));

describe("HomeExperience onboarding", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows guide modal on first visit", () => {
    render(<HomeExperience />);
    expect(screen.getByRole("dialog", { name: "首页使用指南" })).toBeInTheDocument();
  });

  it("persists seen flag when guide is closed", () => {
    render(<HomeExperience />);
    fireEvent.click(screen.getByRole("button", { name: "我知道了" }));

    expect(screen.queryByRole("dialog", { name: "首页使用指南" })).not.toBeInTheDocument();
    expect(window.localStorage.getItem(onboardingStorageKey)).toBe("1");
  });

  it("allows manual reopening from the guide button", () => {
    window.localStorage.setItem(onboardingStorageKey, "1");
    render(<HomeExperience />);

    expect(screen.queryByRole("dialog", { name: "首页使用指南" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "使用指南" }));
    expect(screen.getByRole("dialog", { name: "首页使用指南" })).toBeInTheDocument();
  });
});
