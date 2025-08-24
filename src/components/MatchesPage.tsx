import { useState } from 'react';
import { Trophy, X, Users, Star, Calendar, ArrowLeft } from 'lucide-react';
import { MovieMatch, RoomUser } from '@/types/Movie';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MatchesPageProps {
  matches: MovieMatch[];
  users: RoomUser[];
  onClose: () => void;
}

export function MatchesPage({ matches, users, onClose }: MatchesPageProps) {
  const [selectedMatch, setSelectedMatch] = useState<MovieMatch | null>(null);

  // Helper function to get user name by ID
  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  if (selectedMatch) {
    // Detailed view of a single match
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-yellow-600 text-white p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMatch(null)}
                  className="text-white hover:bg-white/20 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Matches
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Movie Details */}
            <div className="p-6">
              <div className="flex gap-6">
                <img 
                  src={selectedMatch.movie.poster} 
                  alt={selectedMatch.movie.title}
                  className="w-48 h-72 object-cover rounded-lg shadow-lg"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedMatch.movie.title}</h1>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-semibold text-lg">{selectedMatch.movie.rating}/10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-600">{selectedMatch.movie.year}</span>
                    </div>
                    <div className="text-sm text-gray-500">{selectedMatch.movie.duration} min</div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMatch.movie.genre.map((genre, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Liked by ({selectedMatch.likedByUsers.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMatch.likedByUsers.map(userId => (
                        <span key={userId} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          ❤️ {getUserName(userId)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Synopsis</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedMatch.movie.description}</p>
                  </div>

                  <div className="mt-6">
                    <Button className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white px-8 py-3 text-lg font-semibold">
                      Add to Watch List
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main matches grid view
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-yellow-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6" />
                <h2 className="text-2xl font-bold">🎉 Your Matches</h2>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {matches.length} movie{matches.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-white/90 mt-2">Movies that everyone in your room loved!</p>
          </div>

          {/* Matches Grid */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {matches.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {matches.map((match, index) => (
                  <div 
                    key={`${match.movie.id}-${index}`}
                    className="group cursor-pointer transform transition-all duration-200 hover:scale-105"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl border-2 border-transparent hover:border-green-300">
                      <CardContent className="p-0">
                        {/* Movie Poster */}
                        <div className="relative">
                          <img 
                            src={match.movie.poster} 
                            alt={match.movie.title}
                            className="w-full h-64 object-cover"
                          />
                          {/* Liked By Overlay */}
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {match.likedByUsers.length}
                          </div>
                          {/* Rating Badge */}
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            {match.movie.rating}
                          </div>
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              className="bg-white text-black hover:bg-gray-100"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>

                        {/* Movie Info */}
                        <div className="p-4">
                          <h3 className="font-bold text-sm text-gray-800 mb-2 group-hover:text-green-600 transition-colors overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                            {match.movie.title}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2">{match.movie.year}</p>
                          
                          {/* Who Liked It */}
                          <div className="flex flex-wrap gap-1">
                            {match.likedByUsers.slice(0, 3).map(userId => (
                              <span key={userId} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                ❤️ {getUserName(userId).split(' ')[0]}
                              </span>
                            ))}
                            {match.likedByUsers.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{match.likedByUsers.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No matches yet!</h3>
                <p className="text-gray-500">
                  Keep swiping to find movies everyone loves. When multiple people like the same movie, it'll appear here.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
