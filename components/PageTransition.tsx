"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { motionTokens } from "@/lib/motionTokens";

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionTokens.medium, ease: motionTokens.ease }}
      className="h-full"
    >
      {children}
    </motion.section>
  );
}
