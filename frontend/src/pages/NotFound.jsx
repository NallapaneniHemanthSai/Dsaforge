import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4 animate-fade-in">
      <div className="text-center max-w-lg mx-auto">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 mb-8 shadow-lg shadow-red-500/20">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <h1 className="text-6xl font-extrabold mb-4 tracking-tight text-gray-900 dark:text-white">404</h1>
        <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-300">Array Index Out of Bounds</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
          Oops! The page you're trying to access is outside the bounds of our application. Let's get you back to safe memory.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg">
          <Home className="w-5 h-5" /> Return Home
        </Link>
      </div>
    </div>
  );
}
