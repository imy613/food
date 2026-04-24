"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { chinaProvinceShapes, southChinaSeaInset } from "@/data/chinaMap";
import { mapComplianceMeta } from "@/lib/mapCompliance";
import { motionTokens } from "@/lib/motionTokens";

type SplashScreenProps = {
  onComplete: () => void;
};

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2600);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  const washDelay = prefersReducedMotion ? 0 : 0.12;
  const strokeStart = prefersReducedMotion ? 0 : 0.32;
  const strokeDuration = prefersReducedMotion ? 0.25 : 0.74;
  const strokeStagger = prefersReducedMotion ? 0 : 0.032;
  const titleDelay = prefersReducedMotion ? 0.2 : 1.72;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-paper"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: motionTokens.medium, ease: motionTokens.ease }}
    >
      <div className="paper-panel texture-overlay w-[90%] max-w-5xl rounded-3xl p-8 md:p-14">
        <div className="mx-auto max-w-3xl">
          <svg viewBox="0 0 960 640" className="h-auto w-full">
            <defs>
              <linearGradient id="ink-brush-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2A211B" stopOpacity="0.7" />
                <stop offset="55%" stopColor="#1F1A17" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#120E0B" stopOpacity="0.74" />
              </linearGradient>
              <radialGradient id="ink-wash-gradient" cx="36%" cy="28%" r="74%">
                <stop offset="0%" stopColor="#EFE4D3" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#E3D3BB" stopOpacity="0.42" />
              </radialGradient>
              <linearGradient id="splash-south-sea-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(232, 221, 203, 0.64)" />
                <stop offset="100%" stopColor="rgba(214, 185, 140, 0.48)" />
              </linearGradient>
              <filter id="ink-soften" x="-12%" y="-12%" width="124%" height="124%">
                <feGaussianBlur stdDeviation="0.38" />
              </filter>
            </defs>

            <g>
              {chinaProvinceShapes.map((province, index) => (
                <motion.path
                  key={`splash-wash-${province.slug}`}
                  d={province.path}
                  fill="url(#ink-wash-gradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.78 }}
                  transition={{
                    delay: washDelay + index * (strokeStagger * 0.45),
                    duration: 0.48,
                    ease: motionTokens.ease
                  }}
                />
              ))}
            </g>

            <g filter="url(#ink-soften)">
              {chinaProvinceShapes.map((province, index) => (
                <motion.path
                  key={`splash-stroke-${province.slug}`}
                  data-testid={`splash-province-${province.slug}`}
                  d={province.path}
                  fill="transparent"
                  stroke="url(#ink-brush-gradient)"
                  strokeWidth={1.36}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={prefersReducedMotion ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
                  animate={prefersReducedMotion ? { opacity: 0.95 } : { pathLength: 1, opacity: 0.95 }}
                  transition={{
                    delay: strokeStart + index * strokeStagger,
                    duration: strokeDuration,
                    ease: motionTokens.ease
                  }}
                />
              ))}
            </g>

            <motion.path
              d={southChinaSeaInset.frame}
              fill="url(#splash-south-sea-gradient)"
              stroke="rgba(31, 26, 23, 0.44)"
              strokeWidth={1}
              strokeDasharray="5 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.82 }}
              transition={{ delay: prefersReducedMotion ? 0.06 : 1.36, duration: 0.34, ease: motionTokens.ease }}
            />
            {southChinaSeaInset.dashLine ? (
              <motion.path
                d={southChinaSeaInset.dashLine}
                fill="none"
                stroke="rgba(31, 26, 23, 0.42)"
                strokeWidth={1}
                strokeDasharray="5 6"
                strokeLinecap="round"
                initial={prefersReducedMotion ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
                animate={prefersReducedMotion ? { opacity: 0.88 } : { pathLength: 1, opacity: 0.88 }}
                transition={{
                  delay: prefersReducedMotion ? 0.1 : 1.45,
                  duration: prefersReducedMotion ? 0.2 : 0.42,
                  ease: motionTokens.ease
                }}
              />
            ) : null}
            {southChinaSeaInset.boundaryArcs?.map((arcPath, index) => (
              <motion.path
                key={`splash-inset-arc-${index}`}
                d={arcPath}
                fill="none"
                stroke="rgba(31, 26, 23, 0.34)"
                strokeWidth={1}
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.88 }}
                transition={{
                  delay: prefersReducedMotion ? 0.12 : 1.46 + index * 0.02,
                  duration: 0.24,
                  ease: motionTokens.ease
                }}
              />
            ))}
            {southChinaSeaInset.islands.map((islandPath, index) => (
              <motion.path
                key={`splash-island-${index}`}
                d={islandPath}
                fill="#D6B98C"
                stroke="rgba(122, 88, 53, 0.68)"
                strokeWidth={0.8}
                initial={prefersReducedMotion ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
                animate={prefersReducedMotion ? { opacity: 0.95 } : { pathLength: 1, opacity: 0.95 }}
                transition={{
                  delay: prefersReducedMotion ? 0.08 : 1.42 + index * 0.06,
                  duration: prefersReducedMotion ? 0.2 : 0.34,
                  ease: motionTokens.ease
                }}
              />
            ))}
            {southChinaSeaInset.surfacePoints?.map((point, index) => (
              <motion.circle
                key={`splash-surface-point-${index}`}
                cx={point.x}
                cy={point.y}
                r={1.95}
                fill="#C79D63"
                stroke="rgba(122, 88, 53, 0.72)"
                strokeWidth={0.35}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.94 }}
                transition={{
                  delay: prefersReducedMotion ? 0.1 : 1.52 + index * 0.004,
                  duration: 0.18,
                  ease: motionTokens.ease
                }}
              />
            ))}
            {southChinaSeaInset.submergedPoints?.map((point, index) => (
              <motion.circle
                key={`splash-submerged-point-${index}`}
                cx={point.x}
                cy={point.y}
                r={1.75}
                fill="#E6D09B"
                stroke="rgba(122, 88, 53, 0.56)"
                strokeWidth={0.3}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.92 }}
                transition={{
                  delay: prefersReducedMotion ? 0.1 : 1.56 + index * 0.003,
                  duration: 0.16,
                  ease: motionTokens.ease
                }}
              />
            ))}
            {southChinaSeaInset.groupLabels?.map((group, index) => (
              <g key={`splash-inset-group-${group.text}`}>
                {group.lineTo ? (
                  <motion.line
                    x1={group.x}
                    y1={group.y}
                    x2={group.lineTo.x}
                    y2={group.lineTo.y}
                    stroke="rgba(31, 26, 23, 0.4)"
                    strokeWidth={0.9}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: prefersReducedMotion ? 0.12 : 1.58 + index * 0.03,
                      duration: 0.18,
                      ease: motionTokens.ease
                    }}
                  />
                ) : null}
                <motion.text
                  x={group.x}
                  y={group.y}
                  textAnchor={group.textAnchor ?? "middle"}
                  fontSize={12}
                  fill="rgba(31, 26, 23, 0.82)"
                  className="select-none font-serifCn"
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: prefersReducedMotion ? 0.12 : 1.6 + index * 0.03,
                    duration: 0.22,
                    ease: motionTokens.ease
                  }}
                >
                  {group.text}
                </motion.text>
              </g>
            ))}
            {southChinaSeaInset.featureLabels?.map((feature, index) => (
              <g key={`splash-inset-feature-${feature.text}`}>
                {feature.lineTo ? (
                  <motion.line
                    x1={feature.x}
                    y1={feature.y}
                    x2={feature.lineTo.x}
                    y2={feature.lineTo.y}
                    stroke="rgba(31, 26, 23, 0.36)"
                    strokeWidth={0.75}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.92 }}
                    transition={{
                      delay: prefersReducedMotion ? 0.13 : 1.66 + index * 0.02,
                      duration: 0.16,
                      ease: motionTokens.ease
                    }}
                  />
                ) : null}
                <motion.text
                  x={feature.x}
                  y={feature.y}
                  textAnchor={feature.textAnchor ?? "middle"}
                  fontSize={9}
                  fill="rgba(31, 26, 23, 0.72)"
                  className="select-none font-serifCn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.92 }}
                  transition={{
                    delay: prefersReducedMotion ? 0.13 : 1.67 + index * 0.02,
                    duration: 0.16,
                    ease: motionTokens.ease
                  }}
                >
                  {feature.text}
                </motion.text>
              </g>
            ))}
            <motion.text
              x={southChinaSeaInset.label.x}
              y={southChinaSeaInset.label.y}
              textAnchor="middle"
              fontSize={12}
              fill="rgba(31, 26, 23, 0.76)"
              className="select-none font-serifCn"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0.12 : 1.62, duration: 0.26, ease: motionTokens.ease }}
            >
              南海诸岛
            </motion.text>
          </svg>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: titleDelay, duration: motionTokens.medium, ease: motionTokens.ease }}
            className="mt-4 text-center"
          >
            <h1 className="ink-title text-3xl tracking-[0.28em] md:text-5xl">寻味山河</h1>
            <p className="mt-3 text-sm text-ink/70 md:text-base">在地图上探索中华地域美食文化</p>
            <p className="mt-2 text-[11px] leading-5 text-ink/56">{mapComplianceMeta.approvalNumber}</p>
            <p className="text-[11px] leading-5 text-ink/52">{mapComplianceMeta.source}</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
