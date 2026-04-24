"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChinaMap } from "./ChinaMap";
import { HomeGuideModal } from "./HomeGuideModal";
import { onboardingStorageKey } from "@/lib/mapCompliance";

export function HomeExperience() {
  const router = useRouter();
  const [selectedProvince, setSelectedProvince] = useState<string>();
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(onboardingStorageKey);
    if (!seen) {
      setGuideOpen(true);
    }
  }, []);

  const closeGuide = () => {
    setGuideOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(onboardingStorageKey, "1");
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-desktop px-4 pb-8 pt-8 md:px-8 lg:px-10 lg:pt-10">
      <div className="absolute right-4 top-3 z-20 flex items-center gap-3 md:right-8 md:top-4 lg:right-10">
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="rounded-full border border-ink/20 bg-paper/78 px-3 py-1 text-xs tracking-[0.08em] text-ink/78 backdrop-blur transition hover:border-ink/38 hover:text-ink"
        >
          使用指南
        </button>
        <h1 className="ink-title text-lg tracking-[0.24em] text-ink/90 md:text-xl lg:text-2xl">寻味山河</h1>
      </div>
      <section className="relative">
        <ChinaMap
          selectedProvince={selectedProvince}
          onProvinceSelect={(slug) => {
            setSelectedProvince(slug);
            router.push(`/province/${slug}`);
          }}
        />
      </section>
      <HomeGuideModal open={guideOpen} onClose={closeGuide} />
    </div>
  );
}
