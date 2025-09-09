import { useState, useEffect, useCallback, useRef } from 'react';
import { FirebaseSessionService, FirebasePresenceService } from '@/services/firebase';
import { UserSession, PresenceInfo } from '@/types/Movie';

interface UseSessionOptions {
  roomCode: string;
  userId: string;
  enabled?: boolean;
}

interface UseSessionReturn {
  sessionId: string | null;
  isConnected: boolean;
  onlineUsers: PresenceInfo[];
  onlineCount: number;
  reconnect: () => Promise<void>;
  updateActivity: () => void;
}

// Store session info in localStorage for reconnection
const SESSION_STORAGE_KEY = 'moviematch_session';

interface StoredSession {
  sessionId: string;
  roomCode: string;
  userId: string;
  timestamp: number;
}

export function useSession({ roomCode, userId, enabled = true }: UseSessionOptions): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<PresenceInfo[]>([]);
  const activityTimerRef = useRef<NodeJS.Timeout>();
  const presenceUnsubscribeRef = useRef<(() => void) | null>(null);

  // Load session from localStorage
  const loadStoredSession = useCallback((): string | null => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;

      const parsedSession: StoredSession = JSON.parse(stored);
      
      // Check if session is recent (within 24 hours) and for the same room/user
      const isRecent = Date.now() - parsedSession.timestamp < 24 * 60 * 60 * 1000;
      const isMatchingRoom = parsedSession.roomCode === roomCode && parsedSession.userId === userId;
      
      if (isRecent && isMatchingRoom) {
        return parsedSession.sessionId;
      }
      
      // Clear old session
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    } catch (error) {
      console.error('Failed to load stored session:', error);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  }, [roomCode, userId]);

  // Store session in localStorage
  const storeSession = useCallback((sessionId: string) => {
    try {
      const sessionData: StoredSession = {
        sessionId,
        roomCode,
        userId,
        timestamp: Date.now()
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }, [roomCode, userId]);

  // Create or restore session
  const createSession = useCallback(async (existingSessionId?: string): Promise<string> => {
    try {
      const newSessionId = await FirebaseSessionService.createSession(roomCode, userId, existingSessionId);
      setSessionId(newSessionId);
      storeSession(newSessionId);
      return newSessionId;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }, [roomCode, userId, storeSession]);

  // Set user as online
  const goOnline = useCallback(async (sessionId: string) => {
    try {
      await FirebasePresenceService.setUserOnline(roomCode, userId, sessionId);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to set user online:', error);
    }
  }, [roomCode, userId]);

  // Set user as offline
  const goOffline = useCallback(async () => {
    try {
      if (sessionId) {
        await FirebasePresenceService.setUserOffline(roomCode, userId);
        await FirebaseSessionService.deactivateSession(roomCode, sessionId);
      }
      setIsConnected(false);
    } catch (error) {
      console.error('Failed to set user offline:', error);
    }
  }, [roomCode, userId, sessionId]);

  // Update activity timestamp
  const updateActivity = useCallback(async () => {
    if (!sessionId || !isConnected) return;
    
    try {
      await FirebaseSessionService.updateSessionActivity(roomCode, sessionId);
      await FirebasePresenceService.updateLastSeen(roomCode, userId);
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }, [roomCode, userId, sessionId, isConnected]);

  // Reconnect function
  const reconnect = useCallback(async () => {
    if (!enabled) return;

    try {
      // Try to restore existing session first
      const storedSessionId = loadStoredSession();
      const newSessionId = await createSession(storedSessionId);
      await goOnline(newSessionId);
    } catch (error) {
      console.error('Reconnection failed:', error);
      // If stored session fails, create a new one
      try {
        const newSessionId = await createSession();
        await goOnline(newSessionId);
      } catch (retryError) {
        console.error('Failed to create new session on retry:', retryError);
      }
    }
  }, [enabled, loadStoredSession, createSession, goOnline]);

  // Initialize session
  useEffect(() => {
    if (!enabled || !roomCode || !userId) return;

    reconnect();
  }, [enabled, roomCode, userId, reconnect]);

  // Set up presence subscription
  useEffect(() => {
    if (!enabled || !roomCode) return;

    // Clean up previous subscription
    if (presenceUnsubscribeRef.current) {
      presenceUnsubscribeRef.current();
    }

    // Subscribe to presence updates
    presenceUnsubscribeRef.current = FirebasePresenceService.subscribeToPresence(
      roomCode,
      (users) => {
        setOnlineUsers(users);
      }
    );

    return () => {
      if (presenceUnsubscribeRef.current) {
        presenceUnsubscribeRef.current();
        presenceUnsubscribeRef.current = null;
      }
    };
  }, [enabled, roomCode]);

  // Set up periodic activity updates
  useEffect(() => {
    if (!isConnected || !sessionId) return;

    // Update activity every 30 seconds
    activityTimerRef.current = setInterval(updateActivity, 30000);

    return () => {
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
      }
    };
  }, [isConnected, sessionId, updateActivity]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && sessionId) {
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionId, updateActivity]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      goOffline();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [goOffline]);

  return {
    sessionId,
    isConnected,
    onlineUsers,
    onlineCount: onlineUsers.length,
    reconnect,
    updateActivity
  };
}
