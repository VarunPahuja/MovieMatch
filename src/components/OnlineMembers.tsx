import { Users, Wifi, WifiOff } from 'lucide-react';
import { PresenceInfo } from '@/types/Movie';
import { Room } from '@/types/Movie';

interface OnlineMembersProps {
  room: Room | null;
  onlineUsers: PresenceInfo[];
  className?: string;
}

export function OnlineMembers({ room, onlineUsers, className = '' }: OnlineMembersProps) {
  if (!room) return null;

  const totalMembers = Object.keys(room.users).length;
  const onlineCount = onlineUsers.length;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className="flex items-center gap-1">
        {onlineCount > 0 ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-muted-foreground">
          {onlineCount}/{totalMembers} online
        </span>
      </div>
      
      {onlineUsers.length > 0 && (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {onlineUsers.map((user, index) => {
              const roomUser = room.users[user.userId];
              return roomUser ? (
                <span 
                  key={user.userId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {roomUser.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface ReconnectBannerProps {
  isConnected: boolean;
  onReconnect: () => void;
  className?: string;
}

export function ReconnectBanner({ isConnected, onReconnect, className = '' }: ReconnectBannerProps) {
  if (isConnected) return null;

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-yellow-600" />
          <span className="text-yellow-800 text-sm font-medium">
            Connection lost
          </span>
        </div>
        <button
          onClick={onReconnect}
          className="text-yellow-800 text-sm underline hover:no-underline"
        >
          Reconnect
        </button>
      </div>
      <p className="text-yellow-700 text-xs mt-1">
        You've been disconnected. Your progress is saved and you can reconnect anytime.
      </p>
    </div>
  );
}
