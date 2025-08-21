

import { useState } from 'react';
import StartScreen from '@/components/StartScreen';
import { RoomSetup } from '@/components/RoomSetup';
import { SwipeArea } from '@/components/SwipeArea';
import { Room, RoomUser, MovieMatch, MovieSwipe } from '@/types/Movie';
import { useToast } from '@/hooks/use-toast';




const Index = () => {
  const [showStart, setShowStart] = useState(true);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<RoomUser | null>(null);
  const [matches, setMatches] = useState<MovieMatch[]>([]);
  const [swipes, setSwipes] = useState<MovieSwipe[]>([]);
  const { toast } = useToast();

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = (roomName: string) => {
    const roomCode = generateRoomCode();
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      code: roomCode,
      name: roomName,
      createdAt: new Date(),
      users: [],
      currentMovieIndex: 0,
      matches: []
    };

    // Create default user for room creator
    const creator: RoomUser = {
      id: `user-${Date.now()}`,
      name: 'Room Creator',
      joinedAt: new Date()
    };

    newRoom.users.push(creator);
    setCurrentRoom(newRoom);
    setCurrentUser(creator);
    
    toast({
      title: "Room Created!",
      description: `Room code: ${roomCode}. Share this with friends to join.`,
    });
  };

  const handleJoinRoom = (roomCode: string, userName: string) => {
    // In a real app, this would query Firebase for the room
    // For MVP, we'll simulate joining
    const newUser: RoomUser = {
      id: `user-${Date.now()}`,
      name: userName,
      joinedAt: new Date()
    };

    const mockRoom: Room = {
      id: `room-${roomCode}`,
      code: roomCode,
      name: `Room ${roomCode}`,
      createdAt: new Date(),
      users: [newUser],
      currentMovieIndex: 0,
      matches: []
    };

    // Simulate other users in the room
    for (let i = 1; i <= Math.floor(Math.random() * 4) + 2; i++) {
      mockRoom.users.push({
        id: `user-${Date.now()}-${i}`,
        name: `User ${i}`,
        joinedAt: new Date()
      });
    }

    setCurrentRoom(mockRoom);
    setCurrentUser(newUser);
    
    toast({
      title: "Joined Room!",
      description: `Welcome to ${mockRoom.name}`,
    });
  };

  const handleSwipe = (movieId: number, liked: boolean) => {
    if (!currentUser || !currentRoom) return;

    const newSwipe: MovieSwipe = {
      userId: currentUser.id,
      movieId,
      liked,
      timestamp: new Date()
    };

    setSwipes(prev => [...prev, newSwipe]);

    if (liked) {
      toast({
        title: "Movie Liked! ❤️",
        description: "Your preference has been recorded",
      });
    }
  };

  const handleNewMatch = (match: MovieMatch) => {
    setMatches(prev => [...prev, match]);
    
    toast({
      title: "🎉 It's a Match!",
      description: `${match.movie.title} has ${match.likedByUsers.length} likes!`,
      variant: "default"
    });
  };




  // 1. Show start screen
  if (showStart) {
    return <StartScreen onContinue={() => setShowStart(false)} />;
  }

  // 2. Show room setup if no current room
  if (!currentRoom || !currentUser) {
    return (
      <RoomSetup 
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  // 3. Show main app
  return (
    <SwipeArea
      roomCode={currentRoom.code}
      users={currentRoom.users}
      matches={matches}
      onSwipe={handleSwipe}
      onNewMatch={handleNewMatch}
      genres={[]}
      language={''}
      yearRange={[2022, new Date().getFullYear()]}
      ratingRange={[6.5, 10]}
    />
  );
};

export default Index;
