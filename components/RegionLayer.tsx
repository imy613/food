"use client";

import { motion } from "framer-motion";
import { ProvinceUnitShape } from "@/types";
import { motionTokens } from "@/lib/motionTokens";

type RegionLayerProps = {
  shape: ProvinceUnitShape;
  selected: boolean;
  hovered: boolean;
  onSelect: (unitId: string, unitName: string) => void;
  onHover: (unitId?: string) => void;
};

export function RegionLayer({
  shape,
  selected,
  hovered,
  onSelect,
  onHover
}: RegionLayerProps) {
  return (
    <>
      <motion.path
        data-testid={`region-${shape.id}`}
        d={shape.path}
        fill={selected || hovered ? "#D6B98C" : "#E8DDCB"}
        stroke={selected ? "#B63A2B" : "rgba(31, 26, 23, 0.35)"}
        strokeWidth={selected ? 2.2 : 1.2}
        initial={false}
        animate={{ scale: selected ? 1.02 : hovered ? 1.01 : 1 }}
        transition={{ duration: motionTokens.quick, ease: motionTokens.ease }}
        style={{ transformBox: "fill-box", transformOrigin: "center", cursor: "pointer" }}
        onClick={() => onSelect(shape.id, shape.name)}
        onMouseEnter={() => onHover(shape.id)}
        onMouseLeave={() => onHover(undefined)}
        role="button"
        aria-label={`${shape.name}区域`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(shape.id, shape.name);
          }
        }}
      />
      {shape.hitPath ? (
        <path
          d={shape.hitPath}
          fill="transparent"
          stroke="transparent"
          style={{ cursor: "pointer" }}
          onClick={() => onSelect(shape.id, shape.name)}
          onMouseEnter={() => onHover(shape.id)}
          onMouseLeave={() => onHover(undefined)}
        />
      ) : null}
    </>
  );
}
