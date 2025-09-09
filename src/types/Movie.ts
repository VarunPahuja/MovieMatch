export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string[];
  director: string;
  rating: number;
  description: string;
  poster: string;
  duration: number;
  released: boolean;
  popularity?: number;
  language?: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  createdAt: Date;
  users: Record<string, RoomUser>; // Changed from RoomUser[] to Record<string, RoomUser> for Firebase compatibility
  currentMovieIndex: number;
  matches: MovieMatch[];
  expectedMembers?: number; // Number of expected members for this room
  matchThreshold: number; // Fixed number of likes needed for a match
}

export interface RoomUser {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: Date;
  sessionId?: string; // Unique session identifier for reconnection
  lastSeen?: Date; // Last activity timestamp
  isConnected?: boolean; // Current connection status
}

export interface MovieSwipe {
  userId: string;
  movieId: number;
  liked: boolean;
  timestamp: Date;
}

export interface MovieMatch {
  movie: Movie;
  likedByUsers: string[];
  matchedAt: Date;
}

export interface RoomData {
  room: Room;
  swipes: MovieSwipe[];
}

export interface UserSession {
  sessionId: string;
  userId: string;
  roomCode: string;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface PresenceInfo {
  userId: string;
  sessionId: string;
  isOnline: boolean;
  lastSeen: Date;
  userAgent?: string;
}