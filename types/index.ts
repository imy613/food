export type Food = {
  title: string;
  image: string;
  story: string;
  craft: string;
  culture: string;
  dialect: string;
  heritage: string;
};

export type Region = {
  name: string;
  foods: Food[];
};

export type Province = {
  name: string;
  slug: string;
  regions: Region[];
};

export type ProvinceShape = {
  slug: string;
  name: string;
  path: string;
  hitPath?: string;
  group?: "mainland" | "coastal" | "inset";
  label: {
    x: number;
    y: number;
    textAnchor?: "start" | "middle" | "end";
    fontSize?: number;
    lineTo?: {
      x: number;
      y: number;
    };
  };
};

export type SouthChinaSeaInset = {
  frame: string;
  islands: string[];
  dashLine?: string;
  boundaryArcs?: string[];
  surfacePoints?: Array<{
    x: number;
    y: number;
  }>;
  submergedPoints?: Array<{
    x: number;
    y: number;
  }>;
  groupLabels?: Array<{
    text: string;
    x: number;
    y: number;
    textAnchor?: "start" | "middle" | "end";
    lineTo?: {
      x: number;
      y: number;
    };
  }>;
  featureLabels?: Array<{
    text: string;
    x: number;
    y: number;
    textAnchor?: "start" | "middle" | "end";
    lineTo?: {
      x: number;
      y: number;
    };
  }>;
  label: {
    x: number;
    y: number;
  };
};

export type ProvinceUnitShape = {
  id: string;
  name: string;
  path: string;
  hitPath?: string;
  label: {
    x: number;
    y: number;
    textAnchor?: "start" | "middle" | "end";
    fontSize?: number;
    lineTo?: {
      x: number;
      y: number;
    };
  };
};

export type ProvinceDetailMapData = {
  slug: string;
  sourceLevel: "city" | "district" | "province";
  viewBox: string;
  units: ProvinceUnitShape[];
};

export type FoodRegionBinding = Record<string, string>;

export type PartitionShape = {
  id: string;
  name: string;
  unitIds: string[];
  paths: string[];
  hitPath?: string;
  label: {
    x: number;
    y: number;
    textAnchor?: "start" | "middle" | "end";
    fontSize?: number;
  };
};

export type ProvincePartitionMapData = {
  slug: string;
  viewBox: string;
  partitions: PartitionShape[];
};
