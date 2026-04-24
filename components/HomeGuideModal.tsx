"use client";

import { motion } from "framer-motion";
import { motionTokens } from "@/lib/motionTokens";

type HomeGuideModalProps = {
  open: boolean;
  onClose: () => void;
};

const steps = [
  "在全国地图上移动鼠标，先查看省份名称与位置。",
  "点击任意省份进入省级页面，浏览该省的通俗分区。",
  "点击分区与美食卡片，查看右侧文化详情。"
];

export function HomeGuideModal({ open, onClose }: HomeGuideModalProps) {
  if (!open) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/30 px-4 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: motionTokens.quick, ease: motionTokens.ease }}
    >
      <motion.div
        className="paper-panel texture-overlay relative w-full max-w-xl rounded-3xl p-6 md:p-8"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: motionTokens.medium, ease: motionTokens.ease }}
        role="dialog"
        aria-modal="true"
        aria-label="首页使用指南"
      >
        <h2 className="ink-title text-xl tracking-[0.16em] md:text-2xl">寻味山河 · 使用指南</h2>
        <p className="mt-2 text-sm text-ink/72">首次访问自动展示，可在右上角“使用指南”再次打开。</p>

        <ol className="mt-5 space-y-3 text-sm text-ink/85 md:text-base">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-highlight/55 text-xs text-ink">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink/20 px-4 py-2 text-sm text-ink/78 transition hover:border-ink/35 hover:text-ink"
          >
            我知道了
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-cinnabar px-5 py-2 text-sm text-paper transition hover:bg-cinnabar/90"
          >
            开始探索
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
