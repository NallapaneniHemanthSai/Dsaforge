import { motion } from 'framer-motion';

const shimmerVariants = {
  initial: { opacity: 0.5 },
  animate: { opacity: 1, transition: { duration: 0.8, repeat: Infinity, repeatType: 'reverse' } },
};

export default function Skeleton({ className = '', variant = 'rect', lines = 1 }) {
  if (variant === 'circle') {
    return (
      <motion.div
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
        className={`rounded-full bg-gray-200 dark:bg-gray-800 ${className}`}
      />
    );
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            className={`h-4 rounded bg-gray-200 dark:bg-gray-800 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={shimmerVariants}
      initial="initial"
      animate="animate"
      className={`rounded-lg bg-gray-200 dark:bg-gray-800 ${className}`}
    />
  );
}
