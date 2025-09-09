import { Users, Circle } from 'lucide-react';
import { Room, RoomUser } from '@/types/Movie';
import { CompactFilters } from './CompactFilters';

interface MemberListProps {
  room: Room;
  onlineUserIds?: string[]; // List of user IDs that are currently online
  currentUserId?: string; // ID of the current user (always shown as online)
  className?: string;
  // Filter props
  genres: string[];
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
  yearRange: [number, number];
  selectedYearRange: [number, number];
  onYearRangeChange: (range: [number, number]) => void;
  ratingRange: [number, number];
  selectedRatingRange: [number, number];
  onRatingRangeChange: (range: [number, number]) => void;
  languages: string[];
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onFilterReset: () => void;
}

export function MemberList({ 
  room, 
  onlineUserIds = [], 
  currentUserId,
  className = '',
  // Filter props
  genres,
  selectedGenres,
  onGenreChange,
  yearRange,
  selectedYearRange,
  onYearRangeChange,
  ratingRange,
  selectedRatingRange,
  onRatingRangeChange,
  languages,
  selectedLanguage,
  onLanguageChange,
  onFilterReset
}: MemberListProps) {
  const allMembers = Object.values(room.users);
  
  // Combine explicit online users with current user (who is always online)
  const allOnlineUserIds = currentUserId 
    ? [...new Set([...onlineUserIds, currentUserId])] // Use Set to avoid duplicates
    : onlineUserIds;
  
  const onlineCount = allMembers.filter(member => allOnlineUserIds.includes(member.id)).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Member List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-white">
            Room Members ({onlineCount}/{allMembers.length} online)
          </h3>
        </div>
        
        <div className="space-y-2">
          {allMembers.map((member) => {
            const isOnline = allOnlineUserIds.includes(member.id);
            return (
              <div 
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-md bg-white/5"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <Circle 
                    className={`absolute -bottom-1 -right-1 w-3 h-3 ${
                      isOnline 
                        ? 'text-green-500 fill-green-500' 
                        : 'text-gray-400 fill-gray-400'
                    }`}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="text-white font-medium">
                    {member.name}
                    {member.id === currentUserId && (
                      <span className="text-xs text-blue-400 ml-2">(You)</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-xs text-muted-foreground text-center">
            Match Threshold: <span className="text-white font-medium">{room.matchThreshold}</span> likes needed
          </div>
        </div>
      </div>

      {/* Compact Filters */}
      <CompactFilters
        genres={genres}
        selectedGenres={selectedGenres}
        onGenreChange={onGenreChange}
        yearRange={yearRange}
        selectedYearRange={selectedYearRange}
        onYearRangeChange={onYearRangeChange}
        ratingRange={ratingRange}
        selectedRatingRange={selectedRatingRange}
        onRatingRangeChange={onRatingRangeChange}
        languages={languages}
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
        onReset={onFilterReset}
      />
    </div>
  );
}

interface MatchThresholdIndicatorProps {
  current: number;
  required: number;
  className?: string;
}

export function MatchThresholdIndicator({ current, required, className = '' }: MatchThresholdIndicatorProps) {
  const percentage = Math.min((current / required) * 100, 100);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 bg-white/10 rounded-full h-2">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            current >= required 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {current}/{required}
      </span>
    </div>
  );
}
