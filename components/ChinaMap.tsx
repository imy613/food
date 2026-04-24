"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { chinaProvinceShapes, southChinaSeaInset } from "@/data/chinaMap";
import { mapComplianceMeta } from "@/lib/mapCompliance";
import { motionTokens } from "@/lib/motionTokens";

type ChinaMapProps = {
  onProvinceSelect: (slug: string) => void;
  selectedProvince?: string;
};

export function ChinaMap({ onProvinceSelect, selectedProvince }: ChinaMapProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string>();
  const [activeSlug, setActiveSlug] = useState<string>();
  const timerRef = useRef<number>();

  useEffect(
    () => () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    },
    []
  );

  const handleProvinceClick = (slug: string) => {
    setActiveSlug(slug);
    timerRef.current = window.setTimeout(() => onProvinceSelect(slug), 580);
  };

  return (
    <div className="paper-panel texture-overlay relative w-full rounded-3xl p-5 lg:p-8">
      <svg viewBox="0 0 960 640" className="h-auto w-full">
        <defs>
          <linearGradient id="map-ink-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(31, 26, 23, 0.28)" />
            <stop offset="55%" stopColor="rgba(31, 26, 23, 0.4)" />
            <stop offset="100%" stopColor="rgba(31, 26, 23, 0.24)" />
          </linearGradient>
          <radialGradient id="map-wash-gradient" cx="35%" cy="26%" r="78%">
            <stop offset="0%" stopColor="#F2EADD" />
            <stop offset="100%" stopColor="#E1CEAF" />
          </radialGradient>
          <filter id="map-edge-soften" x="-6%" y="-6%" width="112%" height="112%">
            <feGaussianBlur stdDeviation="0.12" />
          </filter>
          <filter id="map-soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0.4" stdDeviation="0.5" floodColor="rgba(31, 26, 23, 0.18)" />
          </filter>
          <linearGradient id="south-sea-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(221, 204, 174, 0.62)" />
            <stop offset="100%" stopColor="rgba(197, 165, 117, 0.45)" />
          </linearGradient>
        </defs>

        <path
          d={southChinaSeaInset.frame}
          fill="url(#south-sea-gradient)"
          stroke="rgba(31, 26, 23, 0.45)"
          strokeWidth={1.1}
          strokeDasharray="5 4"
        />
        {southChinaSeaInset.dashLine ? (
          <path
            d={southChinaSeaInset.dashLine}
            fill="none"
            stroke="rgba(31, 26, 23, 0.42)"
            strokeWidth={1}
            strokeDasharray="5 6"
            strokeLinecap="round"
            pointerEvents="none"
          />
        ) : null}
        {southChinaSeaInset.boundaryArcs?.map((arcPath, index) => (
          <path
            key={`south-arc-${index}`}
            d={arcPath}
            fill="none"
            stroke="rgba(31, 26, 23, 0.34)"
            strokeWidth={1.1}
            strokeLinecap="round"
            pointerEvents="none"
          />
        ))}
        {southChinaSeaInset.islands.map((islandPath, index) => (
          <path
            key={`inset-island-${index}`}
            d={islandPath}
            fill="#D6B98C"
            stroke="rgba(122, 88, 53, 0.68)"
            strokeWidth={0.8}
          />
        ))}
        {southChinaSeaInset.surfacePoints?.map((point, index) => (
          <circle
            key={`south-surface-${index}`}
            cx={point.x}
            cy={point.y}
            r={2}
            fill="#C79D63"
            stroke="rgba(122, 88, 53, 0.72)"
            strokeWidth={0.35}
          />
        ))}
        {southChinaSeaInset.submergedPoints?.map((point, index) => (
          <circle
            key={`south-submerged-${index}`}
            cx={point.x}
            cy={point.y}
            r={1.85}
            fill="#E6D09B"
            stroke="rgba(122, 88, 53, 0.56)"
            strokeWidth={0.3}
          />
        ))}
        {southChinaSeaInset.groupLabels?.map((group) => (
          <g key={`inset-group-${group.text}`}>
            {group.lineTo ? (
              <line
                x1={group.x}
                y1={group.y}
                x2={group.lineTo.x}
                y2={group.lineTo.y}
                stroke="rgba(31, 26, 23, 0.4)"
                strokeWidth={0.95}
                pointerEvents="none"
              />
            ) : null}
            <text
              x={group.x}
              y={group.y}
              textAnchor={group.textAnchor ?? "middle"}
              fontSize={11.5}
              fill="rgba(31, 26, 23, 0.8)"
              className="select-none font-serifCn"
              pointerEvents="none"
            >
              {group.text}
            </text>
          </g>
        ))}
        {southChinaSeaInset.featureLabels?.map((feature) => (
          <g key={`inset-feature-${feature.text}`}>
            {feature.lineTo ? (
              <line
                x1={feature.x}
                y1={feature.y}
                x2={feature.lineTo.x}
                y2={feature.lineTo.y}
                stroke="rgba(31, 26, 23, 0.36)"
                strokeWidth={0.75}
                pointerEvents="none"
              />
            ) : null}
            <text
              x={feature.x}
              y={feature.y}
              textAnchor={feature.textAnchor ?? "middle"}
              fontSize={8.7}
              fill="rgba(31, 26, 23, 0.68)"
              className="select-none font-serifCn"
              pointerEvents="none"
            >
              {feature.text}
            </text>
          </g>
        ))}
        <text
          x={southChinaSeaInset.label.x}
          y={southChinaSeaInset.label.y}
          textAnchor="middle"
          fontSize={12}
          fill="rgba(31, 26, 23, 0.76)"
          className="select-none font-serifCn"
        >
          南海诸岛
        </text>

        {chinaProvinceShapes.map((province) => {
          const isSelected = selectedProvince === province.slug || activeSlug === province.slug;
          const isHovered = hoveredSlug === province.slug;
          const faded = Boolean(activeSlug) && activeSlug !== province.slug;

          return (
            <g key={province.slug}>
              <motion.path
                data-testid={`province-${province.slug}`}
                d={province.path}
                fill={isSelected ? "#C79D63" : isHovered ? "#D7BC93" : "url(#map-wash-gradient)"}
                stroke="url(#map-ink-stroke)"
                strokeWidth={1.05}
                filter="url(#map-edge-soften)"
                className="outline-none focus:outline-none"
                style={{ cursor: "pointer", transformBox: "fill-box", transformOrigin: "center" }}
                initial={false}
                animate={{
                  opacity: faded ? 0.2 : 1,
                  scale: isSelected ? 1.04 : isHovered ? 1.02 : 1
                }}
                transition={{ duration: motionTokens.quick, ease: motionTokens.ease }}
                onMouseEnter={() => setHoveredSlug(province.slug)}
                onMouseLeave={() => setHoveredSlug(undefined)}
                onClick={() => handleProvinceClick(province.slug)}
                role="button"
                aria-label={`${province.name}省份`}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleProvinceClick(province.slug);
                  }
                }}
              />
              {province.hitPath ? (
                <path
                  d={province.hitPath}
                  fill="transparent"
                  stroke="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredSlug(province.slug)}
                  onMouseLeave={() => setHoveredSlug(undefined)}
                  onClick={() => handleProvinceClick(province.slug)}
                />
              ) : null}
              {province.label.lineTo ? (
                <line
                  x1={province.label.lineTo.x}
                  y1={province.label.lineTo.y}
                  x2={province.label.x}
                  y2={province.label.y}
                  stroke="rgba(31, 26, 23, 0.42)"
                  strokeWidth={1}
                  pointerEvents="none"
                />
              ) : null}
              <text
                x={province.label.x}
                y={province.label.y}
                fontSize={isSelected ? (province.label.fontSize ?? 13) + 1 : (province.label.fontSize ?? 13)}
                textAnchor={province.label.textAnchor ?? "middle"}
                fill="rgba(31, 26, 23, 0.9)"
                filter="url(#map-soft-shadow)"
                className="select-none font-serifCn"
                pointerEvents="none"
              >
                {province.name}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-3 text-right text-xs tracking-[0.16em] text-ink/60">点击省份进入省域分区食味</p>
      <div className="mt-2 border-t border-ink/10 pt-2 text-[11px] leading-5 text-ink/62" data-testid="map-compliance-note">
        <p>{mapComplianceMeta.approvalNumber}</p>
        <p>{mapComplianceMeta.source}</p>
        <p>{mapComplianceMeta.southChinaSeaNote}</p>
      </div>
    </div>
  );
}
