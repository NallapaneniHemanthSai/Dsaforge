import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Code, BarChart2, Users, Layers, Trophy, Moon, Filter, Activity, Bookmark } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Use separate components for sections to keep file clean
const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const slides = [
    {
      id: 1,
      title: "Forge Your DSA Skills",
      subtitle: "Track every problem. Run real code. Beat the grind.",
      cta1: "Get Started Free →",
      cta2: "View Problems",
      link1: "/signup",
      link2: "/problems",
      bgClass: "bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-transparent"
    },
    {
      id: 2,
      title: "Write & Run Java Code Instantly",
      subtitle: "Built-in Monaco editor with real Judge0 compilation.",
      cta1: "Try Editor →",
      cta2: "Sign Up",
      link1: "/editor/demo",
      link2: "/signup",
      bgClass: "bg-gradient-to-tr from-blue-500/10 via-cyan-500/5 to-transparent dark:from-blue-900/20 dark:via-cyan-900/10 dark:to-transparent",
      visual: <CodeVisual />
    },
    {
      id: 3,
      title: "Track Every Problem You Solve",
      subtitle: "Visual dashboards, streaks, topic heatmaps & more.",
      cta1: "View Dashboard →",
      cta2: "Features",
      link1: "/dashboard",
      link2: "#features",
      bgClass: "bg-gradient-to-bl from-green-500/10 via-emerald-500/5 to-transparent dark:from-green-900/20 dark:via-emerald-900/10 dark:to-transparent",
      visual: <ProgressVisual />
    },
    {
      id: 4,
      title: "Built Exclusively for KL University",
      subtitle: "Verified KL emails only. Your campus DSA home.",
      cta1: "Join DSAForge Now →",
      cta2: "Leaderboard",
      link1: "/signup",
      link2: "/leaderboard",
      bgClass: "bg-gradient-to-tl from-rose-500/10 via-orange-500/5 to-transparent dark:from-rose-900/20 dark:via-orange-900/10 dark:to-transparent"
    }
  ];

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div 
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden pt-16"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out flex flex-col items-center justify-center px-4 ${slide.bgClass} ${
            index === currentSlide ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'
          }`}
        >
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 leading-tight">
              {slide.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              {slide.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to={slide.link1} className="btn-primary text-lg px-8 py-4 w-full sm:w-auto shadow-lg shadow-accent-light/30">
                {slide.cta1}
              </Link>
              <Link to={slide.link2} className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
                {slide.cta2}
              </Link>
            </div>
            {slide.id === 4 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Created with ♥ by nallapanenihemanthsai</p>
            )}
            {slide.visual && (
              <div className="mt-8 mx-auto hidden md:block">
                {slide.visual}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button onClick={prevSlide} className="absolute left-4 md:left-10 z-20 p-3 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md hover:bg-white/40 dark:hover:bg-black/40 transition-colors hidden sm:block">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={nextSlide} className="absolute right-4 md:right-10 z-20 p-3 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md hover:bg-white/40 dark:hover:bg-black/40 transition-colors hidden sm:block">
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-10 z-20 flex gap-3">
        {slides.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-accent-light' : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const CodeVisual = () => (
  <div className="w-[600px] h-[200px] bg-[#1e1e1e] rounded-xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col text-left text-sm font-mono animate-fade-in relative">
    <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>
      <span className="ml-4 text-gray-400 text-xs">Solution.java</span>
    </div>
    <div className="p-4 text-gray-300 leading-relaxed">
      <span className="text-purple-400">class</span> <span className="text-yellow-200">Solution</span> {'{\n'}
      {'  '} <span className="text-purple-400">public</span> <span className="text-blue-400">int</span>[] <span className="text-blue-200">twoSum</span>(<span className="text-blue-400">int</span>[] nums, <span className="text-blue-400">int</span> target) {'{\n'}
      {'    '} <span className="text-gray-500">// Your code here...</span>{'\n'}
      {'    '} <span className="text-purple-400">return</span> <span className="text-purple-400">new</span> <span className="text-blue-400">int</span>[] {'{}'};\n
      {'  }'}\n
      {'}'}
    </div>
  </div>
);

const ProgressVisual = () => (
  <div className="w-[500px] h-[200px] bg-white dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border shadow-2xl p-6 flex items-center justify-between animate-fade-in">
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="12" className="text-gray-100 dark:text-gray-800" />
        <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray="351" strokeDashoffset="120" className="text-accent-light" strokeLinecap="round" />
      </svg>
      <div className="absolute text-2xl font-bold">65%</div>
    </div>
    <div className="flex-1 ml-8 space-y-4">
      <div>
        <div className="flex justify-between text-xs mb-1 font-medium"><span className="text-green-500">Easy</span><span>45/50</span></div>
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full"><div className="h-full bg-green-500 rounded-full w-[90%]"></div></div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1 font-medium"><span className="text-yellow-500">Medium</span><span>80/150</span></div>
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full"><div className="h-full bg-yellow-500 rounded-full w-[53%]"></div></div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1 font-medium"><span className="text-red-500">Hard</span><span>12/50</span></div>
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full"><div className="h-full bg-red-500 rounded-full w-[24%]"></div></div>
      </div>
    </div>
  </div>
);

export default function Landing() {
  const features = [
    { icon: <Code className="w-6 h-6" />, title: "Code Editor", desc: "Write Java directly in the browser with Monaco editor." },
    { icon: <BarChart2 className="w-6 h-6" />, title: "Progress Dashboard", desc: "Visualize your journey with charts and heatmaps." },
    { icon: <Layers className="w-6 h-6" />, title: "850+ Problems", desc: "Curated lists from Striver, NeetCode, Blind 75, and more." },
    { icon: <Filter className="w-6 h-6" />, title: "Topic Filters", desc: "Find exactly what you need to practice." },
    { icon: <Activity className="w-6 h-6" />, title: "Daily Streaks", desc: "Build consistency and track your longest streaks." },
    { icon: <Moon className="w-6 h-6" />, title: "Dark Mode", desc: "Easy on the eyes for those late-night coding sessions." },
  ];

  const sheets = [
    { name: "Striver's A2Z", color: "from-red-500 to-orange-500" },
    { name: "Striver's SDE", color: "from-blue-500 to-indigo-500" },
    { name: "NeetCode 150", color: "from-green-500 to-emerald-500" },
    { name: "Blind 75", color: "from-purple-500 to-pink-500" },
    { name: "Love Babbar", color: "from-yellow-400 to-orange-500" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <HeroSlider />

        {/* Features Section */}
        <section id="features" className="py-24 bg-white dark:bg-dark-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Everything You Need to Succeed</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Stop jumping between multiple platforms. DSAForge provides a unified experience for learning, practicing, and tracking your progress.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="card p-6 group hover:-translate-y-2 transition-transform duration-300 cursor-default">
                  <div className="w-12 h-12 rounded-lg bg-accent-light/10 text-accent-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem Sheets */}
        <section className="py-24 bg-gray-50 dark:bg-dark-surface/50 border-y border-light-border dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-12 text-gray-900 dark:text-white">Integrated Popular DSA Sheets</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {sheets.map((sheet, i) => (
                <div key={i} className={`bg-gradient-to-r ${sheet.color} p-[1px] rounded-2xl shadow-lg hover:scale-105 transition-transform cursor-pointer`}>
                  <div className="bg-white dark:bg-dark-surface px-8 py-4 rounded-2xl">
                    <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                      {sheet.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-white dark:bg-dark-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-16 text-center text-gray-900 dark:text-white">How It Works</h2>
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 hidden md:block"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border p-8 rounded-2xl text-center shadow-xl">
                  <div className="w-16 h-16 rounded-full bg-accent-light text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-accent-light/30">1</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Sign Up</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Register using your KL University email and verify via OTP.</p>
                </div>
                <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border p-8 rounded-2xl text-center shadow-xl">
                  <div className="w-16 h-16 rounded-full bg-accent-light text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-accent-light/30">2</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Solve Problems</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Browse sheets, write Java code, and compile instantly.</p>
                </div>
                <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border p-8 rounded-2xl text-center shadow-xl">
                  <div className="w-16 h-16 rounded-full bg-accent-light text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-accent-light/30">3</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Track Progress</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Maintain streaks, view dashboards, and climb the leaderboard.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-16 bg-accent-light text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
              <div>
                <div className="text-4xl font-extrabold mb-2">850+</div>
                <div className="text-accent-light/20 text-white/80 font-medium">Problems</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold mb-2">5</div>
                <div className="text-accent-light/20 text-white/80 font-medium">DSA Sheets</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold mb-2">Java</div>
                <div className="text-accent-light/20 text-white/80 font-medium">Execution</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold mb-2">KLU</div>
                <div className="text-accent-light/20 text-white/80 font-medium">Students Only</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
