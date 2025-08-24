import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFirebaseRoom, useFirebaseUser } from '@/hooks/useFirebase';
import { checkFirebaseConnection } from '@/services/firebase';
import { testFirebaseConnection } from '@/services/firebaseDebug';
import { FirebaseAuthService } from '@/services/firebaseAuth';
import { Wifi, WifiOff, Users, Check, X, Shield, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { RoomUser } from '@/types/Movie';

export const FirebaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [debugInfo, setDebugInfo] = useState<{ success: boolean; error?: string; authRequired?: boolean } | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const [activeRoomCode, setActiveRoomCode] = useState<string | undefined>();
  
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
  } = useFirebaseRoom(activeRoomCode);

  // Check Firebase connection and authentication on mount
  useEffect(() => {
    const checkServices = async () => {
      // Run connection debug test
      const debugResult = await testFirebaseConnection();
      setDebugInfo(debugResult);
      
      // Check connection
      const isConnected = await checkFirebaseConnection();
      setConnectionStatus(isConnected);
      
      // Check authentication
      try {
        await FirebaseAuthService.initAuth();
        setAuthStatus(FirebaseAuthService.isAuthenticated());
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setAuthStatus(false);
      }
    };
    checkServices();
  }, []);

  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      alert('Please enter your name first');
      return;
    }

    try {
      const newUser = createUser(userName);
      const newRoomCode = await createRoom({
        name: `${userName}'s Room`,
        createdAt: new Date(),
        users: [newUser],
        currentMovieIndex: 0,
        matches: []
      });
      setActiveRoomCode(newRoomCode);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const handleJoinRoom = async () => {
    if (!userName.trim() || !roomCode.trim()) {
      alert('Please enter your name and room code');
      return;
    }

    try {
      const newUser = createUser(userName);
      const success = await joinRoom(roomCode.toUpperCase(), newUser);
      if (success) {
        setActiveRoomCode(roomCode.toUpperCase());
      }
    } catch (err) {
      console.error('Failed to join room:', err);
    }
  };

  const handleTestSwipe = async () => {
    if (!user || !activeRoomCode) return;

    await recordSwipe({
      userId: user.id,
      movieId: Math.floor(Math.random() * 1000),
      liked: Math.random() > 0.5,
      timestamp: new Date()
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Firebase Connection & Auth Test
            {connectionStatus === null ? (
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
            ) : connectionStatus ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Database Connection:</span>
              {connectionStatus === null ? (
                <span className="text-yellow-500">Checking...</span>
              ) : connectionStatus && connected ? (
                <span className="text-green-500 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Connected
                </span>
              ) : (
                <span className="text-red-500 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  Disconnected
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span>Authentication:</span>
              {authStatus === null ? (
                <span className="text-yellow-500">Checking...</span>
              ) : authStatus ? (
                <span className="text-green-500 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Authenticated
                </span>
              ) : (
                <span className="text-red-500 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Not Authenticated
                </span>
              )}
            </div>
            
            {error && (
              <div className="text-red-500 bg-red-50 p-3 rounded-md">
                <div className="font-medium">Error Details:</div>
                <div className="text-sm mt-1">{error}</div>
                {error.includes('PERMISSION_DENIED') && (
                  <div className="mt-2 text-sm bg-yellow-50 border border-yellow-200 p-2 rounded">
                    <strong>Firebase Security Rules Issue:</strong><br/>
                    Please check the FIREBASE_RULES_FIX.md file for instructions on updating your Firebase security rules.
                  </div>
                )}
              </div>
            )}

            {debugInfo && !debugInfo.success && (
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-md">
                <div className="flex items-center gap-2 font-medium text-orange-800">
                  <AlertTriangle className="w-4 h-4" />
                  Debug Information
                </div>
                <div className="text-sm text-orange-700 mt-1">
                  {debugInfo.error}
                </div>
                {debugInfo.authRequired && (
                  <div className="mt-2 text-sm bg-red-50 border border-red-200 p-2 rounded">
                    <strong>Action Required:</strong><br/>
                    1. Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener" className="underline">Firebase Console</a><br/>
                    2. Select your project → Realtime Database → Rules<br/>
                    3. Replace rules with: <code className="bg-gray-100 px-1">&#123;"rules": &#123;".read": true, ".write": true&#125;&#125;</code><br/>
                    4. Click "Publish"
                  </div>
                )}
              </div>
            )}

            {debugInfo?.success && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                <div className="flex items-center gap-2 font-medium text-green-800">
                  <Check className="w-4 h-4" />
                  Firebase Rules Working
                </div>
                <div className="text-sm text-green-700 mt-1">
                  Basic read/write operations are working correctly.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Room Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="userName" className="text-sm font-medium">Your Name</label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              disabled={!!activeRoomCode}
            />
          </div>

          {!activeRoomCode ? (
            <>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateRoom}
                  disabled={loading || !userName.trim()}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create New Room'}
                </Button>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="roomCode" className="text-sm font-medium">Room Code</label>
                <div className="flex gap-2">
                  <Input
                    id="roomCode"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="ABCD12"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleJoinRoom}
                    disabled={loading || !userName.trim() || !roomCode.trim()}
                  >
                    {loading ? 'Joining...' : 'Join Room'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="font-medium text-green-800 mb-2">Connected to Room</h3>
                <p className="text-green-700">Room Code: {activeRoomCode}</p>
                {room && <p className="text-green-700">Room Name: {room.name}</p>}
              </div>
              
              <Button 
                onClick={handleTestSwipe}
                disabled={!user}
                className="w-full"
              >
                Test Swipe Recording
              </Button>
              
              <Button 
                onClick={() => {
                  setActiveRoomCode(undefined);
                  setRoomCode('');
                }}
                variant="outline"
                className="w-full"
              >
                Leave Room
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {room && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Room Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Users ({Object.keys(room.users || {}).length})</h4>
              <div className="space-y-1">
                {Object.values(room.users || {}).map((roomUser: RoomUser) => (
                  <div key={roomUser.id} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    {roomUser.name}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Swipes ({swipes.length})</h4>
              <div className="text-sm text-muted-foreground">
                {swipes.length === 0 ? 'No swipes yet' : `${swipes.length} total swipes recorded`}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Matches ({matches.length})</h4>
              <div className="text-sm text-muted-foreground">
                {matches.length === 0 ? 'No matches yet' : `${matches.length} movies matched`}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FirebaseTest;
