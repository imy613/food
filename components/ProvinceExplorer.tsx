"use client";

import { BackButton } from "./BackButton";
import { FoodCard } from "./FoodCard";
import { ProvinceMap } from "./ProvinceMap";
import { SidebarPanel } from "./SidebarPanel";
import { useExplorationState } from "@/hooks/useExplorationState";
import { toRegionDisplayName } from "@/lib/regionSemantics";
import { Province } from "@/types";

type ProvinceExplorerProps = {
  province: Province;
};

export function ProvinceExplorer({ province }: ProvinceExplorerProps) {
  const {
    selectedFood,
    selectedRegion,
    selectedUnit,
    sidebarOpen,
    visibleFoods,
    hasRegionContent,
    handleFoodSelect,
    handleUnitSelect,
    setSidebarOpen
  } = useExplorationState(province);

  const placeholderText = selectedUnit
    ? `${toRegionDisplayName(selectedUnit.name) || province.name} 的美食内容筹备中，正在持续补充。`
    : "点击地图中的通俗分区，查看对应地域食味。";

  const selectedRegionDisplayName = toRegionDisplayName(selectedRegion?.name);

  return (
    <main className="mx-auto min-h-screen w-full max-w-desktop px-6 pb-8 pt-6 lg:px-8">
      <header className="mb-4 flex items-center justify-between">
        <BackButton />
        <div className="text-right">
          <p className="ink-title text-2xl tracking-[0.18em] lg:text-3xl">{province.name}</p>
          <p className="text-xs tracking-[0.2em] text-ink/62">PROVINCE EXPLORATION</p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[7fr_3fr]">
        <section className="space-y-5">
          <ProvinceMap
            province={province}
            selectedUnitId={selectedUnit?.id}
            onUnitSelect={handleUnitSelect}
          />

          {hasRegionContent && visibleFoods.length > 0 ? (
            <div className="paper-panel texture-overlay rounded-3xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="ink-title text-lg tracking-[0.16em]">
                  {selectedRegionDisplayName ? `${selectedRegionDisplayName} · 代表食味` : "代表食味"}
                </p>
                <p className="text-xs text-ink/60">点击卡片展开文化详情</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {visibleFoods.map((food) => (
                  <FoodCard
                    key={food.title}
                    food={food}
                    selected={food.title === selectedFood?.title}
                    onClick={handleFoodSelect}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="paper-panel rounded-3xl px-6 py-8 text-center text-sm text-ink/72">
              {placeholderText}
            </div>
          )}
        </section>

        <section className="min-h-[460px]">
          <SidebarPanel
            food={selectedFood}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </section>
      </div>
    </main>
  );
}
