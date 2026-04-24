"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { loadProvincePartitionMap } from "@/data/provincePartitions/loaders";
import { mapComplianceMeta } from "@/lib/mapCompliance";
import { motionTokens } from "@/lib/motionTokens";
import { toRegionDisplayName } from "@/lib/regionSemantics";
import { Province, ProvincePartitionMapData } from "@/types";

type ProvinceMapProps = {
  province: Province;
  selectedUnitId?: string;
  onUnitSelect: (unitId: string, unitName: string) => void;
};

export function ProvinceMap({ province, selectedUnitId, onUnitSelect }: ProvinceMapProps) {
  const [hoverUnitId, setHoverUnitId] = useState<string>();
  const [mapData, setMapData] = useState<ProvincePartitionMapData>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const loadTask = loadProvincePartitionMap(province.slug);

    if (!loadTask) {
      setMapData(undefined);
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    loadTask
      .then((partitionMap) => {
        if (!alive) return;
        setMapData(partitionMap);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [province.slug]);

  if (loading) {
    return (
      <div className="paper-panel texture-overlay flex h-[420px] items-center justify-center rounded-3xl px-8 text-center">
        <div>
          <p className="ink-title text-2xl tracking-[0.2em]">{province.name}</p>
          <p className="mt-4 text-sm text-ink/70">正在加载分区地图数据，请稍候。</p>
        </div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="paper-panel texture-overlay flex h-[420px] items-center justify-center rounded-3xl px-8 text-center">
        <div>
          <p className="ink-title text-2xl tracking-[0.2em]">{province.name}</p>
          <p className="mt-4 text-sm text-ink/70">该省分区地图暂不可用，请稍后重试。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-panel texture-overlay rounded-3xl p-4 md:p-6">
      <svg viewBox={mapData.viewBox} className="h-auto w-full">
        {mapData.partitions.map((shape) => {
          const selected = selectedUnitId === shape.id;
          const hovered = hoverUnitId === shape.id;
          const labelFontSize = shape.label.fontSize ?? 11;
          const fill = selected ? "#C79D63" : hovered ? "#D7BC93" : "#E8DDCB";
          const displayName = toRegionDisplayName(shape.name);
          const ariaLabel = displayName ? `${displayName}分区` : `${province.name}分区`;

          return (
            <g key={shape.id}>
              <motion.path
                data-testid={`region-${shape.id}`}
                d={shape.paths.join(" ")}
                fill={fill}
                stroke="rgba(31, 26, 23, 0.35)"
                strokeWidth={1.15}
                className="outline-none focus:outline-none"
                initial={false}
                animate={{ scale: selected ? 1.01 : hovered ? 1.005 : 1 }}
                transition={{ duration: motionTokens.quick, ease: motionTokens.ease }}
                style={{ transformBox: "fill-box", transformOrigin: "center", cursor: "pointer" }}
                onClick={() => onUnitSelect(shape.id, shape.name)}
                onMouseEnter={() => setHoverUnitId(shape.id)}
                onMouseLeave={() => setHoverUnitId(undefined)}
                role="button"
                aria-label={ariaLabel}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onUnitSelect(shape.id, shape.name);
                  }
                }}
              />
              {shape.hitPath ? (
                <path
                  d={shape.hitPath}
                  fill="transparent"
                  stroke="transparent"
                  style={{ cursor: "pointer" }}
                  onClick={() => onUnitSelect(shape.id, shape.name)}
                  onMouseEnter={() => setHoverUnitId(shape.id)}
                  onMouseLeave={() => setHoverUnitId(undefined)}
                />
              ) : null}
              {displayName ? (
                <text
                  x={shape.label.x}
                  y={shape.label.y}
                  textAnchor={shape.label.textAnchor ?? "middle"}
                  fontSize={selected ? labelFontSize + 0.6 : labelFontSize}
                  fill="#1F1A17"
                  className="pointer-events-none select-none font-serifCn"
                >
                  {displayName}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 border-t border-ink/10 pt-2 text-[11px] leading-5 text-ink/62" data-testid="province-map-compliance-note">
        <p>{mapComplianceMeta.approvalNumber}</p>
        <p>{mapComplianceMeta.source}</p>
      </div>
    </div>
  );
}
