import { ProvinceDetailMapData } from "@/types";

export type ProvinceDetailLoader = () => Promise<ProvinceDetailMapData>;

export const provinceDetailMapLoaders: Record<string, ProvinceDetailLoader> = {
  "beijing": () => import("./beijing").then((module) => module.default),
  "tianjin": () => import("./tianjin").then((module) => module.default),
  "hebei": () => import("./hebei").then((module) => module.default),
  "shanxi": () => import("./shanxi").then((module) => module.default),
  "inner-mongolia": () => import("./inner-mongolia").then((module) => module.default),
  "liaoning": () => import("./liaoning").then((module) => module.default),
  "jilin": () => import("./jilin").then((module) => module.default),
  "heilongjiang": () => import("./heilongjiang").then((module) => module.default),
  "shanghai": () => import("./shanghai").then((module) => module.default),
  "jiangsu": () => import("./jiangsu").then((module) => module.default),
  "zhejiang": () => import("./zhejiang").then((module) => module.default),
  "anhui": () => import("./anhui").then((module) => module.default),
  "fujian": () => import("./fujian").then((module) => module.default),
  "jiangxi": () => import("./jiangxi").then((module) => module.default),
  "shandong": () => import("./shandong").then((module) => module.default),
  "henan": () => import("./henan").then((module) => module.default),
  "hubei": () => import("./hubei").then((module) => module.default),
  "hunan": () => import("./hunan").then((module) => module.default),
  "guangdong": () => import("./guangdong").then((module) => module.default),
  "guangxi": () => import("./guangxi").then((module) => module.default),
  "hainan": () => import("./hainan").then((module) => module.default),
  "chongqing": () => import("./chongqing").then((module) => module.default),
  "sichuan": () => import("./sichuan").then((module) => module.default),
  "guizhou": () => import("./guizhou").then((module) => module.default),
  "yunnan": () => import("./yunnan").then((module) => module.default),
  "tibet": () => import("./tibet").then((module) => module.default),
  "shaanxi": () => import("./shaanxi").then((module) => module.default),
  "gansu": () => import("./gansu").then((module) => module.default),
  "qinghai": () => import("./qinghai").then((module) => module.default),
  "ningxia": () => import("./ningxia").then((module) => module.default),
  "xinjiang": () => import("./xinjiang").then((module) => module.default),
  "hong-kong": () => import("./hong-kong").then((module) => module.default),
  "macau": () => import("./macau").then((module) => module.default),
  "taiwan": () => import("./taiwan").then((module) => module.default),
};

export const loadProvinceDetailMap = (slug: string) => provinceDetailMapLoaders[slug]?.();
