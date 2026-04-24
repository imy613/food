"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { HomeExperience } from "@/components/HomeExperience";
import { PageTransition } from "@/components/PageTransition";
import { SplashScreen } from "@/components/SplashScreen";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <main className="min-h-screen">
      <AnimatePresence>{showSplash ? <SplashScreen onComplete={() => setShowSplash(false)} /> : null}</AnimatePresence>
      <PageTransition>
        <HomeExperience />
      </PageTransition>
    </main>
  );
}

