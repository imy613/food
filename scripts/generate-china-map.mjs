import fs from "node:fs";

const inputPath = "china_100000_full.json";
const outputPath = "data/chinaMap.ts";

const slugMap = {
  110000: "beijing",
  120000: "tianjin",
  130000: "hebei",
  140000: "shanxi",
  150000: "inner-mongolia",
  210000: "liaoning",
  220000: "jilin",
  230000: "heilongjiang",
  310000: "shanghai",
  320000: "jiangsu",
  330000: "zhejiang",
  340000: "anhui",
  350000: "fujian",
  360000: "jiangxi",
  370000: "shandong",
  410000: "henan",
  420000: "hubei",
  430000: "hunan",
  440000: "guangdong",
  450000: "guangxi",
  460000: "hainan",
  500000: "chongqing",
  510000: "sichuan",
  520000: "guizhou",
  530000: "yunnan",
  540000: "tibet",
  610000: "shaanxi",
  620000: "gansu",
  630000: "qinghai",
  640000: "ningxia",
  650000: "xinjiang",
  710000: "taiwan",
  810000: "hong-kong",
  820000: "macau"
};

const orderMap = {
  xinjiang: 1,
  tibet: 2,
  qinghai: 3,
  gansu: 4,
  ningxia: 5,
  "inner-mongolia": 6,
  heilongjiang: 7,
  jilin: 8,
  liaoning: 9,
  beijing: 10,
  tianjin: 11,
  hebei: 12,
  shanxi: 13,
  shaanxi: 14,
  henan: 15,
  shandong: 16,
  jiangsu: 17,
  shanghai: 18,
  zhejiang: 19,
  anhui: 20,
  hubei: 21,
  hunan: 22,
  jiangxi: 23,
  fujian: 24,
  taiwan: 25,
  sichuan: 26,
  chongqing: 27,
  guizhou: 28,
  yunnan: 29,
  guangxi: 30,
  guangdong: 31,
  hainan: 32,
  "hong-kong": 33,
  macau: 34
};

const smallOffsets = {
  beijing: { dx: 26, dy: -8, anchor: "start", size: 12, hitR: 10 },
  tianjin: { dx: 34, dy: 9, anchor: "start", size: 12, hitR: 10 },
  shanghai: { dx: 20, dy: 12, anchor: "start", size: 12, hitR: 10 },
  "hong-kong": { dx: 24, dy: 12, anchor: "start", size: 11, hitR: 9 },
  macau: { dx: -22, dy: 13, anchor: "end", size: 11, hitR: 9 },
  hainan: { dx: 0, dy: 23, anchor: "middle", size: 12, hitR: 10 }
};

function removeClosingPoint(ring) {
  if (ring.length < 2) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) {
    return ring.slice(0, -1);
  }
  return ring;
}

function simplifyRing(ring) {
  const points = removeClosingPoint(ring);
  if (points.length <= 6) return points;
  let step = 1;
  if (points.length > 120) step = 2;
  if (points.length > 260) step = 3;
  if (points.length > 500) step = 4;
  const sampled = points.filter((_, i) => i === 0 || i === points.length - 1 || i % step === 0);
  return sampled;
}

function round2(num) {
  return Math.round(num * 100) / 100;
}

function buildCirclePath(x, y, r) {
  const x1 = round2(x + r);
  const x2 = round2(x - r);
  const yy = round2(y);
  const rr = round2(r);
  return `M ${x1} ${yy} A ${rr} ${rr} 0 1 0 ${x2} ${yy} A ${rr} ${rr} 0 1 0 ${x1} ${yy} Z`;
}

function polygonArea(ring, project) {
  const points = removeClosingPoint(ring);
  if (points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const j = (i + 1) % points.length;
    const [ax, ay] = project(points[i][0], points[i][1]);
    const [bx, by] = project(points[j][0], points[j][1]);
    sum += ax * by - bx * ay;
  }
  return Math.abs(sum / 2);
}

const provinceData = JSON.parse(fs.readFileSync("data/provinces.json", "utf8"));
const provinceNameBySlug = Object.fromEntries(provinceData.map((p) => [p.slug, p.name]));
const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const features = source.features.filter((f) => slugMap[String(f.properties.adcode)]);
if (features.length !== 34) {
  throw new Error(`Expected 34 features, got ${features.length}`);
}

const allPoints = [];
for (const feature of features) {
  if (feature.geometry.type === "Polygon") {
    for (const ring of feature.geometry.coordinates) {
      allPoints.push(...ring);
    }
  } else {
    for (const polygon of feature.geometry.coordinates) {
      for (const ring of polygon) {
        allPoints.push(...ring);
      }
    }
  }
}

const lats = allPoints.map((p) => p[1]);
const minLat = Math.min(...lats);
const maxLat = Math.max(...lats);
const lat0 = (minLat + maxLat) / 2;
const lonFactor = Math.cos((lat0 * Math.PI) / 180);

const xPrimes = allPoints.map((p) => p[0] * lonFactor);
const minXPrime = Math.min(...xPrimes);
const maxXPrime = Math.max(...xPrimes);

const viewW = 960;
const viewH = 640;
const margin = 28;
const availW = viewW - margin * 2;
const availH = viewH - margin * 2;
const scale = Math.min(availW / (maxXPrime - minXPrime), availH / (maxLat - minLat));

const project = (lon, lat) => {
  const xPrime = lon * lonFactor;
  const x = margin + (xPrime - minXPrime) * scale;
  const y = margin + (maxLat - lat) * scale;
  return [round2(x), round2(y)];
};

const entries = [];

for (const feature of features) {
  const slug = slugMap[String(feature.properties.adcode)];
  const name = provinceNameBySlug[slug];
  const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;

  const pathParts = [];
  let outerArea = 0;

  polygons.forEach((polygon, polygonIndex) => {
    polygon.forEach((ring, ringIndex) => {
      const sampled = simplifyRing(ring);
      if (sampled.length < 3) return;

      if (polygonIndex === 0 && ringIndex === 0) {
        outerArea = polygonArea(ring, project);
      }

      const points = sampled.map((p) => {
        const [x, y] = project(p[0], p[1]);
        return `${x} ${y}`;
      });
      pathParts.push(`M ${points.join(" L ")} Z`);
    });
  });

  const centroid = feature.properties.centroid ?? feature.properties.center;
  if (!centroid) throw new Error(`Missing centroid for ${slug}`);
  const [cx, cy] = project(centroid[0], centroid[1]);

  let label = {
    x: cx,
    y: cy,
    textAnchor: "middle",
    fontSize: 13
  };

  let hitPath = null;
  if (smallOffsets[slug]) {
    const off = smallOffsets[slug];
    label = {
      ...label,
      x: round2(cx + off.dx),
      y: round2(cy + off.dy),
      textAnchor: off.anchor,
      fontSize: off.size,
      lineTo: { x: round2(cx), y: round2(cy) }
    };
    hitPath = buildCirclePath(cx, cy, off.hitR);
  } else if (outerArea < 130) {
    hitPath = buildCirclePath(cx, cy, 9);
  }

  entries.push({
    slug,
    name,
    group: ["taiwan", "hong-kong", "macau", "hainan"].includes(slug) ? "coastal" : "mainland",
    path: pathParts.join(" "),
    hitPath,
    label
  });
}

entries.sort((a, b) => (orderMap[a.slug] ?? 999) - (orderMap[b.slug] ?? 999));

const southChinaSeaInset = {
  frame: "M 790 476 L 920 476 L 920 607 L 790 607 Z",
  islands: [
    "M 805 495 L 815 489 L 823 496 L 816 504 Z",
    "M 834 516 L 845 510 L 854 518 L 846 527 Z",
    "M 864 539 L 872 532 L 881 540 L 874 548 Z",
    "M 829 557 L 838 550 L 848 558 L 840 566 Z",
    "M 878 573 L 888 566 L 898 575 L 889 583 Z",
    "M 844 588 L 852 581 L 862 589 L 854 597 Z"
  ],
  label: { x: 855, y: 602 }
};

const lines = [];
lines.push('import { ProvinceShape, SouthChinaSeaInset } from "@/types";');
lines.push("");
lines.push("export const chinaProvinceShapes: ProvinceShape[] = [");
for (const item of entries) {
  lines.push("  {");
  lines.push(`    slug: "${item.slug}",`);
  lines.push(`    name: "${item.name}",`);
  lines.push(`    group: "${item.group}",`);
  lines.push(`    path: "${item.path}",`);
  if (item.hitPath) {
    lines.push(`    hitPath: "${item.hitPath}",`);
  }
  lines.push("    label: {");
  lines.push(`      x: ${item.label.x},`);
  lines.push(`      y: ${item.label.y},`);
  lines.push(`      textAnchor: "${item.label.textAnchor}",`);
  lines.push(`      fontSize: ${item.label.fontSize},`);
  if (item.label.lineTo) {
    lines.push(`      lineTo: { x: ${item.label.lineTo.x}, y: ${item.label.lineTo.y} },`);
  }
  lines.push("    },");
  lines.push("  },");
}
lines.push("];");
lines.push("");
lines.push("export const southChinaSeaInset: SouthChinaSeaInset = {");
lines.push(`  frame: "${southChinaSeaInset.frame}",`);
lines.push("  islands: [");
for (const path of southChinaSeaInset.islands) {
  lines.push(`    "${path}",`);
}
lines.push("  ],");
lines.push(`  label: { x: ${southChinaSeaInset.label.x}, y: ${southChinaSeaInset.label.y} },`);
lines.push("};");
lines.push("");

fs.writeFileSync(outputPath, lines.join("\n"), "utf8");
console.log(`Generated ${outputPath}`);
