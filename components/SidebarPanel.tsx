"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Food } from "@/types";
import { motionTokens } from "@/lib/motionTokens";

type SidebarPanelProps = {
  food?: Food;
  open: boolean;
  onClose?: () => void;
};

export function SidebarPanel({ food, open, onClose }: SidebarPanelProps) {
  return (
    <aside className="h-full">
      <AnimatePresence mode="wait">
        {open && food ? (
          <motion.section
            key={food.title}
            data-testid="sidebar-open"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 18 }}
            transition={{ duration: motionTokens.medium, ease: motionTokens.ease }}
            className="paper-panel texture-overlay flex h-full flex-col overflow-hidden rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <h2 className="ink-title text-2xl">{food.title}</h2>
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-ink/25 px-3 py-1 text-xs transition hover:border-cinnabar/65 hover:text-cinnabar"
                >
                  收起
                </button>
              ) : null}
            </div>
            <div className="overflow-y-auto px-5 py-5">
              <img src={food.image} alt={food.title} className="h-52 w-full rounded-2xl object-cover" />
              <dl className="mt-6 space-y-5 text-sm leading-7 text-ink/90">
                <div>
                  <dt className="ink-title text-base text-cinnabar">起源故事</dt>
                  <dd>{food.story}</dd>
                </div>
                <div>
                  <dt className="ink-title text-base text-cinnabar">烹饪工艺</dt>
                  <dd>{food.craft}</dd>
                </div>
                <div>
                  <dt className="ink-title text-base text-cinnabar">饮食文化</dt>
                  <dd>{food.culture}</dd>
                </div>
                <div>
                  <dt className="ink-title text-base text-cinnabar">方言短句</dt>
                  <dd>{food.dialect}</dd>
                </div>
                <div>
                  <dt className="ink-title text-base text-cinnabar">非遗标签</dt>
                  <dd>{food.heritage}</dd>
                </div>
              </dl>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="placeholder"
            data-testid="sidebar-placeholder"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="paper-panel texture-overlay flex h-full items-center justify-center rounded-3xl px-8 text-center"
          >
            <p className="max-w-xs text-sm leading-7 text-ink/65">
              选择食物卡片后，这里会展开对应的文化故事、烹饪工艺与方言记忆。
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </aside>
  );
}
