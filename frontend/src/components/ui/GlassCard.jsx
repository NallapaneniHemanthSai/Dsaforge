import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/60 dark:bg-white/[0.04]
        backdrop-blur-xl
        border border-gray-200/60 dark:border-white/[0.08]
        shadow-lg shadow-black/[0.03] dark:shadow-black/[0.2]
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
