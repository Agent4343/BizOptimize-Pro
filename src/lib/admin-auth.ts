// Developer-only authentication
// Only the specified developer email can access

const DEVELOPER_EMAIL = 'mathesonashley@hotmail.com';
const DEVELOPER_PASSWORD = 'Blake2011@';
const ADMIN_SESSION_KEY = 'bizoptimize_admin_session';

export function isDeveloper(email: string | null | undefined): boolean {
  return email?.toLowerCase() === DEVELOPER_EMAIL.toLowerCase();
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const session = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!session) return false;
  
  try {
    const sessionData = JSON.parse(session);
    const now = Date.now();
    // Session expires after 24 hours
    if (now > sessionData.expiresAt) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    // Verify email matches developer email
    if (sessionData.email?.toLowerCase() !== DEVELOPER_EMAIL.toLowerCase()) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function loginAdmin(email: string, password: string): boolean {
  if (email.toLowerCase() !== DEVELOPER_EMAIL.toLowerCase()) {
    return false;
  }
  if (password !== DEVELOPER_PASSWORD) {
    return false;
  }
  
  const sessionData = {
    email: DEVELOPER_EMAIL,
    loggedInAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
  return true;
}

export function logoutAdmin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

