import { 
  ref, 
  push, 
  set, 
  get, 
  onValue, 
  off, 
  remove,
  update,
  DatabaseReference,
  DataSnapshot
} from 'firebase/database';
import { database } from '@/config/firebase';
import { Room, MovieSwipe, RoomUser, MovieMatch } from '@/types/Movie';
import { FirebaseAuthService } from './firebaseAuth';

// Room Management
export class FirebaseRoomService {
  // Utility method to remove undefined properties
  static sanitizeData(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          cleaned[key] = this.sanitizeData(value as Record<string, unknown>);
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }

  // Generate a human-readable room code
  static generateRoomCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = '';
    
    // Generate format: ABCD12 (4 letters + 2 numbers)
    for (let i = 0; i < 4; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 2; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return code;
  }

  // Check if room code exists
  static async roomExists(roomCode: string): Promise<boolean> {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    return snapshot.exists();
  }

  // Create a new room
  static async createRoom(roomData: Omit<Room, 'id' | 'code'> & { code?: string }): Promise<string> {
    try {
      // Ensure user is authenticated
      console.log('Attempting to authenticate...');
      const authUser = await FirebaseAuthService.initAuth();
      console.log('Auth user:', authUser?.uid);
      
      // Generate a unique room code if not provided
      let roomCode: string;
      if (roomData.code) {
        roomCode = roomData.code;
      } else {
        let attempts = 0;
        do {
          roomCode = this.generateRoomCode();
          attempts++;
          if (attempts > 10) {
            throw new Error('Failed to generate unique room code');
          }
        } while (await this.roomExists(roomCode));
      }
      
      const roomRef = ref(database, `rooms/${roomCode}`);
      const cleanData = this.sanitizeData({
        ...roomData,
        code: roomCode,
        createdAt: Date.now()
      });
      
      console.log('Attempting to create room with code:', roomCode, 'and data:', cleanData);
      await set(roomRef, cleanData);
      console.log('Room created successfully with code:', roomCode);
      return roomCode;
    } catch (error) {
      console.error('Create room error:', error);
      throw error;
    }
  }

  // Join an existing room
  static async joinRoom(roomCode: string, user: RoomUser): Promise<boolean> {
    try {
      // Ensure user is authenticated
      console.log('Attempting to join room with code:', roomCode);
      await FirebaseAuthService.initAuth();
      
      const roomRef = ref(database, `rooms/${roomCode}`);
      const snapshot = await get(roomRef);
      
      if (!snapshot.exists()) {
        console.log('Room does not exist:', roomCode);
        return false;
      }

      console.log('Room found, adding user:', user.name);
      // Remove undefined properties before sending to Firebase
      const cleanUser = this.sanitizeData({
        ...user,
        joinedAt: Date.now()
      });

      const usersRef = ref(database, `rooms/${roomCode}/users/${user.id}`);
      await set(usersRef, cleanUser);
      console.log('User successfully added to room');
      
      return true;
    } catch (error) {
      console.error('Join room error:', error);
      throw error;
    }
  }

  // Get room data
  static async getRoom(roomCode: string): Promise<Room | null> {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: roomCode,
      ...snapshot.val()
    };
  }

  // Listen to room updates
  static subscribeToRoom(
    roomCode: string, 
    callback: (room: Room | null) => void
  ): () => void {
    const roomRef = ref(database, `rooms/${roomCode}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: roomCode,
          ...snapshot.val()
        });
      } else {
        callback(null);
      }
    });

    return () => off(roomRef, 'value', unsubscribe);
  }

  // Update room data
  static async updateRoom(roomCode: string, updates: Partial<Room>): Promise<void> {
    const roomRef = ref(database, `rooms/${roomCode}`);
    await update(roomRef, updates);
  }

  // Leave room
  static async leaveRoom(roomCode: string, userId: string): Promise<void> {
    const userRef = ref(database, `rooms/${roomCode}/users/${userId}`);
    await remove(userRef);
  }
}

// Swipe Management
export class FirebaseSwipeService {
  // Record a swipe
  static async recordSwipe(roomCode: string, swipe: MovieSwipe): Promise<void> {
    // Ensure user is authenticated
    await FirebaseAuthService.initAuth();
    
    const swipeRef = ref(database, `rooms/${roomCode}/swipes/${swipe.userId}_${swipe.movieId}`);
    await set(swipeRef, {
      ...swipe,
      timestamp: Date.now()
    });
  }

  // Get all swipes for a room
  static async getRoomSwipes(roomCode: string): Promise<MovieSwipe[]> {
    const swipesRef = ref(database, `rooms/${roomCode}/swipes`);
    const snapshot = await get(swipesRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    return Object.values(snapshot.val());
  }

  // Listen to swipe updates
  static subscribeToSwipes(
    roomCode: string,
    callback: (swipes: MovieSwipe[]) => void
  ): () => void {
    const swipesRef = ref(database, `rooms/${roomCode}/swipes`);
    
    const unsubscribe = onValue(swipesRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(Object.values(snapshot.val()));
      } else {
        callback([]);
      }
    });

    return () => off(swipesRef, 'value', unsubscribe);
  }
}

// Match Management
export class FirebaseMatchService {
  // Add a match
  static async addMatch(roomCode: string, match: MovieMatch): Promise<void> {
    const matchRef = ref(database, `rooms/${roomCode}/matches/${match.movie.id}`);
    await set(matchRef, {
      ...match,
      matchedAt: Date.now()
    });
  }

  // Get all matches for a room
  static async getRoomMatches(roomCode: string): Promise<MovieMatch[]> {
    const matchesRef = ref(database, `rooms/${roomCode}/matches`);
    const snapshot = await get(matchesRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    return Object.values(snapshot.val());
  }

  // Listen to match updates
  static subscribeToMatches(
    roomCode: string,
    callback: (matches: MovieMatch[]) => void
  ): () => void {
    const matchesRef = ref(database, `rooms/${roomCode}/matches`);
    
    const unsubscribe = onValue(matchesRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(Object.values(snapshot.val()));
      } else {
        callback([]);
      }
    });

    return () => off(matchesRef, 'value', unsubscribe);
  }
}

// Utility function to generate room codes
export const generateRoomCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Utility function to check if Firebase is connected
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    const testRef = ref(database, '.info/connected');
    const snapshot = await get(testRef);
    return snapshot.val() === true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return false;
  }
};
