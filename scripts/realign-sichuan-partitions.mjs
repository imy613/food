import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const detailPath = path.join(root, "data", "provinceDetails", "sichuan.ts");
const outputPath = path.join(root, "data", "provincePartitions", "sichuan.ts");

const partitionPlan = [
  {
    name: "成都平原",
    unitIds: ["510100", "510600", "511400", "512000"]
  },
  {
    name: "川南",
    unitIds: ["510300", "510500", "511000", "511100", "511500"]
  },
  {
    name: "川东北",
    unitIds: ["510800", "511300", "511600", "511700", "511900"]
  },
  {
    name: "川中",
    unitIds: ["510700", "510900"]
  },
  {
    name: "川西",
    unitIds: ["510400", "511800", "513200", "513300", "513400"]
  }
];

function parseTsObject(source) {
  const match = source.match(
    /const mapData:\s*ProvinceDetailMapData\s*=\s*(\{[\s\S]*\});\s*export default mapData;/
  );
  if (!match) {
    throw new Error("Unable to parse Sichuan province detail map data.");
  }

  return JSON.parse(match[1]);
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const detailSource = await fs.readFile(detailPath, "utf8");
const detailMap = parseTsObject(detailSource);
const unitsById = new Map(detailMap.units.map((unit) => [unit.id, unit]));

const partitions = partitionPlan.map((entry, index) => {
  const units = entry.unitIds.map((unitId) => {
    const unit = unitsById.get(unitId);
    if (!unit) {
      throw new Error(`Missing Sichuan unit: ${unitId}`);
    }
    return unit;
  });

  return {
    id: `sichuan-partition-${index + 1}`,
    name: entry.name,
    unitIds: entry.unitIds,
    paths: units.map((unit) => unit.path),
    label: {
      x: Number(average(units.map((unit) => unit.label.x)).toFixed(2)),
      y: Number(average(units.map((unit) => unit.label.y)).toFixed(2)),
      textAnchor: "middle",
      fontSize: 11
    }
  };
});

const mapData = {
  slug: "sichuan",
  viewBox: detailMap.viewBox,
  partitions
};

const output = `import { ProvincePartitionMapData } from "@/types";

const mapData: ProvincePartitionMapData = ${JSON.stringify(mapData, null, 2)};

export default mapData;
`;

await fs.writeFile(outputPath, output, "utf8");

console.log("Sichuan partitions realigned with explicit city grouping.");
