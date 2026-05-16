import { Zap, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-dark-surface border-t border-light-border dark:border-dark-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          
          <div className="flex flex-col items-center md:items-start max-w-sm">
            <Link to="/" className="flex items-center space-x-2 group mb-4">
              <Zap className="h-6 w-6 text-accent-light" />
              <span className="text-xl font-bold tracking-tight">DSAForge</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center md:text-left">
              Forge your DSA skills. One problem at a time. Built exclusively for KL University students to ace their technical interviews.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-900 dark:text-white">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link to="/problems" className="hover:text-accent-light transition-colors">Problems</Link></li>
                <li><Link to="/leaderboard" className="hover:text-accent-light transition-colors">Leaderboard</Link></li>
                <li><Link to="/signup" className="hover:text-accent-light transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-900 dark:text-white">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li>
                  <a href="https://github.com/nallapanenihemanthsai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent-light transition-colors">
                    <Code2 className="w-4 h-4" /> GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
        </div>

        <div className="mt-16 pt-8 border-t border-light-border dark:border-dark-border flex flex-col items-center justify-center space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Created with <span className="text-red-500">♥</span> by nallapanenihemanthsai
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} DSAForge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
