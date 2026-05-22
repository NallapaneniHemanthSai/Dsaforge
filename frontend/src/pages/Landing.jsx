import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Code, BarChart2, Layers, Filter, Activity, Moon,
  ChevronRight, Zap, Target, TrendingUp, BookOpen,
  ArrowRight, Play, Star, Users, Trophy
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlassCard from '../components/ui/GlassCard';
import useCountUp from '../hooks/useCountUp';

/* ── Subtle Page Background ── */
const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(99,102,241,0.08),transparent_38%,rgba(6,182,212,0.05))] dark:bg-[linear-gradient(to_bottom,rgba(99,102,241,0.12),rgba(9,9,11,0)_42%,rgba(6,182,212,0.06))]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_36%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%)]" />
  </div>
);

/* ── Stat Counter ── */
const StatItem = ({ value, suffix = '', label }) => {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center px-6">
      <div className="text-4xl md:text-5xl font-extrabold text-white mb-1">
        {count}{suffix}
      </div>
      <div className="text-white/70 text-sm font-medium">{label}</div>
    </div>
  );
};

/* ── Hero Section ── */
const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-light-bg pt-20 pb-16 dark:bg-dark-bg">
      <FloatingOrbs />
      <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8"
        >
          <Zap className="w-4 h-4" /> Built for KL University Students
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] mb-6"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-gray-400">
            Master DSA.
          </span>
          <br />
          <span className="gradient-text">
            Crack Placements.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Track every problem. Write & run code in-browser. Build streaks.
          Climb the leaderboard. Your complete placement preparation ecosystem.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-lg font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/problems"
            className="group inline-flex items-center gap-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-900 dark:text-white text-lg font-semibold px-8 py-4 rounded-xl transition-all"
          >
            <Play className="w-5 h-5" />
            Explore Problems
          </Link>
        </motion.div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="relative mx-auto max-w-4xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-light-bg dark:from-dark-bg via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
          <div className="rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Mock Browser Bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 ml-3 h-6 rounded-md bg-gray-200/80 dark:bg-gray-700/50 flex items-center px-3">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">dsaforge.app/dashboard</span>
              </div>
            </div>
            {/* Mock Dashboard Content */}
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-4">
                <div className="flex gap-4">
                  {['Problems Solved', 'Current Streak', 'Accuracy'].map((label, i) => (
                    <div key={i} className="flex-1 rounded-xl bg-gray-50 dark:bg-dark-bg/60 border border-gray-100 dark:border-white/5 p-4">
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">{label}</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {['247', '14🔥', '89%'][i]}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Mock Heatmap */}
                <div className="rounded-xl bg-gray-50 dark:bg-dark-bg/60 border border-gray-100 dark:border-white/5 p-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">Contribution Heatmap</div>
                  <div className="flex gap-[3px] flex-wrap">
                    {Array.from({ length: 52 }).map((_, i) => (
                      <div key={i} className="flex flex-col gap-[3px]">
                        {Array.from({ length: 7 }).map((_, j) => {
                          const intensity = Math.random();
                          const bg = intensity > 0.7 ? 'bg-primary' : intensity > 0.4 ? 'bg-primary/50' : intensity > 0.15 ? 'bg-primary/20' : 'bg-gray-200 dark:bg-gray-800';
                          return <div key={j} className={`w-[8px] h-[8px] rounded-[2px] ${bg}`} />;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Sidebar stats */}
              <div className="space-y-4">
                <div className="rounded-xl bg-gray-50 dark:bg-dark-bg/60 border border-gray-100 dark:border-white/5 p-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">Topic Progress</div>
                  {['Arrays', 'Trees', 'DP', 'Graphs'].map((t, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{t}</span>
                        <span className="text-gray-400">{[78, 54, 32, 45][i]}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${[78, 54, 32, 45][i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-gradient-to-br from-primary to-purple-600 p-4 text-white">
                  <div className="text-xs opacity-80 mb-1">Weekly Goal</div>
                  <div className="text-2xl font-bold">5/7</div>
                  <div className="text-xs opacity-70 mt-1">2 more to go!</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

/* ── Features Section ── */
const features = [
  { icon: Code, title: 'Code Editor', desc: 'Write Java directly in-browser with Monaco editor and Judge0 compilation.' },
  { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Heatmaps, topic charts, streak tracking, and weekly goal insights.' },
  { icon: Layers, title: '850+ Problems', desc: 'Curated from Striver A2Z, NeetCode 150, Blind 75, Love Babbar & more.' },
  { icon: Filter, title: 'Smart Filters', desc: 'Filter by topic, difficulty, company, and completion status instantly.' },
  { icon: Activity, title: 'Streaks & Goals', desc: 'Build consistency with daily streaks and personalized weekly goals.' },
  { icon: Moon, title: 'Dark Mode', desc: 'Easy on the eyes for those late-night coding sessions.' },
];

const FeaturesSection = () => (
  <section id="features" className="relative py-24 bg-light-bg dark:bg-dark-bg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Everything You Need to Succeed
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Stop jumping between platforms. DSAForge gives you a unified workspace for learning, practicing, and tracking progress.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <GlassCard key={i} delay={i * 0.08} className="p-6 group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  </section>
);

/* ── Why DSAForge Section ── */
const whyItems = [
  { icon: Target, title: 'Placement-Focused', desc: 'Every feature is designed around cracking coding interviews.' },
  { icon: TrendingUp, title: 'Track Progress', desc: 'See exactly where you stand with detailed analytics and heatmaps.' },
  { icon: Trophy, title: 'Stay Competitive', desc: 'Leaderboards and streaks keep you motivated and consistent.' },
  { icon: BookOpen, title: 'Curated Content', desc: '5 popular DSA sheets integrated with 850+ handpicked problems.' },
];

const WhySection = () => (
  <section className="py-24 bg-gray-100/70 dark:bg-[#0d0f14] border-y border-light-border dark:border-dark-border">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Why DSAForge?
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Built exclusively for KL University students preparing for placements.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {whyItems.map((item, i) => (
          <GlassCard key={i} delay={i * 0.1} className="p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary flex items-center justify-center mx-auto mb-4">
              <item.icon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  </section>
);

/* ── Sheets Section ── */
const sheets = [
  { name: "Striver's A2Z", color: 'from-red-500 to-orange-500' },
  { name: "Striver's SDE", color: 'from-blue-500 to-indigo-500' },
  { name: 'NeetCode 150', color: 'from-green-500 to-emerald-500' },
  { name: 'Blind 75', color: 'from-purple-500 to-pink-500' },
  { name: 'Love Babbar', color: 'from-yellow-400 to-orange-500' },
];

const SheetsSection = () => (
  <section className="py-24 bg-light-bg dark:bg-dark-bg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-gray-900 dark:text-white mb-12"
      >
        Integrated Popular DSA Sheets
      </motion.h2>
      <div className="flex flex-wrap justify-center gap-4">
        {sheets.map((sheet, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.05 }}
            className={`bg-gradient-to-r ${sheet.color} p-[1.5px] rounded-2xl shadow-lg cursor-pointer`}
          >
            <div className="bg-white dark:bg-dark-surface px-8 py-4 rounded-2xl">
              <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                {sheet.name}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ── Stats Section ── */
const StatsSection = () => (
  <section className="py-16 bg-gradient-to-r from-primary via-purple-600 to-blue-600 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <StatItem value={850} suffix="+" label="Problems" />
        <StatItem value={5} label="DSA Sheets" />
        <StatItem value={4} label="Languages" />
        <StatItem value={100} suffix="%" label="Free" />
      </div>
    </div>
  </section>
);

/* ── How It Works Section ── */
const steps = [
  { num: '1', title: 'Sign Up', desc: 'Register with your KL University email and verify via OTP.' },
  { num: '2', title: 'Solve Problems', desc: 'Browse sheets, write code, and compile instantly in the browser.' },
  { num: '3', title: 'Track Progress', desc: 'Maintain streaks, view dashboards, and climb the leaderboard.' },
];

const HowItWorks = () => (
  <section className="py-24 bg-gray-100/70 dark:bg-[#0d0f14] border-y border-light-border dark:border-dark-border">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-16"
      >
        How It Works
      </motion.h2>
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 hidden md:block" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {steps.map((step, i) => (
            <GlassCard key={i} delay={i * 0.15} hover={false} className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg shadow-primary/30">
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{step.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ── CTA Section ── */
const CTASection = () => (
  <section className="py-24 bg-light-bg dark:bg-dark-bg relative overflow-hidden">
    <FloatingOrbs />
    <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Ready to Forge Your
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500"> DSA Skills</span>?
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
          Join your fellow KLU students and start your placement preparation journey today.
        </p>
        <Link
          to="/signup"
          className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-lg font-semibold px-10 py-4 rounded-xl transition-all shadow-lg shadow-primary/25"
        >
          Start Practicing Now
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  </section>
);

/* ── Main Landing Page ── */
export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg text-gray-900 dark:bg-dark-bg dark:text-gray-100">
      <Navbar />
      <main className="flex-1 bg-light-bg dark:bg-dark-bg">
        <HeroSection />
        <FeaturesSection />
        <SheetsSection />
        <WhySection />
        <StatsSection />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
