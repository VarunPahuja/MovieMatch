# 🔧 Step-by-Step Firebase Integration

## Overview
Your current app works with **local state**. We're upgrading it to use **Firebase real-time database** for collaborative functionality.

## Current vs Firebase Architecture

### **Current Flow:**
```
StartScreen → RoomSetup → SwipeArea
     ↓            ↓          ↓
   Local       Mock       Local
   state       rooms      swipes
```

### **Firebase Flow:**
```
StartScreen → RoomSetup → SwipeArea
     ↓            ↓          ↓
   Local      Firebase    Firebase
   state      rooms       real-time
```

---

## 🔄 Required Changes

### **1. Update RoomSetup Component**

Your current `RoomSetup` expects:
```tsx
interface RoomSetupProps {
  onCreateRoom: (roomName: string) => void;
  onJoinRoom: (roomCode: string, userName: string) => void;
}
```

**Change to:**
```tsx
interface RoomSetupProps {
  onCreateRoom: (roomName: string, userName: string) => void; // Add userName parameter
  onJoinRoom: (roomCode: string, userName: string) => void;
  loading?: boolean; // Add loading state
}
```

**In RoomSetup.tsx, update the create room form:**
```tsx
// Add userName input to the create room section
const [creatorName, setCreatorName] = useState('');

// Update create room form to include user name:
<div className="space-y-4">
  <div>
    <Label htmlFor="creatorName">Your Name</Label>
    <Input
      id="creatorName"
      value={creatorName}
      onChange={(e) => setCreatorName(e.target.value)}
      placeholder="Enter your name"
    />
  </div>
  <div>
    <Label htmlFor="roomName">Room Name</Label>
    <Input
      id="roomName"
      value={roomName}
      onChange={(e) => setRoomName(e.target.value)}
      placeholder="Movie Night with Friends"
    />
  </div>
  <Button 
    onClick={() => onCreateRoom(roomName, creatorName)}
    disabled={!roomName.trim() || !creatorName.trim() || loading}
    className="w-full"
  >
    {loading ? 'Creating...' : 'Create Room'}
  </Button>
</div>
```

### **2. Update SwipeArea Component**

**Add these optional props to SwipeAreaProps:**
```tsx
interface SwipeAreaProps {
  // ... existing props
  onLeaveRoom?: () => void;
  realTimeSwipes?: MovieSwipe[];
  currentUser?: RoomUser;
  connected?: boolean;
}
```

**Add a "Leave Room" button in SwipeArea:**
```tsx
// In the SwipeArea header section, add:
{onLeaveRoom && (
  <Button 
    variant="outline" 
    size="sm" 
    onClick={onLeaveRoom}
  >
    Leave Room
  </Button>
)}
```

**Add connection status indicator:**
```tsx
// Add near the users section:
<div className="flex items-center gap-2">
  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
  <span className="text-sm text-muted-foreground">
    {connected ? 'Connected' : 'Disconnected'}
  </span>
</div>
```

### **3. Update Index.tsx Gradually**

Instead of replacing everything at once, you can migrate gradually:

#### **Option A: Side-by-side Testing**
Keep your current `Index.tsx` and create `Index-Firebase.tsx` for testing.

#### **Option B: Feature Flag**
Add a feature flag to test Firebase integration:

```tsx
import { useState } from 'react';
// ... other imports
import { useFirebaseRoom, useFirebaseUser } from '@/hooks/useFirebase';

const Index = () => {
  // Feature flag for Firebase integration
  const [useFirebase, setUseFirebase] = useState(false);
  
  // Your existing local state
  const [showStart, setShowStart] = useState(true);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  // ... rest of existing state

  // Firebase hooks (only active when useFirebase is true)
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
  } = useFirebaseRoom(useFirebase ? roomCode : undefined);

  // Your existing functions
  const handleCreateRoomLocal = (roomName: string) => {
    // ... existing logic
  };

  // New Firebase functions
  const handleCreateRoomFirebase = async (roomName: string, userName: string) => {
    // ... Firebase logic from example above
  };

  // Choose which functions to use based on feature flag
  const handleCreateRoom = useFirebase ? handleCreateRoomFirebase : handleCreateRoomLocal;

  // In your render, add a toggle:
  if (showStart) {
    return (
      <div>
        <div className="absolute top-4 right-4">
          <Button 
            variant="outline" 
            onClick={() => setUseFirebase(!useFirebase)}
          >
            {useFirebase ? 'Use Local Mode' : 'Use Firebase Mode'}
          </Button>
        </div>
        <StartScreen onContinue={() => setShowStart(false)} />
      </div>
    );
  }

  // Rest of your component logic...
};
```

---

## 🎯 Migration Strategy

### **Phase 1: Basic Integration (30 mins)**
1. Add Firebase toggle to `Index.tsx`
2. Update `RoomSetup` to accept userName
3. Test room creation and joining

### **Phase 2: Real-time Features (1 hour)**
1. Integrate real-time swiping
2. Add connection status indicators
3. Add leave room functionality

### **Phase 3: Polish (30 mins)**
1. Improve loading states
2. Add error handling
3. Remove feature flag, make Firebase default

---

## 🚀 Benefits You'll Get

### **Immediate:**
- ✅ **Real room codes** - `ABCD12` instead of mock
- ✅ **Persistent rooms** - Refresh browser, room still there
- ✅ **Multiple users** - Friends can actually join

### **Real-time:**
- ✅ **Live user list** - See who's online
- ✅ **Live swipes** - Watch others' preferences
- ✅ **Instant matches** - Notifications when everyone likes a movie

### **Production Ready:**
- ✅ **Scalable** - Handles many rooms and users
- ✅ **Reliable** - Firebase handles the infrastructure
- ✅ **Secure** - With proper Firebase rules

---

## 🔧 Quick Start

**Want to test Firebase immediately?**

1. Go to `http://localhost:8082/firebase-test`
2. Create a room and get the code
3. Open another browser tab
4. Join the room with the code
5. See real-time collaboration in action!

**Ready to integrate?** Start with Phase 1 above - just add the Firebase toggle to your existing app and you can test both modes side-by-side! 🎬✨
