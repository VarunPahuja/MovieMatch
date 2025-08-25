

import { useState, useEffect, useCallback } from 'react';
import StartScreen from '@/components/StartScreen';
import { RoomSetup } from '@/components/RoomSetup';
import { SwipeArea } from '@/components/SwipeArea';
import { Movie, Room, RoomUser, MovieMatch, MovieSwipe } from '@/types/Movie';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseRoom, useFirebaseUser } from '@/hooks/useFirebase';
import { v4 as uuidv4 } from 'uuid';
import { ref, set, onValue } from 'firebase/database';
import { database } from '@/config/firebase';




const Index = () => {
  const [showStart, setShowStart] = useState(true);
  const [useFirebase, setUseFirebase] = useState(true); // Feature flag for testing
  const [testMode, setTestMode] = useState(false); // Simple button test mode
  const { toast } = useToast();

  // Simple test mode state
  const [testUserId, setTestUserId] = useState('');
  const [testLikes, setTestLikes] = useState<{ [key: string]: number[] }>({});
  const [testCommon, setTestCommon] = useState<number[]>([]);
  const TEST_BUTTONS = [1, 2, 3, 4];
  const TEST_ROOM = 'main-test-room';

  // Firebase state
  const [roomCode, setRoomCode] = useState<string | undefined>();
  const { user, createUser } = useFirebaseUser();
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

  // Legacy local state (for fallback)
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<RoomUser | null>(null);
  const [localMatches, setLocalMatches] = useState<MovieMatch[]>([]);
  const [localSwipes, setLocalSwipes] = useState<MovieSwipe[]>([]);

  // Initialize test user ID
  useEffect(() => {
    let id = localStorage.getItem('mainTestUserId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('mainTestUserId', id);
    }
    setTestUserId(id);
  }, []);

  // Listen for test mode likes
  useEffect(() => {
    if (!testMode) return;
    
    const likesRef = ref(database, `mainTestRoom/${TEST_ROOM}/likes`);
    return onValue(likesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setTestLikes(data);
      
      // Find common likes
      const buttonCounts: { [key: string]: number } = {};
      Object.values(data).forEach((userLikes) => {
        (userLikes ? (userLikes as number[]) : []).forEach((btn: number) => {
          buttonCounts[btn] = (buttonCounts[btn] || 0) + 1;
        });
      });
      
      const commonButtons = Object.entries(buttonCounts)
        .filter(([_, count]) => count > 1)
        .map(([btn]) => Number(btn));
      setTestCommon(commonButtons);
      
      // Show toast for new matches
      commonButtons.forEach(btn => {
        if (!testCommon.includes(btn)) {
          toast({
            title: "🎉 Test Match!",
            description: `Button ${btn} is liked by multiple users!`,
            variant: "default"
          });
        }
      });
    });
  }, [testMode, testCommon, toast]);

  // Handle test button likes
  const handleTestLike = async (btn: number) => {
    if (!testUserId) return;
    
    const userLikes = testLikes[testUserId] || [];
    if (!userLikes.includes(btn)) {
      const newLikes = [...userLikes, btn];
      await set(ref(database, `mainTestRoom/${TEST_ROOM}/likes/${testUserId}`), newLikes);
      
      toast({
        title: "Button Liked! ❤️",
        description: `You liked button ${btn}`,
      });
    }
  };
  // Firebase room creation
  const handleCreateRoomFirebase = async (roomName: string, userName: string) => {
    try {
      const newUser = createUser(userName);
      const roomId = await createRoom({
        name: roomName,
        createdAt: new Date(),
        users: { [newUser.id]: newUser },
        currentMovieIndex: 0,
        matches: []
      });
      
      setRoomCode(roomId);
      
      toast({
        title: "Room Created!",
        description: `Room code: ${roomId}. Share this with friends to join.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Firebase room joining
  const handleJoinRoomFirebase = async (roomCode: string, userName: string) => {
    try {
      const newUser = createUser(userName);
      const success = await joinRoom(roomCode.toUpperCase(), newUser);
      
      if (success) {
        setRoomCode(roomCode.toUpperCase());
        toast({
          title: "Joined Room!",
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
      toast({
        title: "Error",
        description: "Failed to join room. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Legacy local functions
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoomLocal = (roomName: string, userName: string) => {
    const roomCodeLocal = generateRoomCode();
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      code: roomCodeLocal,
      name: roomName,
      createdAt: new Date(),
      users: {},
      currentMovieIndex: 0,
      matches: []
    };

    // Create user for room creator
    const creator: RoomUser = {
      id: `user-${Date.now()}`,
      name: userName,
      joinedAt: new Date()
    };

    newRoom.users[creator.id] = creator;
    setCurrentRoom(newRoom);
    setCurrentUser(creator);
    
    toast({
      title: "Room Created!",
      description: `Room code: ${roomCodeLocal}. Share this with friends to join.`,
    });
  };

  const handleJoinRoomLocal = (roomCode: string, userName: string) => {
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
      users: { [newUser.id]: newUser },
      currentMovieIndex: 0,
      matches: []
    };

    // Simulate other users in the room
    for (let i = 1; i <= Math.floor(Math.random() * 4) + 2; i++) {
      const mockUser = {
        id: `user-${Date.now()}-${i}`,
        name: `User ${i}`,
        joinedAt: new Date()
      };
      mockRoom.users[mockUser.id] = mockUser;
    }

    setCurrentRoom(mockRoom);
    setCurrentUser(newUser);
    
    toast({
      title: "Joined Room!",
      description: `Welcome to ${mockRoom.name}`,
    });
  };

  // Firebase swipe handler with match detection
  const handleSwipeFirebase = async (movieId: number, liked: boolean) => {
    if (!user) return;

    const newSwipe: MovieSwipe = {
      userId: user.id,
      movieId,
      liked,
      timestamp: new Date()
    };

    try {
      await recordSwipe(newSwipe);
      
      // Check for matches immediately if this was a like
      if (liked && room) {
        // Check for matches right after recording the swipe
        await checkForMatches(movieId);
      }
      
      if (liked) {
        toast({
          title: "Movie Liked! ❤️",
          description: "Your preference has been recorded and shared with the group",
        });
      }
    } catch (err) {
      console.error('Failed to record swipe:', err);
      toast({
        title: "Error",
        description: "Failed to record swipe. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Helper function to get movie data by ID
  const getMovieData = async (movieId: number) => {
    try {
      const moviesModule = await import('@/data/clean_movies.json');
      const movies = moviesModule.default as Movie[];
      return movies.find((movie: Movie) => movie.id === movieId);
    } catch (err) {
      console.error('Failed to load movie data:', err);
      return null;
    }
  };

  // Helper function to add match to Firebase
  const addMatchToFirebase = useCallback(async (match: MovieMatch) => {
    if (!roomCode) return;
    
    try {
      const { FirebaseMatchService } = await import('@/services/firebase');
      await FirebaseMatchService.addMatch(roomCode, match);
    } catch (err) {
      console.error('Failed to add match to Firebase:', err);
    }
  }, [roomCode]);

  // Check if a movie has enough likes to be a match
  const checkForMatches = useCallback(async (movieId: number) => {
    if (!room || !roomCode) return;

    // Get all swipes for this movie
    const movieSwipes = swipes.filter(swipe => 
      swipe.movieId === movieId && swipe.liked
    );

    // Get unique users who liked this movie
    const uniqueUserIds = [...new Set(movieSwipes.map(swipe => swipe.userId))];

    // Require at least 2 people to like it for a match
    const minLikesForMatch = Math.min(2, Object.keys(room.users).length);
    
    if (uniqueUserIds.length >= minLikesForMatch) {
      // Check if this match already exists
      const existingMatch = matches.find(match => match.movie.id === movieId);
      
      if (!existingMatch) {
        // Find the movie data
        const movieData = await getMovieData(movieId);
        
        if (movieData) {
          const newMatch: MovieMatch = {
            movie: movieData,
            likedByUsers: uniqueUserIds,
            matchedAt: new Date()
          };

          // Add to Firebase (this will trigger the subscription and update local state)
          await addMatchToFirebase(newMatch);
          
          toast({
            title: "🎉 New Match!",
            description: `"${movieData.title}" is loved by ${uniqueUserIds.length} people!`,
            variant: "default"
          });
        }
      }
    }
  }, [room, roomCode, swipes, matches, toast, addMatchToFirebase]);

  // Check for matches whenever swipes update
  useEffect(() => {
    if (!useFirebase || !room || !roomCode || swipes.length === 0) return;
    
    const checkAllMatches = async () => {
      // Get all movies that have been liked
      const likedMovies = swipes.filter(swipe => swipe.liked);
      const uniqueMovieIds = [...new Set(likedMovies.map(swipe => swipe.movieId))];
      
      for (const movieId of uniqueMovieIds) {
        await checkForMatches(movieId);
      }
    };
    
    checkAllMatches();
  }, [swipes, room, roomCode, useFirebase, checkForMatches]);

  // Legacy local swipe handler
  const handleSwipeLocal = (movieId: number, liked: boolean) => {
    if (!currentUser || !currentRoom) return;

    const newSwipe: MovieSwipe = {
      userId: currentUser.id,
      movieId,
      liked,
      timestamp: new Date()
    };

    setLocalSwipes(prev => [...prev, newSwipe]);

    if (liked) {
      toast({
        title: "Movie Liked! ❤️",
        description: "Your preference has been recorded",
      });
    }
  };

  const handleNewMatchFirebase = (match: MovieMatch) => {
    // Firebase handles matches automatically through subscriptions
    // Don't show toast notifications for matches, let the UI handle it
  };

  const handleNewMatchLocal = (match: MovieMatch) => {
    setLocalMatches(prev => [...prev, match]);
    // Don't show toast notifications for matches, let the UI handle it
  };

  // Add leave room functionality
  const handleLeaveRoom = () => {
    if (useFirebase && user && roomCode) {
      // For Firebase mode, we could call leaveRoom but for now just reset
      setRoomCode(undefined);
    } else {
      // For local mode, just reset state
      setCurrentRoom(null);
      setCurrentUser(null);
    }
    
    toast({
      title: "Left Room",
      description: "You have left the room successfully",
    });
  };

  // Choose functions based on feature flag
  const handleCreateRoom = useFirebase ? handleCreateRoomFirebase : handleCreateRoomLocal;
  const handleJoinRoom = useFirebase ? handleJoinRoomFirebase : handleJoinRoomLocal;
  const handleSwipe = useFirebase ? handleSwipeFirebase : handleSwipeLocal;
  const handleNewMatch = useFirebase ? handleNewMatchFirebase : handleNewMatchLocal;

  // Current room and user data (Firebase or local)
  const activeRoom = useFirebase ? room : currentRoom;
  const activeUser = useFirebase ? user : currentUser;
  const activeMatches = useFirebase ? matches : localMatches;
  const activeSwipes = useFirebase ? swipes : localSwipes;

  // Add Firebase toggle for testing
  if (showStart) {
    return (
      <div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={() => setTestMode(!testMode)}
            className="btn-pill bg-purple-600/90 hover:bg-purple-700 text-white px-4 py-2 text-sm font-medium backdrop-blur-sm border border-purple-500/30"
          >
            {testMode ? '🧪 Test Mode' : '🎬 Movie Mode'}
          </button>
          <button 
            onClick={() => setUseFirebase(!useFirebase)}
            className="btn-pill bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium backdrop-blur-md border border-white/20"
          >
            {useFirebase ? '🔥 Firebase Mode' : '💻 Local Mode'}
          </button>
        </div>
        {testMode ? (
          <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-lg w-full text-white">
              <h1 className="text-3xl font-bold mb-6 text-center">Firebase Test Mode</h1>
              <p className="text-center mb-6 text-white/80">Test collaborative liking with simple buttons</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {TEST_BUTTONS.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleTestLike(btn)}
                    className={`btn-pill ${
                      testCommon.includes(btn) 
                        ? 'btn-like transform scale-105' 
                        : 'btn-pass hover:scale-105'
                    } px-8 py-6 text-2xl font-bold min-w-[120px] transition-all duration-200`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
              
              {testCommon.length > 0 && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 backdrop-blur-sm">
                  <h2 className="font-semibold mb-3 text-green-300">🎉 Common Liked Buttons:</h2>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {testCommon.map((btn) => (
                      <span key={btn} className="btn-pill btn-like px-6 py-3 font-bold text-lg min-w-[60px] text-center">
                        {btn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <p className="text-sm text-white/60">Open this page in multiple browsers to test collaborative features</p>
              </div>
            </div>
          </div>
        ) : (
          <StartScreen onContinue={() => setShowStart(false)} />
        )}
      </div>
    );
  }

  // 2. Show room setup if no current room
  if (!activeRoom || !activeUser) {
    return (
      <div>
        {/* Show Firebase errors if any */}
        {useFirebase && error && (
          <div className="fixed top-4 left-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md z-50">
            Firebase Error: {error}
          </div>
        )}
        <RoomSetup 
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          loading={loading}
        />
      </div>
    );
  }

  // 3. Show main app
  return (
    <SwipeArea
      roomCode={activeRoom.code}
      users={Object.values(activeRoom.users)} // Convert Record<string, RoomUser> to RoomUser[]
      matches={activeMatches}
      onSwipe={handleSwipe}
      onNewMatch={handleNewMatch}
      genres={[]}
      language={''}
      yearRange={[2022, new Date().getFullYear()]}
      ratingRange={[6.5, 10]}
      // New real-time props
      realTimeSwipes={activeSwipes}
      currentUser={activeUser}
      connected={useFirebase ? connected : true}
      onLeaveRoom={handleLeaveRoom}
    />
  );
};

export default Index;
