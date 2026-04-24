"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      data-testid="back-home"
      onClick={() => router.push("/")}
      className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-paper/70 px-4 py-2 text-sm transition hover:border-cinnabar/45 hover:text-cinnabar"
    >
      <span aria-hidden>←</span>
      返回全国地图
    </button>
  );
}
