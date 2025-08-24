import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase';

export class FirebaseAuthService {
  private static currentUser: User | null = null;
  private static initialized = false;

  // Initialize anonymous authentication
  static async initAuth(): Promise<User | null> {
    if (this.initialized) {
      return this.currentUser;
    }

    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        this.initialized = true;
        unsubscribe();

        if (user) {
          this.currentUser = user;
          resolve(user);
        } else {
          try {
            // Sign in anonymously if no user
            const userCredential = await signInAnonymously(auth);
            this.currentUser = userCredential.user;
            resolve(userCredential.user);
          } catch (error) {
            console.error('Anonymous auth failed:', error);
            reject(error);
          }
        }
      });
    });
  }

  // Get current user
  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Sign out
  static async signOut(): Promise<void> {
    await auth.signOut();
    this.currentUser = null;
  }
}

// Auto-initialize auth when the module is imported
FirebaseAuthService.initAuth().catch(console.error);

export default FirebaseAuthService;
