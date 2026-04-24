import { describe, expect, it } from "vitest";
import { getAllProvinces, getProvinceBySlug } from "@/lib/provinceData";

describe("C3 structure alignment", () => {
  it("keeps all 34 provinces aligned with C3 region counts", () => {
    const provinces = getAllProvinces();
    expect(provinces.length).toBe(34);

    const distribution = provinces.reduce<Record<number, number>>((acc, province) => {
      const count = province.regions.length;
      acc[count] = (acc[count] ?? 0) + 1;
      return acc;
    }, {});

    expect(distribution[1]).toBe(7);
    expect(distribution[3]).toBe(8);
    expect(distribution[4]).toBe(10);
    expect(distribution[5]).toBe(9);
  });

  it("keeps key colloquial regions from C3 in sample provinces", () => {
    const sichuan = getProvinceBySlug("sichuan");
    const tibet = getProvinceBySlug("tibet");
    const xinjiang = getProvinceBySlug("xinjiang");

    expect(sichuan?.regions.map((region) => region.name)).toEqual(
      expect.arrayContaining(["成都平原", "川南", "川西"])
    );
    expect(tibet?.regions.map((region) => region.name)).toEqual(
      expect.arrayContaining(["藏南"])
    );
    expect(xinjiang?.regions.map((region) => region.name)).toEqual(
      expect.arrayContaining(["北疆", "南疆", "东疆"])
    );
  });
});
