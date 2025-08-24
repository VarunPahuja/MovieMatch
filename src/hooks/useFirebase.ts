import { useState, useEffect, useCallback } from 'react';
import { 
  FirebaseRoomService, 
  FirebaseSwipeService, 
  FirebaseMatchService
} from '@/services/firebase';
import { Room, MovieSwipe, MovieMatch, RoomUser } from '@/types/Movie';

export interface UseFirebaseRoomReturn {
  room: Room | null;
  loading: boolean;
  error: string | null;
  swipes: MovieSwipe[];
  matches: MovieMatch[];
  createRoom: (roomData: Omit<Room, 'id' | 'code'> & { code?: string }) => Promise<string>;
  joinRoom: (roomCode: string, user: RoomUser) => Promise<boolean>;
  leaveRoom: (userId: string) => Promise<void>;
  recordSwipe: (swipe: MovieSwipe) => Promise<void>;
  connected: boolean;
}

export const useFirebaseRoom = (roomCode?: string): UseFirebaseRoomReturn => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swipes, setSwipes] = useState<MovieSwipe[]>([]);
  const [matches, setMatches] = useState<MovieMatch[]>([]);
  const [connected, setConnected] = useState(true);

  // Create a new room
  const createRoom = useCallback(async (roomData: Omit<Room, 'id' | 'code'> & { code?: string }): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      // Let the service handle code generation
      const roomId = await FirebaseRoomService.createRoom(roomData);
      return roomId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Join an existing room
  const joinRoom = useCallback(async (code: string, user: RoomUser): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await FirebaseRoomService.joinRoom(code, user);
      if (!success) {
        setError('Room not found');
        return false;
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join room';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Leave the current room
  const leaveRoom = useCallback(async (userId: string): Promise<void> => {
    if (!roomCode) return;
    
    try {
      await FirebaseRoomService.leaveRoom(roomCode, userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave room';
      setError(errorMessage);
    }
  }, [roomCode]);

  // Record a swipe
  const recordSwipe = useCallback(async (swipe: MovieSwipe): Promise<void> => {
    if (!roomCode) return;
    
    try {
      await FirebaseSwipeService.recordSwipe(roomCode, swipe);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record swipe';
      setError(errorMessage);
    }
  }, [roomCode]);

  // Subscribe to room updates when roomCode changes
  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      setSwipes([]);
      setMatches([]);
      return;
    }

    setLoading(true);
    
    // Subscribe to room updates
    const unsubscribeRoom = FirebaseRoomService.subscribeToRoom(roomCode, (updatedRoom) => {
      setRoom(updatedRoom);
      setLoading(false);
      if (!updatedRoom) {
        setError('Room not found');
      }
    });

    // Subscribe to swipes
    const unsubscribeSwipes = FirebaseSwipeService.subscribeToSwipes(roomCode, (updatedSwipes) => {
      setSwipes(updatedSwipes);
    });

    // Subscribe to matches
    const unsubscribeMatches = FirebaseMatchService.subscribeToMatches(roomCode, (updatedMatches) => {
      setMatches(updatedMatches);
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeRoom();
      unsubscribeSwipes();
      unsubscribeMatches();
    };
  }, [roomCode]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // You can implement a connection check here
        setConnected(true);
      } catch {
        setConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    room,
    loading,
    error,
    swipes,
    matches,
    createRoom,
    joinRoom,
    leaveRoom,
    recordSwipe,
    connected
  };
};

// Hook for managing user session
export const useFirebaseUser = () => {
  const [user, setUser] = useState<RoomUser | null>(null);

  const createUser = useCallback((name: string, avatar?: string): RoomUser => {
    const newUser: RoomUser = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      joinedAt: new Date()
    };
    
    // Only add avatar if it's provided
    if (avatar) {
      newUser.avatar = avatar;
    }
    
    setUser(newUser);
    return newUser;
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  return {
    user,
    createUser,
    clearUser
  };
};
