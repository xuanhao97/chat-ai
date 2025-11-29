import type { FC } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DotLoadingProps {
  className?: string;
}

/**
 * DotLoading component
 *
 * Purpose: Animated loading indicator with 3 bouncing dots
 * - Smooth bounce animation using framer-motion
 * - Staggered animation for visual appeal
 * - Reusable across different contexts
 */
export const DotLoading: FC<DotLoadingProps> = ({ className }) => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.25,
        repeat: Infinity,
      },
    },
  };

  const dotVariants = {
    animate: {
      y: [0, -6, 0],
      transition: {
        duration: 1.0,
        ease: [0.4, 0, 0.6, 1] as const,
        repeat: Infinity,
      },
    },
  };

  return (
    <motion.div
      className={cn("flex gap-0.5 text-muted-foreground", className)}
      variants={containerVariants}
      initial="animate"
      animate="animate"
    >
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          variants={dotVariants}
          className="inline-block"
        >
          .
        </motion.span>
      ))}
    </motion.div>
  );
};
