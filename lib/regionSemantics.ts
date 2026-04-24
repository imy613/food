const DIRECT_CONTROLLED_MUNICIPALITY_SLUGS = new Set([
  "beijing",
  "tianjin",
  "shanghai",
  "chongqing"
]);

export const isDirectControlledMunicipality = (slug: string) =>
  DIRECT_CONTROLLED_MUNICIPALITY_SLUGS.has(slug);

export const toRegionDisplayName = (name?: string) => (name === "不分区" ? "" : name ?? "");

