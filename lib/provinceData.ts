import rawProvinces from "@/data/provinces.json";
import { Food, Province, Region } from "@/types";

const provinces = rawProvinces as Province[];

export const getAllProvinces = () => provinces;

export const getProvinceBySlug = (slug: string) =>
  provinces.find((province) => province.slug === slug);

export const getSampleProvinceSlugs = () =>
  provinces.filter((province) => province.regions.length > 0).map((province) => province.slug);

export const getRegionByName = (province: Province, regionName: string): Region | undefined =>
  province.regions.find((region) => region.name === regionName);

export const getRegionFoods = (provinceSlug: string, regionName: string): Food[] => {
  const province = getProvinceBySlug(provinceSlug);
  if (!province) {
    return [];
  }
  return getRegionByName(province, regionName)?.foods ?? [];
};

