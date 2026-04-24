import fs from "node:fs/promises";
import path from "node:path";
import https from "node:https";

const provinceCodeMap = {
  beijing: "110000",
  tianjin: "120000",
  hebei: "130000",
  shanxi: "140000",
  "inner-mongolia": "150000",
  liaoning: "210000",
  jilin: "220000",
  heilongjiang: "230000",
  shanghai: "310000",
  jiangsu: "320000",
  zhejiang: "330000",
  anhui: "340000",
  fujian: "350000",
  jiangxi: "360000",
  shandong: "370000",
  henan: "410000",
  hubei: "420000",
  hunan: "430000",
  guangdong: "440000",
  guangxi: "450000",
  hainan: "460000",
  chongqing: "500000",
  sichuan: "510000",
  guizhou: "520000",
  yunnan: "530000",
  tibet: "540000",
  shaanxi: "610000",
  gansu: "620000",
  qinghai: "630000",
  ningxia: "640000",
  xinjiang: "650000",
  taiwan: "710000",
  "hong-kong": "810000",
  macau: "820000"
};

const viewW = 640;
const viewH = 520;
const margin = 18;

const fetchText = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (!res.statusCode || res.statusCode >= 400) {
          res.resume();
          reject(new Error(`${res.statusCode ?? 500} ${url}`));
          return;
        }
        let text = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          text += chunk;
        });
        res.on("end", () => resolve(text));
      })
      .on("error", reject);
  });

const fetchGeoJson = async (adcode) => {
  const urls = [
    `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`,
    `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}.json`
  ];

  for (const url of urls) {
    try {
      const text = await fetchText(url);
      const json = JSON.parse(text);
      if (json?.type === "FeatureCollection" && Array.isArray(json.features) && json.features.length > 0) {
        return json;
      }
    } catch {
      // try next url
    }
  }

  throw new Error(`Unable to fetch boundary data for ${adcode}`);
};

const removeClosingPoint = (ring) => {
  if (ring.length < 2) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) {
    return ring.slice(0, -1);
  }
  return ring;
};

const simplifyRing = (ring) => {
  const points = removeClosingPoint(ring);
  if (points.length <= 8) {
    return points;
  }

  let step = 1;
  if (points.length > 180) step = 2;
  if (points.length > 420) step = 3;
  if (points.length > 900) step = 5;
  if (points.length > 1400) step = 7;

  const sampled = points.filter((_, index) => index === 0 || index === points.length - 1 || index % step === 0);
  return sampled.length >= 3 ? sampled : points;
};

const round2 = (value) => Math.round(value * 100) / 100;

const flattenRings = (geometry) => {
  if (!geometry) return [];
  if (geometry.type === "Polygon") {
    return geometry.coordinates;
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flat();
  }
  return [];
};

const polygonArea = (ring, project) => {
  const points = removeClosingPoint(ring);
  if (points.length < 3) return 0;

  let sum = 0;
  for (let index = 0; index < points.length; index += 1) {
    const next = (index + 1) % points.length;
    const [ax, ay] = project(points[index][0], points[index][1]);
    const [bx, by] = project(points[next][0], points[next][1]);
    sum += ax * by - bx * ay;
  }

  return Math.abs(sum / 2);
};

const buildCirclePath = (x, y, radius) => {
  const right = round2(x + radius);
  const left = round2(x - radius);
  const yy = round2(y);
  const rr = round2(radius);
  return `M ${right} ${yy} A ${rr} ${rr} 0 1 0 ${left} ${yy} A ${rr} ${rr} 0 1 0 ${right} ${yy} Z`;
};

const createProjector = (features) => {
  const allPoints = [];

  for (const feature of features) {
    for (const ring of flattenRings(feature.geometry)) {
      allPoints.push(...ring);
    }
  }

  const lats = allPoints.map((point) => point[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const lat0 = (minLat + maxLat) / 2;
  const lonFactor = Math.cos((lat0 * Math.PI) / 180);

  const xPrimes = allPoints.map((point) => point[0] * lonFactor);
  const minXPrime = Math.min(...xPrimes);
  const maxXPrime = Math.max(...xPrimes);

  const availW = viewW - margin * 2;
  const availH = viewH - margin * 2;
  const scale = Math.min(availW / (maxXPrime - minXPrime), availH / (maxLat - minLat));

  return (lon, lat) => {
    const xPrime = lon * lonFactor;
    const x = margin + (xPrime - minXPrime) * scale;
    const y = margin + (maxLat - lat) * scale;
    return [round2(x), round2(y)];
  };
};

const createUnitFromFeature = (feature, index, project) => {
  const rings = flattenRings(feature.geometry).map((ring) => simplifyRing(ring));
  const pathParts = [];

  for (const ring of rings) {
    if (ring.length < 3) continue;
    const points = ring.map((point) => {
      const [x, y] = project(point[0], point[1]);
      return `${x} ${y}`;
    });
    pathParts.push(`M ${points.join(" L ")} Z`);
  }

  const areaCandidates = flattenRings(feature.geometry).map((ring) => polygonArea(ring, project));
  const area = Math.max(...areaCandidates, 0);

  const center = feature.properties?.centroid ?? feature.properties?.center;
  const [baseX, baseY] = center ? project(center[0], center[1]) : [0, 0];

  const offsetRadius = area < 220 ? 14 : area < 420 ? 8 : 0;
  const angle = ((index % 10) / 10) * Math.PI * 2;
  const offsetX = round2(Math.cos(angle) * offsetRadius);
  const offsetY = round2(Math.sin(angle) * offsetRadius);

  const label = {
    x: round2(baseX + offsetX),
    y: round2(baseY + offsetY),
    textAnchor: offsetX > 5 ? "start" : offsetX < -5 ? "end" : "middle",
    fontSize: area < 250 ? 9 : area < 900 ? 10 : 11,
    lineTo:
      offsetRadius > 0
        ? {
            x: baseX,
            y: baseY
          }
        : undefined
  };

  return {
    id: String(feature.properties?.adcode ?? `${feature.properties?.name ?? "unit"}-${index}`),
    name: feature.properties?.name ?? `区域${index + 1}`,
    path: pathParts.join(" "),
    hitPath: area < 240 ? buildCirclePath(baseX, baseY, 8) : undefined,
    label
  };
};

const pickUnits = (features) => {
  const cityFeatures = features.filter((feature) => feature?.properties?.level === "city");
  if (cityFeatures.length > 0) {
    return {
      sourceLevel: "city",
      features: cityFeatures
    };
  }

  const districtFeatures = features.filter((feature) => feature?.properties?.level === "district");
  if (districtFeatures.length > 0) {
    return {
      sourceLevel: "district",
      features: districtFeatures
    };
  }

  return {
    sourceLevel: "province",
    features
  };
};

const writeProvinceDetail = async (slug, data) => {
  const outPath = path.join("data", "provinceDetails", `${slug}.ts`);
  const file = `import { ProvinceDetailMapData } from "@/types";\n\nconst mapData: ProvinceDetailMapData = ${JSON.stringify(
    data,
    null,
    2
  )};\n\nexport default mapData;\n`;

  await fs.writeFile(outPath, file, "utf8");
};

const writeLoaderFile = async (slugs) => {
  const lines = [];
  lines.push('import { ProvinceDetailMapData } from "@/types";');
  lines.push("");
  lines.push("export type ProvinceDetailLoader = () => Promise<ProvinceDetailMapData>;");
  lines.push("");
  lines.push("export const provinceDetailMapLoaders: Record<string, ProvinceDetailLoader> = {");
  for (const slug of slugs) {
    lines.push(`  \"${slug}\": () => import(\"./${slug}\").then((module) => module.default),`);
  }
  lines.push("};");
  lines.push("");
  lines.push("export const loadProvinceDetailMap = (slug: string) => provinceDetailMapLoaders[slug]?.();");
  lines.push("");

  await fs.writeFile(path.join("data", "provinceDetails", "loaders.ts"), lines.join("\n"), "utf8");
};

const main = async () => {
  const provinces = JSON.parse(await fs.readFile(path.join("data", "provinces.json"), "utf8"));
  const slugs = [];

  await fs.rm(path.join("data", "provinceDetails"), { recursive: true, force: true });
  await fs.mkdir(path.join("data", "provinceDetails"), { recursive: true });

  for (const province of provinces) {
    const slug = province.slug;
    const adcode = provinceCodeMap[slug];
    if (!adcode) {
      throw new Error(`Missing adcode map for slug: ${slug}`);
    }

    const geoJson = await fetchGeoJson(adcode);
    const picked = pickUnits(geoJson.features || []);
    const sortedFeatures = [...picked.features].sort(
      (a, b) => Number(a?.properties?.adcode ?? 0) - Number(b?.properties?.adcode ?? 0)
    );

    const project = createProjector(sortedFeatures);
    const units = sortedFeatures.map((feature, index) => createUnitFromFeature(feature, index, project));

    const detailMap = {
      slug,
      sourceLevel: picked.sourceLevel,
      viewBox: `0 0 ${viewW} ${viewH}`,
      units
    };

    await writeProvinceDetail(slug, detailMap);
    slugs.push(slug);

    console.log(`generated ${slug}: ${units.length} units (${picked.sourceLevel})`);
  }

  await writeLoaderFile(slugs);
  console.log("province detail map files generated");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
