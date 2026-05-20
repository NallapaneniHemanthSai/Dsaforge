/**
 * Middleware to restrict demo user account modifications.
 * Keeps the demo accounts clean and prevents spam/abuse.
 */
const restrictDemoUser = (req, res, next) => {
  const demoEmails = ['demo@kluniversity.in', 'admin@kluniversity.in'];
  
  if (req.user && demoEmails.includes(req.user.email)) {
    // Check if the request is a write operation (POST/PUT/PATCH/DELETE)
    // We allow running/submitting code or fetching notes, but block user mutations like password changes, profile deletion, etc.
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    
    // We specifically allow:
    // - Submitting/compiling code
    // - Requesting new tokens
    // We block:
    // - Changing passwords, updating profile info, deleting accounts
    const allowedDemoMutations = [
      '/api/progress/submit',
      '/api/progress/run',
      '/api/auth/logout',
      '/api/auth/refresh'
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
