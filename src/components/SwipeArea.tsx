import { useState, useEffect, useMemo } from 'react';
import { Shuffle, Users, Trophy, Heart, X, Activity } from 'lucide-react';
import { Movie, MovieMatch, RoomUser, MovieSwipe } from '@/types/Movie';
import { MovieCard } from './MovieCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MatchesPage } from './MatchesPage';
import { Logo } from './Logo';
import { ProgressBar } from './ProgressBar';

import moviesData from '@/data/clean_movies.json';
import { fetchRelevantMovieTitlesFromTMDB, filterMoviesByTMDBTitles } from '@/lib/tmdbFilter';
import { Loader2 } from 'lucide-react';



const movies: Movie[] = moviesData as Movie[];

// Default filter values
const DEFAULT_MIN_YEAR = 2022;
const DEFAULT_MIN_RATING = 6.5;


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
  // New optional props for real-time features
  realTimeSwipes?: MovieSwipe[];
  currentUser?: RoomUser;
  connected?: boolean;
  onLeaveRoom?: () => void;
}

export function SwipeArea({ 
  roomCode, 
  users, 
  matches, 
  onSwipe, 
  onNewMatch, 
  genres, 
  language, 
  yearRange, 
  ratingRange,
  realTimeSwipes = [],
  currentUser,
  connected = true,
  onLeaveRoom
}: SwipeAreaProps) {
  const [showLiveActivity, setShowLiveActivity] = useState(false);
  // State for TMDB-filtered movies
  const [tmdbTitles, setTmdbTitles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Sort order state: 'desc' = High→Low (default), 'asc' = Low→High
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Load 5 pages first, then 10 more in the background
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchRelevantMovieTitlesFromTMDB(5)
      .then(titles => {
        if (mounted) {
          setTmdbTitles(titles);
          setLoading(false);
          // Start loading 10 more pages in the background
          fetchRelevantMovieTitlesFromTMDB(15).then(bgTitles => {
            if (mounted) setTmdbTitles(bgTitles);
          });
        }
      })
      .catch(e => { if (mounted) { setError('Failed to fetch TMDB movies'); setLoading(false); } });
    return () => { mounted = false; };
  }, []);
  // Filter local movies by TMDB titles if available
  const filteredByTMDB = useMemo(() => {
    if (!tmdbTitles) return [];
    return filterMoviesByTMDBTitles(movies, tmdbTitles);
  }, [tmdbTitles]);

  // Use filtered movies for all further logic
  const moviesToUse = tmdbTitles ? filteredByTMDB : movies;

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
  const [randomOrder, setRandomOrder] = useState<number[]>([]);
  // Track previous filtered movies length to detect changes
  const [prevFilteredLength, setPrevFilteredLength] = useState(0);
  
  // Navigation state for progress tracking and back functionality
  const [startingMovieIndex, setStartingMovieIndex] = useState(0);
  const [visitedMovies, setVisitedMovies] = useState<number[]>([]);
  const [currentPosition, setCurrentPosition] = useState(0); // Position in visited array

  // Set random starting movie index on initial load
  useEffect(() => {
    if (moviesToUse.length > 0 && currentMovieIndex === 0 && prevFilteredLength === 0) {
      // Only randomize on very first load, not on subsequent filter changes
      const randomIndex = Math.floor(Math.random() * Math.min(moviesToUse.length, 50)); // Random within first 50 to avoid too much delay
      setCurrentMovieIndex(randomIndex);
      setStartingMovieIndex(randomIndex);
      setVisitedMovies([randomIndex]);
      setCurrentPosition(0);
    }
  }, [moviesToUse.length, currentMovieIndex, prevFilteredLength]);

  // Filter movies by selected genres, language, year, and rating range
  let filteredMovies = moviesToUse.filter((m) => {
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
      if (typeof m.language === 'string' && m.language.toLowerCase() !== language.toLowerCase()) return false;
    } else if (language && language.toLowerCase() !== 'en') {
      // If movie has no language field, only show for English
      return false;
    }
    // Year range filter
    if (m.year < yearRange[0] || m.year > yearRange[1]) return false;
    // Rating range filter
    if (m.rating < ratingRange[0] || m.rating > ratingRange[1]) return false;
    return true;
  });

  // Sort movies
  filteredMovies = [...filteredMovies];
  if (sortBy === 'rating') {
    filteredMovies.sort((a, b) => sortOrder === 'desc' ? (b.rating || 0) - (a.rating || 0) : (a.rating || 0) - (b.rating || 0));
  } else if (sortBy === 'year') {
    filteredMovies.sort((a, b) => sortOrder === 'desc' ? (b.year || 0) - (a.year || 0) : (a.year || 0) - (b.year || 0));
  } else if (sortBy === 'title') {
    filteredMovies.sort((a, b) => sortOrder === 'desc' ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title));
  } else if (sortBy === 'popularity') {
    filteredMovies.sort((a, b) => sortOrder === 'desc' ? (b.popularity || 0) - (a.popularity || 0) : (a.popularity || 0) - (b.popularity || 0));
  } else if (sortBy === 'duration') {
    filteredMovies.sort((a, b) => sortOrder === 'desc' ? (b.duration || 0) - (a.duration || 0) : (a.duration || 0) - (b.duration || 0));
  }
  else if (sortBy === 'random') {
    // Shuffle only once per random selection
    if (randomOrder.length !== filteredMovies.length) {
      // Generate a new random order
      const indices = filteredMovies.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setRandomOrder(indices);
    }
    filteredMovies = randomOrder.map(i => filteredMovies[i]).filter(Boolean);
  } else if (randomOrder.length) {
    setRandomOrder([]); // Reset random order if not in random mode
  }

  // Randomize starting movie index when filtered movies change
  // This ensures a different first movie is shown each time filters are applied
  if (filteredMovies.length > 0 && filteredMovies.length !== prevFilteredLength) {
    const randomStartIndex = Math.floor(Math.random() * filteredMovies.length);
    setCurrentMovieIndex(randomStartIndex);
    setStartingMovieIndex(randomStartIndex);
    setVisitedMovies([randomStartIndex]);
    setCurrentPosition(0);
    setPrevFilteredLength(filteredMovies.length);
  }

  const currentMovie = filteredMovies[currentMovieIndex] as Movie;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
      </div>
    );
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-xl text-red-500">{error}</div>;
  }

  const handleSwipe = (movieId: number, liked: boolean) => {
    onSwipe(movieId, liked);
    setSwipeHistory(prev => [...prev, movieId]);
    
    // Find next unvisited movie
    setTimeout(() => {
      let nextIndex = currentMovieIndex;
      let attempts = 0;
      const maxAttempts = filteredMovies.length;
      
      // Find next movie that hasn't been visited
      do {
        nextIndex = (nextIndex + 1) % filteredMovies.length;
        attempts++;
      } while (visitedMovies.includes(nextIndex) && attempts < maxAttempts);
      
      // If all movies have been visited, cycle back to start
      if (attempts >= maxAttempts) {
        nextIndex = startingMovieIndex;
        // Reset visited movies but keep the starting point
        setVisitedMovies([startingMovieIndex]);
        setCurrentPosition(0);
      } else {
        // Add new movie to visited list
        setVisitedMovies(prev => [...prev, nextIndex]);
        setCurrentPosition(prev => prev + 1);
      }
      
      setCurrentMovieIndex(nextIndex);
    }, 500);
  };

  // Handle going back to previous movie
  const handleBack = () => {
    if (currentPosition > 0) {
      const prevPosition = currentPosition - 1;
      const prevMovieIndex = visitedMovies[prevPosition];
      setCurrentMovieIndex(prevMovieIndex);
      setCurrentPosition(prevPosition);
    }
  };

  // Helper function to get user name by ID
  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  // Helper function to get movie title by ID
  const getMovieTitle = (movieId: number): string => {
    const movie = moviesToUse.find(m => m.id === movieId);
    return movie?.title || 'Unknown Movie';
  };

  // Helper function to format time ago
  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  // Get recent swipes for current movie
  const currentMovieSwipes = realTimeSwipes
    .filter(swipe => swipe.movieId === currentMovie?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Get recent swipes for activity feed (last 5)
  const recentSwipes = realTimeSwipes
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // Next movies for preview
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
    <div className="min-h-screen flex">
      {/* Main content */}
      <div className="flex-1 p-6">


        {/* Header with Logo and Sort By */}
        <div className="max-w-6xl mx-auto mb-8 space-y-6">
          {/* Top Row: Logo and Room Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Logo />
              
              {/* Room Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold">Room: {roomCode}</h2>
                  {/* Connection Status */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} ${connected ? 'animate-pulse' : ''}`} />
                    <span className="text-sm text-muted-foreground">
                      {connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {users.length} members online
                </div>
              </div>
            </div>

            {/* Top Right: Leave Room & Matches */}
            <div className="flex items-center gap-4">
              {/* Leave Room Button */}
              {onLeaveRoom && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onLeaveRoom}
                  className="btn-pill"
                >
                  Leave Room
                </Button>
              )}
              
              {/* Matches Button */}
              {matches.length > 0 && (
                <Button 
                  onClick={() => setShowMatches(true)}
                  className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white btn-pill font-semibold shadow-lg transition-all duration-150 flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span>{matches.length} Match{matches.length !== 1 ? 'es' : ''}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Bottom Row: Sort Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
            <span className="font-semibold text-lg">Sort by:</span>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 bg-zinc-800 rounded-full p-1 shadow-inner">
                {[
                  { value: 'random', label: 'Random', toggle: false },
                  { value: 'rating', label: 'Rating', toggle: true },
                  { value: 'year', label: 'Year', toggle: true },
                  { value: 'popularity', label: 'Popularity', toggle: true },
                ].map(opt => (
                  <div key={opt.value} className="relative flex items-center">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/70 flex items-center gap-1
                        ${sortBy === opt.value
                          ? 'bg-primary text-white shadow-lg scale-105'
                          : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600 hover:text-white'}`}
                      onClick={() => {
                        setSortBy(opt.value as SortBy);
                        if (opt.value === 'random') setRandomOrder([]);
                      }}
                      aria-pressed={sortBy === opt.value}
                    >
                      {opt.label}
                    </button>
                    {opt.toggle && sortBy === opt.value && (
                      <button
                        type="button"
                        className="ml-2 p-1 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/70 transition-all duration-150"
                        title={sortOrder === 'desc' ? 'High → Low' : 'Low → High'}
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                      >
                        <span className="inline-block align-middle">
                          {sortOrder === 'desc' ? (
                            <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M8 11l4-4H4l4 4z" fill="currentColor"/></svg>
                          ) : (
                            <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M8 5l4 4H4l4-4z" fill="currentColor"/></svg>
                          )}
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/70 active:scale-95 transition-all duration-150 shadow-md"
                onClick={() => {
                  // Apply current sort and randomize starting movie
                  const currentFilteredLength = filteredMovies.length;
                  if (currentFilteredLength > 0) {
                    const randomIndex = Math.floor(Math.random() * currentFilteredLength);
                    setCurrentMovieIndex(randomIndex);
                    setStartingMovieIndex(randomIndex);
                    setVisitedMovies([randomIndex]);
                    setCurrentPosition(0);
                  } else {
                    setCurrentMovieIndex(0);
                    setStartingMovieIndex(0);
                    setVisitedMovies([0]);
                    setCurrentPosition(0);
                  }
                  if (sortBy === 'random') setRandomOrder([]);
                  setPrevFilteredLength(currentFilteredLength);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Current Movie Swipe Status - Compact version */}
        {currentMovie && currentMovieSwipes.length > 0 && (
          <div className="max-w-5xl mx-auto mb-4">
            <div className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border">
              <Heart className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">"{currentMovie.title}":</span>
              <div className="flex gap-1">
                {currentMovieSwipes.map((swipe, index) => (
                  <span 
                    key={`${swipe.userId}-${index}`}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      swipe.liked 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {swipe.liked ? '❤️' : '💔'} {getUserName(swipe.userId)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Movie Display - Optimized Container */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-center min-h-[600px]">
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
        </div>

        {/* Progress Bar and Navigation */}
        <div className="max-w-md mx-auto mt-6 space-y-4">
          {/* Back Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleBack}
              disabled={currentPosition === 0}
              variant="outline"
              size="sm"
              className="btn-pill flex items-center gap-2"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M10 12l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </Button>
          </div>
          
          {/* Progress Bar - shows progress from starting point */}
          <ProgressBar 
            current={currentPosition + 1} 
            total={Math.min(visitedMovies.length + Math.max(0, filteredMovies.length - visitedMovies.length), filteredMovies.length)} 
          />
          
          {/* Progress Text */}
          <p className="text-center text-sm text-muted-foreground">
            Visited {visitedMovies.length} of {filteredMovies.length} movies
            {startingMovieIndex !== 0 && (
              <span className="block text-xs opacity-75">
                Started from movie #{startingMovieIndex + 1}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Floating Activity Button - Bottom Right */}
      {realTimeSwipes.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setShowLiveActivity(true)}
            className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg border-2 border-white"
            size="icon"
          >
            <div className="relative">
              <Activity className="w-6 h-6 text-white" />
              {recentSwipes.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {recentSwipes.length}
                </span>
              )}
            </div>
          </Button>
        </div>
      )}

      {/* Live Activity Modal */}
      {showLiveActivity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    <h3 className="font-bold">🔴 Live Activity</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLiveActivity(false)}
                    className="text-white hover:bg-white/20"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {recentSwipes.length > 0 ? (
                  <div className="space-y-3">
                    {recentSwipes.map((swipe, index) => (
                      <div key={`${swipe.userId}-${swipe.movieId}-${swipe.timestamp}`} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                        <span className="text-2xl">{swipe.liked ? '❤️' : '💔'}</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{getUserName(swipe.userId)}</div>
                          <div className="text-sm text-gray-600">
                            {swipe.liked ? 'liked' : 'disliked'} <span className="font-medium">"{getMovieTitle(swipe.movieId)}"</span>
                          </div>
                          <div className="text-xs text-gray-500">{formatTimeAgo(new Date(swipe.timestamp))}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No activity yet. Start swiping!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Matches Page */}
      {showMatches && (
        <MatchesPage 
          matches={matches}
          users={users}
          onClose={() => setShowMatches(false)}
        />
      )}
    </div>
  );
}
// End of SwipeArea