# 🎬 MovieMatch Firebase Integration Guide

## Current State vs Firebase Integration

### **Current App Flow:**
1. **StartScreen** → Introduction
2. **RoomSetup** → Local room creation/joining (mock data)
3. **SwipeArea** → Local state management for swipes/matches

### **New Firebase-Powered Flow:**
1. **StartScreen** → Introduction
2. **RoomSetup** → Real Firebase room creation/joining
3. **SwipeArea** → Real-time collaborative swiping

---

## 🔧 Integration Plan

### **Phase 1: Replace Room Management**

#### **Step 1: Update Index.tsx**
Replace the mock room logic with Firebase hooks:

```tsx
// Replace this:
const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
const [currentUser, setCurrentUser] = useState<RoomUser | null>(null);
const [matches, setMatches] = useState<MovieMatch[]>([]);
const [swipes, setSwipes] = useState<MovieSwipe[]>([]);

// With this:
import { useFirebaseRoom, useFirebaseUser } from '@/hooks/useFirebase';

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
  recordSwipe 
} = useFirebaseRoom(roomCode);
```

#### **Step 2: Update Room Creation**
```tsx
const handleCreateRoom = async (roomName: string) => {
  try {
    const newRoomCode = await createRoom({
      name: roomName,
      createdAt: new Date(),
      users: [user!], // Current user
      currentMovieIndex: 0,
      matches: []
    });
    setRoomCode(newRoomCode);
    toast({
      title: "Room Created!",
      description: `Room code: ${newRoomCode}. Share this with friends!`,
    });
  } catch (err) {
    toast({
      title: "Error",
      description: "Failed to create room. Please try again.",
      variant: "destructive"
    });
  }
};
```

#### **Step 3: Update Room Joining**
```tsx
const handleJoinRoom = async (roomCode: string, userName: string) => {
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
```

### **Phase 2: Real-time Swiping**

#### **Update SwipeArea Props**
```tsx
// In Index.tsx - pass Firebase data to SwipeArea:
<SwipeArea
  roomCode={roomCode!}
  users={Object.values(room?.users || {})}
  matches={matches}
  swipes={swipes}
  onSwipe={handleSwipe}
  onNewMatch={handleNewMatch}
  genres={[]}
  language={''}
  yearRange={[2022, new Date().getFullYear()]}
  ratingRange={[6.5, 10]}
/>
```

#### **Update Swipe Handler**
```tsx
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
    toast({
      title: "Error",
      description: "Failed to record swipe",
      variant: "destructive"
    });
  }
};
```

---

## 🎯 Key Benefits After Integration

### **Real-time Collaboration:**
- ✅ **Live User Updates** - See when friends join/leave
- ✅ **Real-time Swipes** - Watch others' preferences in real-time
- ✅ **Instant Matches** - Get notified immediately when everyone likes a movie
- ✅ **Synchronized State** - Everyone sees the same room state

### **Persistent Data:**
- ✅ **Resume Sessions** - Come back later, room still there
- ✅ **Swipe History** - All preferences are saved
- ✅ **Match History** - Never lose your matched movies

### **Better UX:**
- ✅ **Human-Readable Codes** - `ABCD12` instead of random Firebase IDs
- ✅ **Error Handling** - Proper feedback for network issues
- ✅ **Loading States** - Show when operations are in progress

---

## 🔥 New Features You Can Add

### **1. Live User Indicators**
Show who's currently online in the room:
```tsx
// In SwipeArea component
<div className="flex items-center gap-2">
  <Users className="w-4 h-4" />
  <span>{users.length} users online</span>
  <div className="flex -space-x-2">
    {users.map(user => (
      <div key={user.id} className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs">
        {user.name[0]}
      </div>
    ))}
  </div>
</div>
```

### **2. Real-time Match Notifications**
Detect when all users have swiped right on the same movie:
```tsx
// This logic would go in your Firebase hooks
const checkForMatches = (swipes: MovieSwipe[], users: RoomUser[]) => {
  const movieSwipes = groupBy(swipes, 'movieId');
  
  Object.entries(movieSwipes).forEach(([movieId, movieSwipesList]) => {
    const likes = movieSwipesList.filter(s => s.liked);
    
    // If all users liked this movie, it's a match!
    if (likes.length === users.length) {
      // Trigger match notification
    }
  });
};
```

### **3. Swipe Activity Feed**
Show recent swipes from other users:
```tsx
<div className="space-y-2">
  {swipes.slice(-5).map(swipe => (
    <div key={`${swipe.userId}-${swipe.movieId}`} className="text-sm text-muted-foreground">
      {getUserName(swipe.userId)} {swipe.liked ? '❤️' : '✗'} {getMovieTitle(swipe.movieId)}
    </div>
  ))}
</div>
```

---

## 🚀 Implementation Steps

### **Immediate (30 minutes):**
1. Replace `Index.tsx` room management with Firebase hooks
2. Update `handleCreateRoom` and `handleJoinRoom` functions
3. Test room creation and joining

### **Phase 2 (1 hour):**
1. Integrate real-time swiping in `SwipeArea`
2. Add loading states and error handling
3. Test collaborative swiping

### **Phase 3 (Optional enhancements):**
1. Add live user indicators
2. Implement match detection
3. Add swipe activity feed
4. Polish the UI with real-time feedback

---

## 🔧 Files to Modify

1. **`src/pages/Index.tsx`** - Main integration point
2. **`src/components/RoomSetup.tsx`** - Update to use Firebase
3. **`src/components/SwipeArea.tsx`** - Add real-time swipe display
4. **`src/hooks/useFirebase.ts`** - Already ready!
5. **`src/services/firebase.ts`** - Already ready!

---

## 🎉 Result

After integration, your MovieMatch app will be a **fully real-time collaborative experience** where friends can:

- Create rooms with easy-to-share codes
- Join each other's rooms instantly
- See each other's movie preferences in real-time
- Get instant notifications when everyone likes the same movie
- Resume their sessions anytime

The Firebase infrastructure is **already complete** - now it's just a matter of connecting it to your existing beautiful UI! 🎬✨
