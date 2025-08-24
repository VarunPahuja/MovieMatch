import { ref, set, get } from 'firebase/database';
import { database } from '@/config/firebase';

export const testFirebaseConnection = async (): Promise<{ success: boolean; error?: string; authRequired?: boolean }> => {
  try {
    console.log('Testing basic Firebase connection...');
    
    // Try to read from a test path first
    const testRef = ref(database, 'test');
    
    try {
      console.log('Attempting to read test data...');
      const snapshot = await get(testRef);
      console.log('Read successful, data exists:', snapshot.exists());
    } catch (readError) {
      const errorMessage = readError instanceof Error ? readError.message : String(readError);
      console.log('Read failed:', errorMessage);
      if (errorMessage.includes('PERMISSION_DENIED')) {
        return { 
          success: false, 
          error: 'Read permission denied - security rules too restrictive', 
          authRequired: true 
        };
      }
    }

    // Try to write test data
    try {
      console.log('Attempting to write test data...');
      await set(testRef, { timestamp: Date.now(), test: true });
      console.log('Write successful!');
      return { success: true };
    } catch (writeError) {
      const errorMessage = writeError instanceof Error ? writeError.message : String(writeError);
      console.log('Write failed:', errorMessage);
      if (errorMessage.includes('PERMISSION_DENIED')) {
        return { 
          success: false, 
          error: 'Write permission denied - security rules need to be updated', 
          authRequired: true 
        };
      }
      return { success: false, error: errorMessage };
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Firebase connection test failed:', error);
    return { success: false, error: errorMessage };
  }
};

export const getCurrentFirebaseRules = async (): Promise<string> => {
  // This would typically require Admin SDK, but we can provide guidance
  return `
Unable to fetch rules directly from client. 
Current rules are likely:
{
  "rules": {
    ".read": false,
    ".write": false
  }
}

This blocks all operations. You need to update them in Firebase Console.
`;
};
