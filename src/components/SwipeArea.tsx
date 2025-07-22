import { useState, useEffect } from 'react';
import { Shuffle, Users, Trophy } from 'lucide-react';
import { Movie, MovieMatch, RoomUser } from '@/types/Movie';
import { MovieCard } from './MovieCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import movies from '@/data/movies.json';

interface SwipeAreaProps {
  roomCode: string;
  users: RoomUser[];
  matches: MovieMatch[];
  onSwipe: (movieId: number, liked: boolean) => void;
  onNewMatch: (match: MovieMatch) => void;
}

export function SwipeArea({ roomCode, users, matches, onSwipe, onNewMatch }: SwipeAreaProps) {
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [showMatches, setShowMatches] = useState(false);
  const [swipeHistory, setSwipeHistory] = useState<number[]>([]);

  const currentMovie = movies[currentMovieIndex] as Movie;

  const handleSwipe = (movieId: number, liked: boolean) => {
    onSwipe(movieId, liked);
    setSwipeHistory(prev => [...prev, movieId]);
    
    // Move to next movie
    setTimeout(() => {
      setCurrentMovieIndex(prev => 
        prev < movies.length - 1 ? prev + 1 : 0
      );
    }, 500);

    // Simulate match checking (in real app, this would be handled by Firebase)
    if (liked) {
      setTimeout(() => {
        // Simulate other users liking the same movie
        const likeCount = Math.floor(Math.random() * 8) + 3; // 3-10 likes
        if (likeCount >= 5) {
          const newMatch: MovieMatch = {
            movie: currentMovie,
            likedByUsers: Array.from({ length: likeCount }, (_, i) => `user-${i}`),
            matchedAt: new Date()
          };
          onNewMatch(newMatch);
        }
      }, 1000);
    }
  };

  const nextMovies = movies.slice(currentMovieIndex + 1, currentMovieIndex + 3) as Movie[];

  if (showMatches) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-movie-match" />
              Matches
            </h2>
            <Button variant="outline" onClick={() => setShowMatches(false)}>
              Back to Swiping
            </Button>
          </div>

          {matches.length === 0 ? (
            <Card className="p-8 text-center">
              <CardContent>
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No matches yet!</h3>
                <p className="text-muted-foreground">
                  Keep swiping to find movies everyone loves
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match, index) => (
                <Card key={match.movie.id} className="overflow-hidden animate-bounce-in">
                  <div className="aspect-[2/3] relative">
                    <img 
                      src={match.movie.poster} 
                      alt={match.movie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <div className="bg-movie-match text-secondary-foreground px-2 py-1 rounded-full text-sm font-bold">
                        {match.likedByUsers.length} likes
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{match.movie.title}</h3>
                    <p className="text-sm text-muted-foreground">{match.movie.year}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-md mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <h2 className="text-xl font-bold">Room: {roomCode}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="w-4 h-4" />
              {users.length} members
            </p>
          </div>
          <div className="flex gap-2">
            {matches.length > 0 && (
              <Button 
                variant="match" 
                size="sm"
                onClick={() => setShowMatches(true)}
              >
                <Trophy className="w-4 h-4 mr-1" />
                {matches.length}
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Shuffle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Movie Stack */}
      <div className="relative max-w-md mx-auto">
        {/* Background Cards */}
        {nextMovies.map((movie, index) => (
          <div
            key={movie.id}
            className="absolute inset-0"
            style={{
              transform: `translateY(${(index + 1) * 8}px) scale(${1 - (index + 1) * 0.05})`,
              zIndex: -index - 1
            }}
          >
            <Card className="w-80 h-[500px] mx-auto bg-muted/20 border-muted" />
          </div>
        ))}

        {/* Current Movie */}
        {currentMovie && (
          <MovieCard
            movie={currentMovie}
            onSwipe={handleSwipe}
            isActive={true}
          />
        )}
      </div>

      {/* Progress */}
      <div className="max-w-md mx-auto mt-6">
        <div className="flex justify-center gap-1">
          {movies.slice(0, 10).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                index < currentMovieIndex 
                  ? 'bg-primary' 
                  : index === currentMovieIndex 
                  ? 'bg-primary/60' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Movie {currentMovieIndex + 1} of {movies.length}
        </p>
      </div>
    </div>
  );
}