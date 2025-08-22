import { db, User } from './database';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

class AuthService {
  private listeners: ((state: AuthState) => void)[] = [];
  private currentState: AuthState = { isAuthenticated: false, user: null };

  async init(): Promise<void> {
    await db.init();
    const user = await db.getUser();
    this.currentState = {
      isAuthenticated: !!user,
      user
    };
    this.notifyListeners();
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentState);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentState));
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@gmail\.com$/i;
    return emailRegex.test(email);
  }

  validatePassword(password: string): boolean {
    // Must be at least 6 characters with at least one uppercase, one lowercase, and one number
    const hasLength = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return hasLength && hasUpper && hasLower && hasNumber;
  }

  async signUp(email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.validateEmail(email)) {
        return { success: false, error: 'Please use a valid Gmail address' };
      }

      if (!this.validatePassword(password)) {
        return { success: false, error: 'Password must be at least 6 characters with uppercase, lowercase, and number' };
      }

      if (username.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters' };
      }

      const existingUser = await db.getUser();
      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      const user: User = {
        id: crypto.randomUUID(),
        email,
        username,
        createdAt: new Date()
      };

      await db.saveUser(user);
      this.currentState = { isAuthenticated: true, user };
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to create account' };
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.validateEmail(email)) {
        return { success: false, error: 'Please use a valid Gmail address' };
      }

      const user = await db.getUser();
      if (!user || user.email !== email) {
        return { success: false, error: 'Invalid credentials' };
      }

      this.currentState = { isAuthenticated: true, user };
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Sign in failed' };
    }
  }

  async signOut(): Promise<void> {
    this.currentState = { isAuthenticated: false, user: null };
    this.notifyListeners();
  }

  getState(): AuthState {
    return this.currentState;
  }
}

export const authService = new AuthService();