import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useExplorationState } from "@/hooks/useExplorationState";
import { getProvinceBySlug } from "@/lib/provinceData";

describe("useExplorationState", () => {
  it("switches between C3 regions and keeps sidebar open when already opened", () => {
    const province = getProvinceBySlug("sichuan");
    if (!province) {
      throw new Error("Sample province not found");
    }

    const { result } = renderHook(() => useExplorationState(province));

    const firstRegion = province.regions[0];
    const secondRegion = province.regions[1];
    if (!firstRegion || !secondRegion) {
      throw new Error("Sample regions missing");
    }

    act(() => {
      result.current.handleUnitSelect("sichuan-partition-1", firstRegion.name);
    });
    expect(result.current.selectedRegion?.name).toBe(firstRegion.name);
    expect(result.current.selectedFood?.title).toBe(firstRegion.foods[0]?.title);
    expect(result.current.sidebarOpen).toBe(false);

    act(() => {
      result.current.handleFoodSelect(firstRegion.foods[1]?.title ?? firstRegion.foods[0].title);
    });
    expect(result.current.sidebarOpen).toBe(true);

    act(() => {
      result.current.handleUnitSelect("sichuan-partition-2", secondRegion.name);
    });
    expect(result.current.selectedRegion?.name).toBe(secondRegion.name);
    expect(result.current.selectedFood?.title).toBe(secondRegion.foods[0]?.title);
    expect(result.current.sidebarOpen).toBe(true);
  });

  it("auto-expands for direct-controlled municipalities without map click", () => {
    const province = getProvinceBySlug("beijing");
    if (!province) {
      throw new Error("Target province not found");
    }
    expect(province.regions.length).toBe(1);

    const { result } = renderHook(() => useExplorationState(province));

    expect(result.current.selectedRegion?.name).toBe(province.regions[0].name);
    expect(result.current.selectedFood?.title).toBe(province.regions[0].foods[0]?.title);
    expect(result.current.sidebarOpen).toBe(true);
  });

  it("keeps click-to-open behavior for non-municipality single-region provinces", () => {
    const province = getProvinceBySlug("taiwan");
    if (!province) {
      throw new Error("Target province not found");
    }
    expect(province.regions.length).toBe(1);

    const { result } = renderHook(() => useExplorationState(province));
    expect(result.current.sidebarOpen).toBe(false);

    act(() => {
      result.current.handleUnitSelect("taiwan-partition-1", province.regions[0].name);
    });

    expect(result.current.selectedRegion?.name).toBe(province.regions[0].name);
    expect(result.current.selectedFood?.title).toBe(province.regions[0].foods[0]?.title);
    expect(result.current.sidebarOpen).toBe(true);
  });
});
