import { useState } from 'react';
import { Users, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface RoomSetupProps {
  onCreateRoom: (roomName: string, userName: string) => void;
  onJoinRoom: (roomCode: string, userName: string) => void;
  loading?: boolean;
}

export function RoomSetup({ onCreateRoom, onJoinRoom, loading }: RoomSetupProps) {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const [creatorName, setCreatorName] = useState('');

  const handleCreateRoom = () => {
    if (roomName.trim() && creatorName.trim()) {
      onCreateRoom(roomName.trim(), creatorName.trim());
    }
  };

  const handleJoinRoom = () => {
    if (roomCode.trim() && userName.trim()) {
      onJoinRoom(roomCode.trim().toLowerCase(), userName.trim());
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MovieMatch
            </h1>
            <p className="text-muted-foreground">
              Swipe together, watch together
            </p>
          </div>

          {/* Action Cards */}
          <div className="space-y-4">
            <Card 
              className="cursor-pointer hover:shadow-glow transition-all duration-300 hover:scale-105"
              onClick={() => setMode('create')}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Create Room</h3>
                  <p className="text-sm text-muted-foreground">
                    Start a new movie matching session
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-glow transition-all duration-300 hover:scale-105"
              onClick={() => setMode('join')}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Join Room</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a room code to join friends
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md animate-bounce-in">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center">
              <Plus className="w-5 h-5 text-primary" />
              Create Room
            </CardTitle>
            <CardDescription>
              Give your room a name to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="creator-name">Your Name</Label>
              <Input
                id="creator-name"
                placeholder="Enter your name"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                placeholder="Friday Night Movies"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setMode('select')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                variant="movie" 
                onClick={handleCreateRoom}
                disabled={!roomName.trim() || !creatorName.trim() || loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md animate-bounce-in">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Users className="w-5 h-5 text-accent" />
            Join Room
          </CardTitle>
          <CardDescription>
            Enter the room code and your name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-code">Room Code</Label>
            <Input
              id="room-code"
              placeholder="ABC123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="uppercase tracking-wider text-center text-lg font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user-name">Your Name</Label>
            <Input
              id="user-name"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setMode('select')}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              variant="movie" 
              onClick={handleJoinRoom}
              disabled={!roomCode.trim() || !userName.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}