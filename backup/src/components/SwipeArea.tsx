import { useState, useEffect } from 'react';
import { Shuffle, Users, Trophy, Heart, X } from 'lucide-react';
import { Movie, MovieMatch, RoomUser } from '@/types/Movie';
import { MovieCard } from './MovieCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import moviesData from '@/data/clean_movies.json';

const movies: Movie[] = moviesData as Movie[];


interface SwipeAreaProps {
  roomCode: string;
  users: RoomUser[];
  matches: MovieMatch[];
  onSwipe: (movieId: number, liked: boolean) => void;
  onNewMatch: (match: MovieMatch) => void;
  genres: string[];
  language: string;
  yearRange: [number, number];
  ratingRange: [number, number];
}

export function SwipeArea({ roomCode, users, matches, onSwipe, onNewMatch, genres, language, yearRange, ratingRange }: SwipeAreaProps) {
  // Responsive layout detection
  const [layout, setLayout] = useState<'landscape' | 'portrait'>('portrait');
  useEffect(() => {
    const check = () => {
      if (window.innerWidth > 900 && window.innerWidth > window.innerHeight) {
        setLayout('landscape');
      } else {
        setLayout('portrait');
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [showMatches, setShowMatches] = useState(false);
  const [swipeHistory, setSwipeHistory] = useState<number[]>([]);
  type SortBy = 'rating' | 'year' | 'title' | 'popularity' | 'duration' | 'random';
  const [sortBy, setSortBy] = useState<SortBy>('rating');


  // Filter movies by selected genres, language, year, and rating range
  let filteredMovies = movies.filter((m) => {
    if (m.released === false) return false;
    // Genre filter
    if (genres.length > 0) {
      if (Array.isArray(m.genre)) {
        if (!m.genre.some((g) => genres.includes(g))) return false;
      } else {
        if (!genres.includes(m.genre)) return false;
      }
    }
    // Language filter (case-insensitive, fallback to English if missing)
    if (language && Object.prototype.hasOwnProperty.call(m, 'language')) {
      // @ts-expect-error: Some movie objects may not have a language property, but we want to check if it exists and compare it if present.
      if (typeof m.language === 'string' && m.language.toLowerCase() !== language.toLowerCase()) return false;
    } else if (language && language.toLowerCase() !== 'english') {
      // If movie has no language field, only show for English
      return false;
    }
    // Year range filter
    if (yearRange && (m.year < yearRange[0] || m.year > yearRange[1])) return false;
    // Rating range filter
    if (ratingRange && (m.rating < ratingRange[0] || m.rating > ratingRange[1])) return false;
    return true;
  });

  // Sort movies
  filteredMovies = [...filteredMovies];
  if (sortBy === 'rating') filteredMovies.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (sortBy === 'year') filteredMovies.sort((a, b) => (b.year || 0) - (a.year || 0));
  else if (sortBy === 'title') filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortBy === 'popularity') filteredMovies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  else if (sortBy === 'duration') filteredMovies.sort((a, b) => (b.duration || 0) - (a.duration || 0));
  else if (sortBy === 'random') filteredMovies.sort(() => Math.random() - 0.5);

  const currentMovie = filteredMovies[currentMovieIndex] as Movie;

  const handleSwipe = (movieId: number, liked: boolean) => {
    onSwipe(movieId, liked);
    setSwipeHistory(prev => [...prev, movieId]);
    
    // Move to next movie
    setTimeout(() => {
      setCurrentMovieIndex(prev => 
        prev < filteredMovies.length - 1 ? prev + 1 : 0
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

  const nextMovies = filteredMovies.slice(currentMovieIndex + 1, currentMovieIndex + 3) as Movie[];

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
      {/* Sort By Dropdown */}
      <div className="max-w-md mx-auto mb-4 flex justify-end">
        <label className="mr-2 font-medium text-muted-foreground">Sort by:</label>
        <select
          className="border rounded px-3 py-1 bg-background text-foreground"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
        >
          <option value="rating">Rating</option>
          <option value="year">Year</option>
          <option value="title">Title</option>
          <option value="popularity">Popularity</option>
          <option value="duration">Duration</option>
          <option value="random">Random</option>
        </select>
      </div>

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

      {/* Movie Stack - Responsive and Spacious for Desktop */}
      <div className="relative flex flex-col items-center max-w-3xl mx-auto min-h-[700px]">
      {/* Background Cards removed */}

        {/* Current Movie */}
        {currentMovie && (
          <MovieCard
            movie={currentMovie}
            onSwipe={handleSwipe}
            isActive={true}
            layout={layout}
          />
        )}
      </div>

      {/* Progress */}
      <div className="max-w-md mx-auto mt-6">
        <div className="flex justify-center gap-1">
          {filteredMovies.slice(0, 10).map((_, index) => (
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
          Movie {currentMovieIndex + 1} of {filteredMovies.length}
        </p>
      </div>
    </div>
  );
}