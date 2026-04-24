import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const c3Path = path.join(
  root,
  "中国34省分区美食_终极结构版_C3扩充资源包",
  "china_food_terminal_structure_C3.json"
);
const provinceDetailsDir = path.join(root, "data", "provinceDetails");
const provincePartitionsDir = path.join(root, "data", "provincePartitions");
const provincesJsonPath = path.join(root, "data", "provinces.json");

const c3ProvinceToSlug = {
  北京市: "beijing",
  天津市: "tianjin",
  上海市: "shanghai",
  重庆市: "chongqing",
  河北省: "hebei",
  山西省: "shanxi",
  辽宁省: "liaoning",
  吉林省: "jilin",
  黑龙江省: "heilongjiang",
  江苏省: "jiangsu",
  浙江省: "zhejiang",
  安徽省: "anhui",
  福建省: "fujian",
  江西省: "jiangxi",
  山东省: "shandong",
  河南省: "henan",
  湖北省: "hubei",
  湖南省: "hunan",
  广东省: "guangdong",
  海南省: "hainan",
  四川省: "sichuan",
  贵州省: "guizhou",
  云南省: "yunnan",
  西藏自治区: "tibet",
  陕西省: "shaanxi",
  甘肃省: "gansu",
  青海省: "qinghai",
  内蒙古自治区: "inner-mongolia",
  广西壮族自治区: "guangxi",
  宁夏回族自治区: "ningxia",
  新疆维吾尔自治区: "xinjiang",
  香港特别行政区: "hong-kong",
  澳门特别行政区: "macau",
  台湾省: "taiwan"
};

const slugToProvinceName = {
  beijing: "北京",
  tianjin: "天津",
  shanghai: "上海",
  chongqing: "重庆",
  hebei: "河北",
  shanxi: "山西",
  liaoning: "辽宁",
  jilin: "吉林",
  heilongjiang: "黑龙江",
  jiangsu: "江苏",
  zhejiang: "浙江",
  anhui: "安徽",
  fujian: "福建",
  jiangxi: "江西",
  shandong: "山东",
  henan: "河南",
  hubei: "湖北",
  hunan: "湖南",
  guangdong: "广东",
  hainan: "海南",
  sichuan: "四川",
  guizhou: "贵州",
  yunnan: "云南",
  tibet: "西藏",
  shaanxi: "陕西",
  gansu: "甘肃",
  qinghai: "青海",
  "inner-mongolia": "内蒙古",
  guangxi: "广西",
  ningxia: "宁夏",
  xinjiang: "新疆",
  "hong-kong": "香港",
  macau: "澳门",
  taiwan: "台湾"
};

const slugOrder = [
  "beijing",
  "tianjin",
  "hebei",
  "shanxi",
  "inner-mongolia",
  "liaoning",
  "jilin",
  "heilongjiang",
  "shanghai",
  "jiangsu",
  "zhejiang",
  "anhui",
  "fujian",
  "jiangxi",
  "shandong",
  "henan",
  "hubei",
  "hunan",
  "guangdong",
  "guangxi",
  "hainan",
  "chongqing",
  "sichuan",
  "guizhou",
  "yunnan",
  "tibet",
  "shaanxi",
  "gansu",
  "qinghai",
  "ningxia",
  "xinjiang",
  "taiwan",
  "hong-kong",
  "macau"
];

const imagePool = [
  "/images/foods/spicy-red.svg",
  "/images/foods/soy-ink.svg",
  "/images/foods/sea-blue.svg",
  "/images/foods/river-silver.svg",
  "/images/foods/northern-heat.svg",
  "/images/foods/noodle-amber.svg",
  "/images/foods/highland-gold.svg",
  "/images/foods/heritage-brown.svg",
  "/images/foods/dimsum-jade.svg"
];

const aliasVectorBySlug = {
  sichuan: {
    成都平原: [0, 0],
    川南: [0, 1],
    川东北: [1, -1],
    川中: [0.25, 0.1],
    川西: [-1, 0]
  },
  tibet: {
    藏中: [0, 0],
    藏东: [1, 0],
    藏南: [0, 1],
    藏西: [-1, 0],
    藏北: [0, -1]
  },
  xinjiang: {
    北疆: [0, -1],
    南疆: [0, 1],
    东疆: [1, 0]
  }
};

function round2(value) {
  return Math.round(value * 100) / 100;
}

function parseTsObject(source) {
  const match = source.match(/const mapData:[\s\S]*?=\s*(\{[\s\S]*\});\s*export default mapData;/);
  if (!match) {
    throw new Error("Unable to parse ts data object");
  }
  return JSON.parse(match[1]);
}

function parsePoints(pathString) {
  const values = pathString.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const points = [];
  for (let index = 0; index < values.length - 1; index += 2) {
    points.push([values[index], values[index + 1]]);
  }
  return points;
}

function polygonArea(points) {
  if (points.length < 3) return 0;
  let sum = 0;
  for (let index = 0; index < points.length; index += 1) {
    const next = (index + 1) % points.length;
    const [ax, ay] = points[index];
    const [bx, by] = points[next];
    sum += ax * by - bx * ay;
  }
  return Math.abs(sum / 2);
}

function polygonCentroid(points) {
  if (points.length < 3) {
    const x = points.reduce((sum, point) => sum + point[0], 0) / Math.max(points.length, 1);
    const y = points.reduce((sum, point) => sum + point[1], 0) / Math.max(points.length, 1);
    return [x, y];
  }
  let areaFactor = 0;
  let cx = 0;
  let cy = 0;
  for (let index = 0; index < points.length; index += 1) {
    const next = (index + 1) % points.length;
    const [x0, y0] = points[index];
    const [x1, y1] = points[next];
    const cross = x0 * y1 - x1 * y0;
    areaFactor += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  if (Math.abs(areaFactor) < 1e-6) {
    const x = points.reduce((sum, point) => sum + point[0], 0) / points.length;
    const y = points.reduce((sum, point) => sum + point[1], 0) / points.length;
    return [x, y];
  }
  return [cx / (3 * areaFactor), cy / (3 * areaFactor)];
}

function extractMainSubPath(pathString) {
  const segments = pathString.match(/M[\s\S]*?Z/g) ?? [];
  if (segments.length === 0) return pathString;
  let picked = segments[0];
  let pickedArea = 0;
  for (const segment of segments) {
    const area = polygonArea(parsePoints(segment));
    if (area > pickedArea) {
      pickedArea = area;
      picked = segment;
    }
  }
  return picked;
}

function kmeansWeighted(units, count) {
  const k = Math.max(1, Math.min(count, units.length));
  if (k === 1) return [units.map((unit) => unit.index)];

  const centers = [];
  const leftMost = units.reduce((picked, unit, index) => (unit.cx < units[picked].cx ? index : picked), 0);
  centers.push({ x: units[leftMost].cx, y: units[leftMost].cy });

  while (centers.length < k) {
    let farthestIdx = 0;
    let farthestDist = -1;
    units.forEach((unit, idx) => {
      const nearest = Math.min(...centers.map((c) => (unit.cx - c.x) ** 2 + (unit.cy - c.y) ** 2));
      if (nearest > farthestDist) {
        farthestDist = nearest;
        farthestIdx = idx;
      }
    });
    centers.push({ x: units[farthestIdx].cx, y: units[farthestIdx].cy });
  }

  let assign = new Array(units.length).fill(0);
  for (let iter = 0; iter < 14; iter += 1) {
    assign = units.map((unit) => {
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      centers.forEach((center, idx) => {
        const dist = (unit.cx - center.x) ** 2 + (unit.cy - center.y) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      });
      return bestIdx;
    });

    const groups = Array.from({ length: k }, () => []);
    assign.forEach((cluster, idx) => groups[cluster].push(idx));

    groups.forEach((group, clusterIdx) => {
      if (group.length === 0) {
        const largest = units.reduce((picked, unit, idx) => (unit.area > units[picked].area ? idx : picked), 0);
        group.push(largest);
        assign[largest] = clusterIdx;
      }
      const weight = group.reduce((sum, idx) => sum + units[idx].area, 0) || group.length;
      const wx = group.reduce((sum, idx) => sum + units[idx].cx * units[idx].area, 0);
      const wy = group.reduce((sum, idx) => sum + units[idx].cy * units[idx].area, 0);
      centers[clusterIdx] = { x: wx / weight, y: wy / weight };
    });
  }

  const grouped = Array.from({ length: k }, () => []);
  assign.forEach((cluster, idx) => grouped[cluster].push(units[idx].index));
  return grouped;
}

function buildCirclePath(x, y, radius) {
  const right = round2(x + radius);
  const left = round2(x - radius);
  const yy = round2(y);
  const rr = round2(radius);
  return `M ${right} ${yy} A ${rr} ${rr} 0 1 0 ${left} ${yy} A ${rr} ${rr} 0 1 0 ${right} ${yy} Z`;
}

function regionNameVector(slug, regionName) {
  const alias = aliasVectorBySlug[slug]?.[regionName];
  if (alias) return alias;

  let x = 0;
  let y = 0;
  let centerBias = false;
  if (regionName.includes("东北")) {
    x += 1;
    y -= 1;
  }
  if (regionName.includes("东南")) {
    x += 1;
    y += 1;
  }
  if (regionName.includes("西北")) {
    x -= 1;
    y -= 1;
  }
  if (regionName.includes("西南")) {
    x -= 1;
    y += 1;
  }
  if (regionName.includes("北")) y -= 1;
  if (regionName.includes("南")) y += 1;
  if (regionName.includes("东")) x += 1;
  if (regionName.includes("西")) x -= 1;
  if (
    regionName.includes("中") ||
    regionName.includes("中心") ||
    regionName.includes("平原") ||
    regionName.includes("腹地") ||
    regionName.includes("不分区")
  ) {
    centerBias = true;
  }
  if (centerBias && x === 0 && y === 0) return [0, 0];
  return [x, y];
}

function assignNamesToClusters(slug, regionNames, clusters, provinceCenter) {
  const clusterMeta = clusters.map((units, idx) => {
    const area = units.reduce((sum, unit) => sum + unit.area, 0) || 1;
    const cx = units.reduce((sum, unit) => sum + unit.cx * unit.area, 0) / area;
    const cy = units.reduce((sum, unit) => sum + unit.cy * unit.area, 0) / area;
    return {
      idx,
      units,
      area,
      cx,
      cy,
      dx: cx - provinceCenter.x,
      dy: cy - provinceCenter.y
    };
  });

  if (regionNames.length === 1) {
    return [{ regionName: regionNames[0], cluster: clusterMeta[0] }];
  }

  const unassignedClusters = [...clusterMeta];
  const assigned = [];
  for (const regionName of regionNames) {
    const [vx, vy] = regionNameVector(slug, regionName);
    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    unassignedClusters.forEach((cluster, idx) => {
      const norm = Math.hypot(cluster.dx, cluster.dy) || 1;
      const nx = cluster.dx / norm;
      const ny = cluster.dy / norm;

      let score;
      if (vx === 0 && vy === 0) {
        score = norm * 1.2;
      } else {
        score = (nx - vx) ** 2 + (ny - vy) ** 2 + norm * 0.02;
      }

      if (score < bestScore) {
        bestScore = score;
        bestIndex = idx;
      }
    });
    assigned.push({ regionName, cluster: unassignedClusters[bestIndex] });
    unassignedClusters.splice(bestIndex, 1);
  }
  return assigned;
}

function buildFoodRecord(foodName, provinceName, regionName, seed) {
  return {
    title: foodName,
    image: imagePool[seed % imagePool.length],
    story: `${foodName}是${provinceName}${regionName}常见的代表风味之一，在地方饮食记忆中辨识度较高。`,
    craft: `${foodName}强调食材处理、火候节奏与调味平衡，体现${provinceName}地方烹饪技法。`,
    culture: `${foodName}常见于家常、节庆与街巷场景，是${provinceName}饮食文化的重要符号。`,
    dialect: `“来一份${foodName}，这口味道很地道。”`,
    heritage: `${provinceName}${regionName}传统风味代表（C3 初稿）`
  };
}

async function main() {
  const c3Raw = JSON.parse(await fs.readFile(c3Path, "utf8"));
  const provinceEntries = Object.entries(c3Raw.data ?? {});
  if (provinceEntries.length !== 34) {
    throw new Error(`Unexpected C3 province count: ${provinceEntries.length}`);
  }

  const provincesData = [];
  await fs.rm(provincePartitionsDir, { recursive: true, force: true });
  await fs.mkdir(provincePartitionsDir, { recursive: true });

  for (const [c3ProvinceName, regionObject] of provinceEntries) {
    const slug = c3ProvinceToSlug[c3ProvinceName];
    if (!slug) {
      throw new Error(`Missing slug mapping for ${c3ProvinceName}`);
    }

    const regionNames = Object.keys(regionObject);
    const foodsByRegion = regionNames.map((regionName, regionIdx) => {
      const sourceFoods = regionObject[regionName];
      return {
        name: regionName,
        foods: sourceFoods.map((item, foodIdx) =>
          buildFoodRecord(item.food, slugToProvinceName[slug], regionName, regionIdx * 3 + foodIdx)
        )
      };
    });

    provincesData.push({
      name: slugToProvinceName[slug],
      slug,
      regions: foodsByRegion
    });

    const detailSource = await fs.readFile(path.join(provinceDetailsDir, `${slug}.ts`), "utf8");
    const detailMap = parseTsObject(detailSource);
    const units = detailMap.units.map((unit, index) => {
      const mainPath = extractMainSubPath(unit.path);
      const points = parsePoints(mainPath);
      const area = Math.max(1, polygonArea(points));
      const [cx, cy] = points.length > 0 ? polygonCentroid(points) : [unit.label?.x ?? 0, unit.label?.y ?? 0];
      return { ...unit, path: mainPath, area, cx, cy, index };
    });

    const provinceArea = units.reduce((sum, unit) => sum + unit.area, 0) || 1;
    const provinceCenter = {
      x: units.reduce((sum, unit) => sum + unit.cx * unit.area, 0) / provinceArea,
      y: units.reduce((sum, unit) => sum + unit.cy * unit.area, 0) / provinceArea
    };

    const clustersIdx = kmeansWeighted(units, regionNames.length);
    const clusters = clustersIdx.map((idxList) => idxList.map((idx) => units[idx]));
    const nameAssignments = assignNamesToClusters(slug, regionNames, clusters, provinceCenter);

    const partitions = nameAssignments.map((assignment, index) => {
      const clusterUnits = assignment.cluster.units;
      const area = clusterUnits.reduce((sum, unit) => sum + unit.area, 0) || 1;
      const cx = clusterUnits.reduce((sum, unit) => sum + unit.cx * unit.area, 0) / area;
      const cy = clusterUnits.reduce((sum, unit) => sum + unit.cy * unit.area, 0) / area;
      return {
        id: `${slug}-partition-${index + 1}`,
        name: assignment.regionName,
        unitIds: [...new Set(clusterUnits.map((unit) => unit.id))],
        paths: clusterUnits.map((unit) => unit.path),
        hitPath: area < 320 ? buildCirclePath(cx, cy, 7.5) : undefined,
        label: {
          x: round2(cx),
          y: round2(cy),
          textAnchor: "middle",
          fontSize: 11
        }
      };
    });

    const partitionData = {
      slug,
      viewBox: detailMap.viewBox,
      partitions
    };
    const partitionTs = `import { ProvincePartitionMapData } from "@/types";\n\nconst mapData: ProvincePartitionMapData = ${JSON.stringify(
      partitionData,
      null,
      2
    )};\n\nexport default mapData;\n`;
    await fs.writeFile(path.join(provincePartitionsDir, `${slug}.ts`), partitionTs, "utf8");
  }

  const sortedProvinces = slugOrder.map((slug) => {
    const province = provincesData.find((item) => item.slug === slug);
    if (!province) {
      throw new Error(`Missing province data for slug ${slug}`);
    }
    return province;
  });
  await fs.writeFile(provincesJsonPath, `${JSON.stringify(sortedProvinces, null, 2)}\n`, "utf8");

  const loaderLines = [
    'import { ProvincePartitionMapData } from "@/types";',
    "",
    "export type ProvincePartitionMapLoader = () => Promise<ProvincePartitionMapData>;",
    "",
    "export const provincePartitionMapLoaders: Record<string, ProvincePartitionMapLoader> = {",
    ...slugOrder.map((slug) => `  "${slug}": () => import("./${slug}").then((module) => module.default),`),
    "};",
    "",
    "export const loadProvincePartitionMap = (slug: string) => provincePartitionMapLoaders[slug]?.();",
    ""
  ];
  await fs.writeFile(path.join(provincePartitionsDir, "loaders.ts"), loaderLines.join("\n"), "utf8");

  console.log(`C3 import completed: ${sortedProvinces.length} provinces`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
