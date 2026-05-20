import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const GlassCard = forwardRef(({
  children,
  className = '',
  hover = true,
  delay = 0,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/70 dark:bg-dark-surface/60
        backdrop-blur-xl
        border border-gray-200/80 dark:border-white/[0.08]
        premium-shadow
        ${hover ? 'cursor-pointer hover:glow-border' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Subtle top border gradient accent on hover */}
      {hover && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
      {children}
    </motion.div>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;
