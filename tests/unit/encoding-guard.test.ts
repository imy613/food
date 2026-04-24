import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const filesToGuard = [
  "app/layout.tsx",
  "components/SplashScreen.tsx",
  "components/ChinaMap.tsx",
  "components/HomeExperience.tsx",
  "components/HomeGuideModal.tsx",
  "components/BackButton.tsx",
  "components/ProvinceExplorer.tsx",
  "components/SidebarPanel.tsx",
  "lib/mapCompliance.ts",
  "data/provinces.json",
  "data/chinaMap.ts"
];

const forbiddenTokens = [
  "鍗楁捣璇稿矝",
  "瀵诲懗灞辨渤",
  "鐪佷唤",
  "杩斿洖鍏ㄥ浗鍦板浘",
  "",
  "�"
];

describe("encoding guard", () => {
  it("keeps critical files free of known mojibake tokens", () => {
    for (const file of filesToGuard) {
      const absolutePath = path.resolve(process.cwd(), file);
      const content = fs.readFileSync(absolutePath, "utf8");

      for (const token of forbiddenTokens) {
        expect(content.includes(token), `${file} contains forbidden token: ${token}`).toBe(false);
      }
    }
  });

  it("keeps canonical Chinese copy visible", () => {
    const splash = fs.readFileSync(path.resolve(process.cwd(), "components/SplashScreen.tsx"), "utf8");
    const map = fs.readFileSync(path.resolve(process.cwd(), "components/ChinaMap.tsx"), "utf8");
    const backButton = fs.readFileSync(path.resolve(process.cwd(), "components/BackButton.tsx"), "utf8");
    const compliance = fs.readFileSync(path.resolve(process.cwd(), "lib/mapCompliance.ts"), "utf8");

    expect(splash.includes("寻味山河")).toBe(true);
    expect(splash.includes("在地图上探索中华地域美食文化")).toBe(true);
    expect(map.includes("南海诸岛")).toBe(true);
    expect(backButton.includes("返回全国地图")).toBe(true);
    expect(compliance.includes("审图号")).toBe(true);
    expect(compliance.includes("提交前补齐")).toBe(true);
    expect(compliance.includes("http://bzdt.ch.mnr.gov.cn/")).toBe(true);
  });
});
