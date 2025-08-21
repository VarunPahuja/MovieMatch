import { useState, useEffect, useMemo } from 'react';
import { Shuffle, Users, Trophy, Heart, X } from 'lucide-react';
import { Movie, MovieMatch, RoomUser } from '@/types/Movie';
import { MovieCard } from './MovieCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import moviesData from '@/data/clean_movies.json';
import { fetchRelevantMovieTitlesFromTMDB, filterMoviesByTMDBTitles } from '@/lib/tmdbFilter';
import { FilterSidebar } from './FilterSidebar';


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
}

export function SwipeArea({ roomCode, users, matches, onSwipe, onNewMatch, genres, language, yearRange, ratingRange }: SwipeAreaProps) {
  // State for TMDB-filtered movies
  const [tmdbTitles, setTmdbTitles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchRelevantMovieTitlesFromTMDB()
      .then(titles => { if (mounted) { setTmdbTitles(titles); setLoading(false); } })
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

  // Gather all genres and languages from moviesToUse
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    moviesToUse.forEach(m => {
      if (Array.isArray(m.genre)) m.genre.forEach(g => set.add(g));
      else if (typeof m.genre === 'string') set.add(m.genre);
    });
    return Array.from(set).sort();
  }, [moviesToUse]);
  const allLanguages = useMemo(() => {
    const set = new Set<string>();
    moviesToUse.forEach(m => {
      if ('language' in m && m.language) set.add(m.language);
    });
    return Array.from(set).sort();
  }, [moviesToUse]);
  const minYear = useMemo(() => Math.min(...moviesToUse.map(m => m.year)), [moviesToUse]);
  const maxYear = useMemo(() => Math.max(...moviesToUse.map(m => m.year)), [moviesToUse]);

  // Local filter state
  const [selectedGenres, setSelectedGenres] = useState<string[]>(allGenres);
  const [selectedYearRange, setSelectedYearRange] = useState<[number, number]>([DEFAULT_MIN_YEAR, new Date().getFullYear()]);
  const [selectedRatingRange, setSelectedRatingRange] = useState<[number, number]>([DEFAULT_MIN_RATING, 10]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

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
  let filteredMovies = moviesToUse.filter((m) => {
    if (m.released === false) return false;
    // Genre filter
    if (selectedGenres.length > 0) {
      if (Array.isArray(m.genre)) {
        if (!m.genre.some((g) => selectedGenres.includes(g))) return false;
      } else {
        if (!selectedGenres.includes(m.genre)) return false;
      }
    }
    // Language filter (case-insensitive, fallback to English if missing)
    if (selectedLanguage && Object.prototype.hasOwnProperty.call(m, 'language')) {
      if (typeof m.language === 'string' && m.language.toLowerCase() !== selectedLanguage.toLowerCase()) return false;
    } else if (selectedLanguage && selectedLanguage.toLowerCase() !== 'en') {
      // If movie has no language field, only show for English
      return false;
    }
    // Year range filter
    if (m.year < selectedYearRange[0] || m.year > selectedYearRange[1]) return false;
    // Rating range filter
    if (m.rating < selectedRatingRange[0] || m.rating > selectedRatingRange[1]) return false;
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading relevant movies...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-xl text-red-500">{error}</div>;
  }

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
    <div className="min-h-screen flex">
      {/* Sidebar for desktop */}
      <FilterSidebar
        genres={allGenres}
        selectedGenres={selectedGenres}
        onGenreChange={setSelectedGenres}
        yearRange={[minYear, maxYear]}
        selectedYearRange={selectedYearRange}
        onYearRangeChange={setSelectedYearRange}
        ratingRange={[0, 10]}
        selectedRatingRange={selectedRatingRange}
        onRatingRangeChange={setSelectedRatingRange}
        languages={allLanguages}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        sortBy={sortBy}
        onSortByChange={(s) => setSortBy(s as SortBy)}
        onReset={() => {
          setSelectedGenres(allGenres);
          setSelectedYearRange([DEFAULT_MIN_YEAR, new Date().getFullYear()]);
          setSelectedRatingRange([DEFAULT_MIN_RATING, 10]);
          setSelectedLanguage('en');
        }}
      />
      {/* Main content */}
      <div className="flex-1 p-6">


        {/* Header */}
        <div className="max-w-md mx-auto mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-center">Room: {roomCode}</h2>
              <div className="flex justify-center">
                <p className="text-sm text-muted-foreground flex items-center gap-1 text-left max-w-xs mx-auto">
                  <Users className="w-4 h-4" />
                  {users.length} members
                </p>
              </div>
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
    </div>
  );
}
// End of SwipeArea