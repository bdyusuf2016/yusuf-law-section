import { AuthState, UserAccount, PRESET_USERS } from '../types/auth';

const AUTH_STORAGE_KEY = 'bd_vat_court_auth_session';

export const loadAuthState = (): AuthState => {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.isLoggedIn === 'boolean') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load auth state from localStorage', e);
  }

  // Default initial session: logged in as Commissioner/Admin for instant usability
  return {
    isLoggedIn: true,
    currentUser: PRESET_USERS[0],
    token: 'jwt-auth-session-init',
    loginTime: new Date().toISOString()
  };
};

export const saveAuthState = (state: AuthState): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save auth state to localStorage', e);
  }
};

export const authenticateUser = (
  usernameOrEmail: string,
  pinOrPass: string
): { success: boolean; user?: UserAccount; error?: string } => {
  const query = usernameOrEmail.trim().toLowerCase();
  const found = PRESET_USERS.find(
    u => u.username.toLowerCase() === query || u.email.toLowerCase() === query
  );

  // If found, check password (accept default PIN 1234 or empty or 'password' for demo convenience)
  if (found) {
    if (pinOrPass && pinOrPass !== '1234' && pinOrPass !== 'admin123' && pinOrPass !== 'password') {
      return { success: false, error: 'ভুল পাসওয়ার্ড বা সিকিউরিটি পিন! ডিফল্ট পিন: 1234' };
    }
    return { success: true, user: found };
  }

  // Fallback: custom user created
  if (query.length > 2) {
    const customUser: UserAccount = {
      id: 'custom-' + Date.now(),
      username: usernameOrEmail,
      fullName: usernameOrEmail,
      email: `${usernameOrEmail}@vat.gov.bd`,
      role: 'ro',
      designationBangla: 'রাজস্ব কর্মকর্তা',
      circle: '১',
      permissions: ['cases.read', 'cases.write']
    };
    return { success: true, user: customUser };
  }

  return { success: false, error: 'ব্যবহারকারী পাওয়া যায়নি। সঠিক ইউজারনেম বা ইমেইল প্রদান করুন।' };
};
