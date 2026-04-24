"use client";

import { motion } from "framer-motion";
import { Food } from "@/types";
import { motionTokens } from "@/lib/motionTokens";

type FoodCardProps = {
  food: Food;
  selected: boolean;
  onClick: (foodTitle: string) => void;
};

export function FoodCard({ food, selected, onClick }: FoodCardProps) {
  return (
    <motion.button
      type="button"
      data-testid="food-card"
      onClick={() => onClick(food.title)}
      whileHover={{ y: -4 }}
      transition={{ duration: motionTokens.quick, ease: motionTokens.ease }}
      className={`overflow-hidden rounded-2xl border border-ink/20 text-left outline-none focus:outline-none ${
        selected ? "bg-highlight/70 shadow-paper" : "bg-white/55 hover:bg-highlight/35"
      }`}
      aria-label={food.title}
    >
      <img src={food.image} alt={food.title} className="h-32 w-full object-cover" />
      <div className="space-y-1 px-4 py-3">
        <h3 className="ink-title text-lg">{food.title}</h3>
        <p className="text-xs text-ink/75">{food.story}</p>
      </div>
    </motion.button>
  );
}
