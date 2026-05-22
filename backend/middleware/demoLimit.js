/**
 * Middleware to restrict demo user account modifications.
 * Keeps the demo accounts clean and prevents spam/abuse.
 */
const restrictDemoUser = (req, res, next) => {
  const isDemoStudent = req.user?.email === 'demo@kluniversity.in';
  const isDemoAdmin = req.user?.email === 'admin@kluniversity.in';
  
  if (req.user && (isDemoStudent || isDemoAdmin)) {
    // Check if the request is a write operation (POST/PUT/PATCH/DELETE)
    // We allow running/submitting code or fetching notes, but block user mutations like password changes, profile deletion, etc.
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    
    // We specifically allow:
    // - Submitting/compiling code
    // - Requesting new tokens
    // We block:
    // - Changing passwords, updating profile info, deleting accounts
    const allowedDemoMutations = isDemoAdmin ? [
      '/api/auth/logout',
      '/api/auth/refresh',
      '/api/admin/',
    ] : [
      '/api/auth/logout',
      '/api/auth/refresh',
    ];

    const currentPath = req.originalUrl || req.path;
    const isAllowed = allowedDemoMutations.some(path => currentPath.includes(path));

    if (isMutation && !isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'This action is disabled for the Demo account to preserve preview integrity.',
        code: 'DEMO_RESTRICTED'
      });
    }
  }
  
  next();
};

module.exports = { restrictDemoUser };
