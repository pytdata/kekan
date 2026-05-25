// Demo seed accounts for testing the application
// These are stored in localStorage under "kenkan_demo_accounts"

export interface DemoAccount {
  label: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  subscriptionStatus: 'free' | 'premium';
  description: string;
  color: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'Free Reader',
    email: 'demo@kenkan.com',
    password: 'Demo@1234',
    role: 'user',
    subscriptionStatus: 'free',
    description: 'Browse free books & videos',
    color: '#6366F1',
  },
  {
    label: 'Premium Reader',
    email: 'premium@kenkan.com',
    password: 'Demo@1234',
    role: 'user',
    subscriptionStatus: 'premium',
    description: 'Full access to all content',
    color: '#F59E0B',
  },
  {
    label: 'Admin',
    email: 'admin@kenkan.com',
    password: 'Admin@1234',
    role: 'admin',
    subscriptionStatus: 'premium',
    description: 'Manage content & analytics',
    color: '#EF4444',
  },
];

const STORAGE_KEY = 'kenkan_demo_accounts';

/** Seeds demo accounts into localStorage on first load */
export function seedDemoAccounts(): void {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_ACCOUNTS));
    }
  } catch {
    // localStorage unavailable
  }
}

/** Returns demo accounts from localStorage */
export function getDemoAccounts(): DemoAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DemoAccount[];
  } catch {
    // parse error
  }
  return DEMO_ACCOUNTS;
}
