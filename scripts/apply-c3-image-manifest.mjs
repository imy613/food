import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const bundleDir = path.join(root, "中国34省分区美食_终极结构版_C3扩充资源包");
const manifestPath = path.join(bundleDir, "image_manifest_C3.csv");
const provincesPath = path.join(root, "data", "provinces.json");
const outputImageRoot = path.join(root, "public", "images", "foods", "c3");
const reportPath = path.join(root, "data", "c3-image-import-report.json");

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]).map((value) => value.replace(/^\uFEFF/, "").trim());
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index]?.trim() ?? "";
    });
    return row;
  });
}

function normalizeKey(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[·•・,，。、“”"‘’'()（）\-_]/g, "")
    .replace(/(省|市|特别行政区|自治区)$/g, "");
}

function toSlotNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

function sanitizeFilename(value) {
  const cleaned = String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "food-image";
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

async function resolveSourcePath(localPath) {
  const raw = String(localPath ?? "").trim();
  if (!raw) return null;

  const normalized = raw.replace(/\\/g, "/");
  const withoutLegacyPrefix = normalized
    .replace(/^图片素材包_终极结构版\//, "")
    .replace(/^图片素材包_C3\//, "");

  const candidates = [
    path.join(bundleDir, normalized),
    path.join(bundleDir, normalized.replace(/^图片素材包_终极结构版[\\/]/, "图片素材包_C3/")),
    path.join(bundleDir, "图片素材包_C3", withoutLegacyPrefix),
    path.join(bundleDir, withoutLegacyPrefix)
  ];

  for (const candidate of candidates) {
    if (await exists(candidate)) {
      return candidate;
    }
  }

  return null;
}

const manifestRaw = await fs.readFile(manifestPath, "utf8");
const manifestRows = parseCsv(manifestRaw);
const provinces = JSON.parse(await fs.readFile(provincesPath, "utf8"));

const provinceLookup = new Map();
for (const province of provinces) {
  const base = normalizeKey(province.name);
  provinceLookup.set(base, province);
  provinceLookup.set(normalizeKey(`${province.name}省`), province);
  provinceLookup.set(normalizeKey(`${province.name}市`), province);
}

const downloadedRows = manifestRows
  .filter((row) => String(row["状态"] ?? "").toLowerCase() === "downloaded")
  .sort((left, right) => {
    const keyA = `${left["省份"]}|${left["分区"]}|${left["美食"]}`;
    const keyB = `${right["省份"]}|${right["分区"]}|${right["美食"]}`;
    if (keyA !== keyB) return keyA.localeCompare(keyB, "zh-Hans-CN");
    return toSlotNumber(left["图片槽位"]) - toSlotNumber(right["图片槽位"]);
  });

const assignedFoods = new Set();
const unresolved = [];
const stats = {
  downloadedRows: downloadedRows.length,
  copiedFiles: 0,
  updatedFoods: 0,
  missingSource: 0,
  unmatchedProvince: 0,
  unmatchedRegion: 0,
  unmatchedFood: 0,
  duplicateDownloadedSlotsSkipped: 0
};

for (const row of downloadedRows) {
  const province = provinceLookup.get(normalizeKey(row["省份"]));
  if (!province) {
    stats.unmatchedProvince += 1;
    unresolved.push({ type: "province", ...row });
    continue;
  }

  const region = province.regions.find((item) => normalizeKey(item.name) === normalizeKey(row["分区"]));
  if (!region) {
    stats.unmatchedRegion += 1;
    unresolved.push({ type: "region", province: province.slug, ...row });
    continue;
  }

  const food = region.foods.find((item) => normalizeKey(item.title) === normalizeKey(row["美食"]));
  if (!food) {
    stats.unmatchedFood += 1;
    unresolved.push({ type: "food", province: province.slug, region: region.name, ...row });
    continue;
  }

  const uniqueFoodKey = `${province.slug}|${region.name}|${food.title}`;
  if (assignedFoods.has(uniqueFoodKey)) {
    stats.duplicateDownloadedSlotsSkipped += 1;
    continue;
  }

  const sourcePath = await resolveSourcePath(row["本地路径"]);
  if (!sourcePath) {
    stats.missingSource += 1;
    unresolved.push({ type: "file", province: province.slug, region: region.name, food: food.title, ...row });
    continue;
  }

  const ext = path.extname(sourcePath) || ".jpg";
  const sourceBaseName = path.basename(sourcePath, ext);
  const filename = `${sanitizeFilename(sourceBaseName)}${ext.toLowerCase()}`;
  const targetDir = path.join(outputImageRoot, province.slug);
  const targetPath = path.join(targetDir, filename);

  await fs.mkdir(targetDir, { recursive: true });
  await fs.copyFile(sourcePath, targetPath);

  food.image = `/${toPosixPath(path.relative(path.join(root, "public"), targetPath))}`;
  assignedFoods.add(uniqueFoodKey);
  stats.copiedFiles += 1;
  stats.updatedFoods += 1;
}

await fs.writeFile(provincesPath, `${JSON.stringify(provinces, null, 2)}\n`, "utf8");
await fs.writeFile(
  reportPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      stats,
      unresolved
    },
    null,
    2
  )}\n`,
  "utf8"
);

console.log("C3 image manifest applied.");
console.log(JSON.stringify(stats, null, 2));
if (unresolved.length > 0) {
  console.log(`Unresolved rows: ${unresolved.length} (see ${path.relative(root, reportPath)})`);
}
