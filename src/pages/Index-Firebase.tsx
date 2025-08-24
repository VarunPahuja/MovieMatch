import { useState } from 'react';
import StartScreen from '@/components/StartScreen';
import { RoomSetup } from '@/components/RoomSetup';
import { SwipeArea } from '@/components/SwipeArea';
import { MovieMatch, MovieSwipe } from '@/types/Movie';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseRoom, useFirebaseUser } from '@/hooks/useFirebase';

const Index = () => {
  const [showStart, setShowStart] = useState(true);
  const [roomCode, setRoomCode] = useState<string | undefined>();
  const { toast } = useToast();

  // Firebase hooks
  const { user, createUser, clearUser } = useFirebaseUser();
  const { 
    room, 
    loading, 
    error, 
    swipes, 
    matches, 
    createRoom, 
    joinRoom, 
    recordSwipe,
    connected 
  } = useFirebaseRoom(roomCode);

  const handleCreateRoom = async (roomName: string, userName: string) => {
    try {
      // Create user first
      const newUser = createUser(userName);
      
      // Create room with this user
      const newRoomCode = await createRoom({
        name: roomName,
        createdAt: new Date(),
        users: [newUser],
        currentMovieIndex: 0,
        matches: []
      });
      
      setRoomCode(newRoomCode);
      
      toast({
        title: "Room Created! 🎉",
        description: `Room code: ${newRoomCode}. Share this with friends to join!`,
      });
    } catch (err) {
      console.error('Failed to create room:', err);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleJoinRoom = async (roomCode: string, userName: string) => {
    try {
      const newUser = createUser(userName);
      const success = await joinRoom(roomCode.toUpperCase(), newUser);
      
      if (success) {
        setRoomCode(roomCode.toUpperCase());
        toast({
          title: "Joined Room! 🎊",
          description: `Welcome to the room!`,
        });
      } else {
        toast({
          title: "Room Not Found",
          description: "Please check the room code and try again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Failed to join room:', err);
      toast({
        title: "Error",
        description: "Failed to join room. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSwipe = async (movieId: number, liked: boolean) => {
    if (!user) return;

    try {
      await recordSwipe({
        userId: user.id,
        movieId,
        liked,
        timestamp: new Date()
      });

      if (liked) {
        toast({
          title: "Movie Liked! ❤️",
          description: "Your preference has been recorded",
        });
      }
    } catch (err) {
      console.error('Failed to record swipe:', err);
      toast({
        title: "Error",
        description: "Failed to record swipe",
        variant: "destructive"
      });
    }
  };

  const handleNewMatch = (match: MovieMatch) => {
    toast({
      title: "🎉 It's a Match!",
      description: `${match.movie.title} has ${match.likedByUsers.length} likes!`,
      variant: "default"
    });
  };

  const handleLeaveRoom = () => {
    setRoomCode(undefined);
    clearUser();
    toast({
      title: "Left Room",
      description: "You've left the room successfully.",
    });
  };

  // Show loading screen if Firebase operations are in progress
  if (loading && roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">
            {roomCode ? 'Joining room...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if not connected
  if (error && !connected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold text-red-600">Connection Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 1. Show start screen
  if (showStart) {
    return <StartScreen onContinue={() => setShowStart(false)} />;
  }

  // 2. Show room setup if no current room
  if (!roomCode || !room || !user) {
    return (
      <RoomSetup 
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        loading={loading}
      />
    );
  }

  // 3. Show main app with real-time data
  return (
    <SwipeArea
      roomCode={roomCode}
      users={Object.values(room.users || {})}
      matches={matches}
      onSwipe={handleSwipe}
      onNewMatch={handleNewMatch}
      onLeaveRoom={handleLeaveRoom}
      genres={[]}
      language={''}
      yearRange={[2022, new Date().getFullYear()]}
      ratingRange={[6.5, 10]}
      // Pass real-time data
      realTimeSwipes={swipes}
      currentUser={user}
      connected={connected}
    />
  );
};

export default Index;
