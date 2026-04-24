import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProvinceExplorer } from "@/components/ProvinceExplorer";
import { getProvinceBySlug } from "@/lib/provinceData";

describe("ProvinceExplorer", () => {
  afterEach(() => {
    cleanup();
  });

  it("updates cards and opens sidebar after selecting a C3 partition", async () => {
    const province = getProvinceBySlug("sichuan");
    if (!province) {
      throw new Error("Sample province not found");
    }

    render(<ProvinceExplorer province={province} />);
    expect(await screen.findByText(/bzdt\.ch\.mnr\.gov\.cn/)).toBeInTheDocument();

    const targetRegion = province.regions[0];
    const secondRegion = province.regions[1];
    fireEvent.click(await screen.findByRole("button", { name: `${targetRegion.name}分区` }));
    expect(screen.getByRole("button", { name: targetRegion.foods[0].title })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: targetRegion.foods[1].title }));
    expect(await screen.findByText("起源故事")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { level: 2, name: targetRegion.foods[1].title })
    ).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("button", { name: `${secondRegion.name}分区` }));
    expect(screen.getByRole("button", { name: secondRegion.foods[0].title })).toBeInTheDocument();
  });

  it("auto-opens municipality content on entry and hides the default partition label", async () => {
    const province = getProvinceBySlug("beijing");
    if (!province) {
      throw new Error("Target province not found");
    }
    expect(province.regions.length).toBe(1);

    render(<ProvinceExplorer province={province} />);

    expect(await screen.findByText("起源故事")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: province.regions[0].foods[0].title })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "不分区分区" })).not.toBeInTheDocument();
    expect(screen.getByText("代表食味")).toBeInTheDocument();
  });
});
