import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const detailPath = path.join(root, "data", "provinceDetails", "xinjiang.ts");
const outputPath = path.join(root, "data", "provincePartitions", "xinjiang.ts");

const partitionPlan = [
  {
    name: "北疆",
    unitIds: [
      "650100",
      "650200",
      "652300",
      "652700",
      "654000",
      "654200",
      "654300",
      "659001",
      "659004",
      "659005",
      "659007",
      "659008",
      "659010"
    ]
  },
  {
    name: "南疆",
    unitIds: [
      "652800",
      "652900",
      "653000",
      "653100",
      "653200",
      "659002",
      "659003",
      "659006",
      "659009"
    ]
  },
  {
    name: "东疆",
    unitIds: ["650400", "650500"]
  }
];

function parseTsObject(source) {
  const match = source.match(
    /const mapData:\s*ProvinceDetailMapData\s*=\s*(\{[\s\S]*\});\s*export default mapData;/
  );
  if (!match) {
    throw new Error("Unable to parse Xinjiang province detail map data.");
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
      throw new Error(`Missing Xinjiang unit: ${unitId}`);
    }
    return unit;
  });

  return {
    id: `xinjiang-partition-${index + 1}`,
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
  slug: "xinjiang",
  viewBox: detailMap.viewBox,
  partitions
};

const output = `import { ProvincePartitionMapData } from "@/types";

const mapData: ProvincePartitionMapData = ${JSON.stringify(mapData, null, 2)};

export default mapData;
`;

await fs.writeFile(outputPath, output, "utf8");

console.log("Xinjiang partitions realigned with explicit city grouping.");
