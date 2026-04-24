import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const provinceDetailsDir = path.join(projectRoot, "data", "provinceDetails");
const partitionDir = path.join(projectRoot, "data", "provincePartitions");
const provincesJsonPath = path.join(projectRoot, "data", "provinces.json");
const chinaMapPath = path.join(projectRoot, "data", "chinaMap.ts");

const provinceOrder = [
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

const provinceNameMap = {
  beijing: "北京",
  tianjin: "天津",
  hebei: "河北",
  shanxi: "山西",
  "inner-mongolia": "内蒙古",
  liaoning: "辽宁",
  jilin: "吉林",
  heilongjiang: "黑龙江",
  shanghai: "上海",
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
  guangxi: "广西",
  hainan: "海南",
  chongqing: "重庆",
  sichuan: "四川",
  guizhou: "贵州",
  yunnan: "云南",
  tibet: "西藏",
  shaanxi: "陕西",
  gansu: "甘肃",
  qinghai: "青海",
  ningxia: "宁夏",
  xinjiang: "新疆",
  taiwan: "台湾",
  "hong-kong": "香港",
  macau: "澳门"
};

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

const partitionNamePool = {
  4: ["北部风味区", "东部风味区", "南部风味区", "西部风味区"],
  6: ["北部风味区", "东北风味区", "东南风味区", "南部风味区", "西南风味区", "西北风味区"],
  8: [
    "北部风味区",
    "东北风味区",
    "东部风味区",
    "东南风味区",
    "南部风味区",
    "西南风味区",
    "西部风味区",
    "西北风味区"
  ]
};

const southChinaSeaInsetBlock = `export const southChinaSeaInset: SouthChinaSeaInset = {
  frame: "M 774 454 L 934 454 L 934 620 L 774 620 Z",
  islands: [
    "M 798 482 L 804 478 L 811 480 L 814 486 L 808 491 L 801 489 Z",
    "M 821 503 L 828 498 L 836 501 L 838 507 L 832 512 L 824 510 Z",
    "M 845 523 L 853 518 L 861 521 L 864 528 L 857 533 L 848 531 Z",
    "M 871 546 L 879 541 L 887 545 L 889 552 L 882 557 L 874 554 Z",
    "M 815 536 L 822 531 L 830 534 L 832 541 L 825 546 L 817 543 Z",
    "M 839 559 L 847 554 L 854 557 L 857 563 L 851 569 L 843 567 Z",
    "M 866 582 L 874 577 L 882 580 L 885 587 L 878 592 L 870 589 Z",
    "M 891 603 L 898 599 L 905 602 L 907 607 L 901 612 L 894 610 Z",
    "M 812 582 L 819 577 L 827 580 L 829 586 L 823 591 L 815 588 Z",
    "M 834 603 L 841 598 L 849 601 L 852 607 L 845 612 L 837 609 Z",
    "M 858 603 L 865 598 L 873 601 L 876 607 L 869 612 L 861 609 Z",
    "M 882 523 L 888 519 L 895 521 L 898 527 L 892 532 L 885 530 Z"
  ],
  label: { x: 854, y: 614 }
};
`;

function round2(value) {
  return Math.round(value * 100) / 100;
}

function unique(values) {
  return [...new Set(values)];
}

function extractDataObject(tsSource) {
  const match = tsSource.match(/const mapData:[\s\S]*?=\s*(\{[\s\S]*\});\s*export default mapData;/);
  if (!match) {
    throw new Error("Unable to parse map data object");
  }
  return JSON.parse(match[1]);
}

function extractSubPaths(pathString) {
  return pathString.match(/M[\s\S]*?Z/g) ?? [];
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
  if (points.length < 3) {
    return 0;
  }
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
    const fallbackX = points.reduce((sum, point) => sum + point[0], 0) / Math.max(points.length, 1);
    const fallbackY = points.reduce((sum, point) => sum + point[1], 0) / Math.max(points.length, 1);
    return [fallbackX, fallbackY];
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
    const fallbackX = points.reduce((sum, point) => sum + point[0], 0) / points.length;
    const fallbackY = points.reduce((sum, point) => sum + point[1], 0) / points.length;
    return [fallbackX, fallbackY];
  }

  const divider = 3 * areaFactor;
  return [cx / divider, cy / divider];
}

function buildCirclePath(x, y, radius) {
  const right = round2(x + radius);
  const left = round2(x - radius);
  const yy = round2(y);
  const rr = round2(radius);
  return `M ${right} ${yy} A ${rr} ${rr} 0 1 0 ${left} ${yy} A ${rr} ${rr} 0 1 0 ${right} ${yy} Z`;
}

function kMeansWeighted(atoms, targetCount) {
  const atomCount = atoms.length;
  const count = Math.max(1, Math.min(targetCount, atomCount));
  if (count === 1) {
    return [atoms.map((atom) => atom.index)];
  }

  const centers = [];
  let firstIndex = 0;
  let minX = Number.POSITIVE_INFINITY;
  atoms.forEach((atom, index) => {
    if (atom.cx < minX) {
      minX = atom.cx;
      firstIndex = index;
    }
  });
  centers.push({ x: atoms[firstIndex].cx, y: atoms[firstIndex].cy });

  while (centers.length < count) {
    let farthestIndex = 0;
    let farthestDistance = -1;
    atoms.forEach((atom, index) => {
      const nearest = Math.min(
        ...centers.map((center) => (atom.cx - center.x) ** 2 + (atom.cy - center.y) ** 2)
      );
      if (nearest > farthestDistance) {
        farthestDistance = nearest;
        farthestIndex = index;
      }
    });
    centers.push({ x: atoms[farthestIndex].cx, y: atoms[farthestIndex].cy });
  }

  let assignments = new Array(atomCount).fill(0);
  for (let iteration = 0; iteration < 12; iteration += 1) {
    assignments = atoms.map((atom) => {
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      centers.forEach((center, centerIndex) => {
        const distance = (atom.cx - center.x) ** 2 + (atom.cy - center.y) ** 2;
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = centerIndex;
        }
      });
      return nearestIndex;
    });

    const grouped = Array.from({ length: count }, () => []);
    assignments.forEach((clusterIndex, atomIndex) => {
      grouped[clusterIndex].push(atomIndex);
    });

    grouped.forEach((group, clusterIndex) => {
      if (group.length === 0) {
        const fallbackAtom = atoms.reduce((picked, atom, atomIndex) => {
          if (assignments[atomIndex] !== assignments[picked]) {
            return atomIndex;
          }
          return atom.area > atoms[picked].area ? atomIndex : picked;
        }, 0);
        grouped[clusterIndex].push(fallbackAtom);
        assignments[fallbackAtom] = clusterIndex;
      }

      const totalWeight = group.reduce((sum, atomIndex) => sum + atoms[atomIndex].area, 0) || group.length;
      const weightedX = group.reduce((sum, atomIndex) => sum + atoms[atomIndex].cx * atoms[atomIndex].area, 0);
      const weightedY = group.reduce((sum, atomIndex) => sum + atoms[atomIndex].cy * atoms[atomIndex].area, 0);
      centers[clusterIndex] = {
        x: weightedX / totalWeight,
        y: weightedY / totalWeight
      };
    });
  }

  const groupedIndices = Array.from({ length: count }, () => []);
  assignments.forEach((clusterIndex, atomIndex) => {
    groupedIndices[clusterIndex].push(atomIndex);
  });
  return groupedIndices;
}

function directionalNames(count) {
  if (count >= 8) return partitionNamePool[8];
  if (count >= 6) return partitionNamePool[6];
  return partitionNamePool[4];
}

function choosePartitionCount(rankIndex) {
  if (rankIndex < 10) return 8;
  if (rankIndex < 24) return 6;
  return 4;
}

function buildFoods(provinceName, partitionName, seed) {
  const imageAt = (offset) => imagePool[(seed + offset) % imagePool.length];
  return [
    {
      title: `${partitionName}风味热菜`,
      image: imageAt(0),
      story: `${provinceName}${partitionName}长期形成重火候、重香气的家庭热菜传统，常见于节庆与待客场景。`,
      craft: `常用爆、煨、炖的复合火候处理，强调食材层次与锅气平衡，突出${partitionName}风味识别。`,
      culture: `在${provinceName}本地饮食中，这类热菜通常承担“压桌菜”角色，体现地域餐桌礼序。`,
      dialect: `“这口味道，就是${partitionName}的家常劲。”`,
      heritage: `${provinceName}${partitionName}传统烹饪技艺（初稿）`
    },
    {
      title: `${partitionName}乡土主食`,
      image: imageAt(1),
      story: `${partitionName}依地理与农产结构形成主食谱系，体现“就地取材、因地制食”的饮食智慧。`,
      craft: `以蒸、焖、煮为主，配合发酵或慢熟工艺，追求饱腹感与香气稳定。`,
      culture: `在日常家庭餐与集体劳作餐中出现频率高，是${provinceName}饮食记忆的核心部分。`,
      dialect: `“主食要扎实，吃起才踏实。”`,
      heritage: `${provinceName}${partitionName}主食制作传统（初稿）`
    },
    {
      title: `${partitionName}时令汤羹`,
      image: imageAt(2),
      story: `${partitionName}地区重视时令食补，汤羹类在四季转换与团聚场景中承担重要角色。`,
      craft: `讲究清浊分层与慢火提鲜，通过香料、菌蔬或腌制食材叠加口感深度。`,
      culture: `在${provinceName}地方餐桌中，汤羹常作为联结长幼与调和整席口味的关键段落。`,
      dialect: `“先喝口汤，整席味道就顺了。”`,
      heritage: `${provinceName}${partitionName}汤羹调理习俗（初稿）`
    }
  ];
}

function normalizeName(rawName, fallback) {
  if (!rawName) return fallback;
  if (rawName.includes("�") || rawName.includes("?")) {
    return fallback;
  }
  return rawName;
}

function patchChinaMapNames(source, nameMap) {
  let patched = source;
  for (const [slug, name] of Object.entries(nameMap)) {
    const pattern = new RegExp(`(slug:\\s*"${slug}",\\s*\\r?\\n\\s*name:\\s*")[^"]*(")`, "g");
    patched = patched.replace(pattern, `$1${name}$2`);
  }

  patched = patched.replace(
    /export const southChinaSeaInset: SouthChinaSeaInset = \{[\s\S]*?\n\};\s*$/,
    `${southChinaSeaInsetBlock}\n`
  );
  return patched;
}

async function main() {
  const files = (await fs.readdir(provinceDetailsDir))
    .filter((fileName) => fileName.endsWith(".ts") && fileName !== "loaders.ts")
    .sort();

  const provinceMaps = [];
  for (const fileName of files) {
    const slug = fileName.replace(".ts", "");
    const source = await fs.readFile(path.join(provinceDetailsDir, fileName), "utf8");
    const detail = extractDataObject(source);

    const atoms = [];
    detail.units.forEach((unit) => {
      const subPaths = extractSubPaths(unit.path);
      if (subPaths.length === 0) return;
      subPaths.forEach((subPath, subIndex) => {
        const points = parsePoints(subPath);
        const area = polygonArea(points);
        const [cx, cy] = polygonCentroid(points);
        atoms.push({
          index: atoms.length,
          id: subPaths.length > 1 ? `${unit.id}-${subIndex + 1}` : unit.id,
          parentId: unit.id,
          path: subPath.trim(),
          area: Math.max(1, area),
          cx,
          cy
        });
      });
    });

    if (atoms.length === 0) {
      throw new Error(`No atoms extracted for ${slug}`);
    }

    const provinceArea = atoms.reduce((sum, atom) => sum + atom.area, 0);
    const centroidWeight = provinceArea || atoms.length;
    const provinceCx = atoms.reduce((sum, atom) => sum + atom.cx * atom.area, 0) / centroidWeight;
    const provinceCy = atoms.reduce((sum, atom) => sum + atom.cy * atom.area, 0) / centroidWeight;

    provinceMaps.push({
      slug,
      viewBox: detail.viewBox,
      atoms,
      area: provinceArea,
      cx: provinceCx,
      cy: provinceCy
    });
  }

  const ranked = [...provinceMaps].sort((a, b) => b.area - a.area);
  const rankIndexBySlug = Object.fromEntries(ranked.map((item, index) => [item.slug, index]));

  await fs.rm(partitionDir, { recursive: true, force: true });
  await fs.mkdir(partitionDir, { recursive: true });

  const provincesData = [];
  const generatedSlugs = [];

  for (const province of provinceMaps) {
    const rankIndex = rankIndexBySlug[province.slug];
    const requestedCount = choosePartitionCount(rankIndex);
    const partitionCount = Math.min(Math.max(4, requestedCount), Math.max(1, province.atoms.length));
    const clusters = kMeansWeighted(province.atoms, partitionCount);

    const partitions = clusters.map((clusterAtoms, clusterIndex) => {
      const atoms = clusterAtoms.map((atomIndex) => province.atoms[atomIndex]);
      const totalArea = atoms.reduce((sum, atom) => sum + atom.area, 0) || atoms.length;
      const centerX = atoms.reduce((sum, atom) => sum + atom.cx * atom.area, 0) / totalArea;
      const centerY = atoms.reduce((sum, atom) => sum + atom.cy * atom.area, 0) / totalArea;
      const angle = (Math.atan2(centerY - province.cy, centerX - province.cx) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);

      return {
        clusterIndex,
        angle,
        atoms,
        rawCenterX: centerX,
        rawCenterY: centerY,
        totalArea
      };
    });

    partitions.sort((a, b) => a.angle - b.angle);
    const names = directionalNames(partitions.length);

    const shapedPartitions = partitions.map((partition, index) => ({
      id: `${province.slug}-p${index + 1}`,
      name: names[index] ?? `分区${index + 1}`,
      unitIds: unique(partition.atoms.map((atom) => atom.parentId)).sort(),
      paths: partition.atoms.map((atom) => atom.path),
      label: {
        x: round2(partition.rawCenterX),
        y: round2(partition.rawCenterY),
        textAnchor: "middle",
        fontSize: 11
      },
      hitPath: partition.totalArea < 260 ? buildCirclePath(partition.rawCenterX, partition.rawCenterY, 7.5) : undefined
    }));

    const partitionMapData = {
      slug: province.slug,
      viewBox: province.viewBox,
      partitions: shapedPartitions
    };

    const ts = `import { ProvincePartitionMapData } from "@/types";\n\nconst mapData: ProvincePartitionMapData = ${JSON.stringify(
      partitionMapData,
      null,
      2
    )};\n\nexport default mapData;\n`;
    await fs.writeFile(path.join(partitionDir, `${province.slug}.ts`), ts, "utf8");
    generatedSlugs.push(province.slug);

    const provinceName = provinceNameMap[province.slug] ?? province.slug;
    const regions = shapedPartitions.map((partition, index) => ({
      name: partition.name,
      foods: buildFoods(provinceName, partition.name, index)
    }));
    provincesData.push({
      name: provinceName,
      slug: province.slug,
      regions
    });
  }

  const sortedProvinceData = provinceOrder.map((slug) => {
    const found = provincesData.find((item) => item.slug === slug);
    if (!found) {
      throw new Error(`Missing generated province data for ${slug}`);
    }
    return found;
  });

  await fs.writeFile(provincesJsonPath, `${JSON.stringify(sortedProvinceData, null, 2)}\n`, "utf8");

  const loaderLines = [
    'import { ProvincePartitionMapData } from "@/types";',
    "",
    "export type ProvincePartitionMapLoader = () => Promise<ProvincePartitionMapData>;",
    "",
    "export const provincePartitionMapLoaders: Record<string, ProvincePartitionMapLoader> = {",
    ...provinceOrder.map(
      (slug) => `  "${slug}": () => import("./${slug}").then((module) => module.default),`
    ),
    "};",
    "",
    "export const loadProvincePartitionMap = (slug: string) => provincePartitionMapLoaders[slug]?.();",
    ""
  ];
  await fs.writeFile(path.join(partitionDir, "loaders.ts"), loaderLines.join("\n"), "utf8");

  const chinaMapSource = await fs.readFile(chinaMapPath, "utf8");
  const patchedChinaMap = patchChinaMapNames(chinaMapSource, provinceNameMap);
  await fs.writeFile(chinaMapPath, patchedChinaMap, "utf8");

  console.log(`Generated ${generatedSlugs.length} province partition maps`);
  console.log(`Wrote ${path.relative(projectRoot, provincesJsonPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
