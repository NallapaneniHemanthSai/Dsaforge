export const DEMO_STUDENT_EMAIL = 'demo@kluniversity.in';
export const DEMO_ADMIN_EMAIL = 'admin@kluniversity.in';

export const isDemoStudent = (user) => user?.email === DEMO_STUDENT_EMAIL;
export const isDemoAdmin = (user) => user?.email === DEMO_ADMIN_EMAIL;
export const isDemoUser = (user) => isDemoStudent(user) || isDemoAdmin(user);

export const getDemoModeLabel = (user) => {
  if (isDemoAdmin(user)) return 'Admin Demo';
  if (isDemoStudent(user)) return 'Student Demo';
  return '';
};
