import { describe, expect, it } from "vitest";
import xinjiangPartitionMap from "@/data/provincePartitions/xinjiang";

describe("Xinjiang partition alignment", () => {
  it("keeps C3 region names and explicit city grouping", () => {
    const names = xinjiangPartitionMap.partitions.map((partition) => partition.name);
    expect(names).toEqual(["北疆", "南疆", "东疆"]);

    const byName = new Map(xinjiangPartitionMap.partitions.map((partition) => [partition.name, partition]));
    const north = byName.get("北疆");
    const south = byName.get("南疆");
    const east = byName.get("东疆");

    expect(north?.unitIds).toEqual(
      expect.arrayContaining(["650100", "654000", "654200", "654300", "659010"])
    );
    expect(south?.unitIds).toEqual(
      expect.arrayContaining(["652900", "653100", "653200", "659002", "659009"])
    );
    expect(east?.unitIds).toEqual(expect.arrayContaining(["650400", "650500"]));

    expect(north?.unitIds).not.toEqual(expect.arrayContaining(["653100", "653200"]));
    expect(east?.unitIds).not.toEqual(expect.arrayContaining(["653100", "653200", "652900"]));
  });
});

