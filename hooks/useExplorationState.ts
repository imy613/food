"use client";

import { useEffect, useMemo, useState } from "react";
import { isDirectControlledMunicipality } from "@/lib/regionSemantics";
import { Food, Province, Region } from "@/types";

type UnitSelection = {
  id: string;
  name: string;
};

const pickInitialFood = (region?: Region): Food | undefined => region?.foods[0];

export const useExplorationState = (province: Province) => {
  const isMunicipality = isDirectControlledMunicipality(province.slug);
  const [selectedUnit, setSelectedUnit] = useState<UnitSelection>();
  const [selectedRegion, setSelectedRegion] = useState<Region>();
  const [selectedFood, setSelectedFood] = useState<Food>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSelectedUnit(undefined);
    setSelectedRegion(undefined);
    setSelectedFood(undefined);
    setSidebarOpen(false);

    if (isMunicipality && province.regions.length > 0) {
      const defaultRegion = province.regions[0];
      const firstFood = pickInitialFood(defaultRegion);

      setSelectedRegion(defaultRegion);
      setSelectedFood(firstFood);
      setSidebarOpen(Boolean(firstFood));
    }
  }, [isMunicipality, province]);

  const visibleFoods = useMemo(() => selectedRegion?.foods.slice(0, 3) ?? [], [selectedRegion]);

  const handleUnitSelect = (unitId: string, unitName: string) => {
    setSelectedUnit({ id: unitId, name: unitName });
    const nextRegion = province.regions.find((region) => region.name === unitName);
    if (!nextRegion) {
      setSelectedRegion(undefined);
      setSelectedFood(undefined);
      setSidebarOpen(false);
      return;
    }

    const firstFood = pickInitialFood(nextRegion);
    setSelectedRegion(nextRegion);
    setSelectedFood(firstFood);

    // 单分区省在用户点击地图后自动展开详情面板。
    if (province.regions.length === 1 && firstFood) {
      setSidebarOpen(true);
      return;
    }

    if (sidebarOpen && !firstFood) {
      setSidebarOpen(false);
    }
  };

  const handleFoodSelect = (foodTitle: string) => {
    const food = visibleFoods.find((item) => item.title === foodTitle);
    if (!food) {
      return;
    }

    setSelectedFood(food);
    setSidebarOpen(true);
  };

  return {
    selectedProvince: province,
    selectedUnit,
    selectedRegion,
    selectedFood,
    sidebarOpen,
    visibleFoods,
    hasRegionContent: Boolean(selectedRegion),
    handleUnitSelect,
    handleFoodSelect,
    setSidebarOpen
  };
};
