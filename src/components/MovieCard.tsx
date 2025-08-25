import { useState } from 'react';
import { Heart, X, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Movie } from '@/types/Movie';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MovieCardProps {
  movie: Movie;
  onSwipe: (movieId: number, liked: boolean) => void;
  isActive: boolean;
  layout?: 'landscape' | 'portrait';
}

export function MovieCard({ movie, onSwipe, isActive, layout = 'portrait' }: MovieCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleSwipe = (liked: boolean) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    onSwipe(movie.id, liked);
    
    // Reset after animation
    setTimeout(() => {
      setIsAnimating(false);
      setDragPosition({ x: 0, y: 0 });
    }, 500);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const truncateDescription = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Responsive split layout
  if (layout === 'landscape') {
    return (
      <div className="flex flex-col lg:flex-row items-center lg:items-stretch w-full max-w-6xl mx-auto gap-8 lg:gap-12 px-4">
        {/* Movie Poster - Enhanced with better shadows */}
        <div className="flex-none">
          <div className="relative w-80 h-[480px] lg:w-96 lg:h-[576px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <img 
              src={movie.poster} 
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/api/placeholder/400/600';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        </div>

        {/* Movie Details - Enhanced typography */}
        <div className="flex-1 flex flex-col justify-center space-y-6 lg:space-y-8 max-w-2xl">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="movie-title">
              {movie.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="movie-meta font-semibold text-yellow-500">
                  {movie.rating.toFixed(1)}
                </span>
              </div>
              
              {movie.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="movie-meta">
                    {formatDuration(movie.duration)}
                  </span>
                </div>
              )}
              
              <span className="movie-meta bg-gray-800 px-3 py-1 rounded-full">
                {movie.year}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <p className="movie-description">
              {showFullDescription ? movie.description : truncateDescription(movie.description)}
            </p>
            
            {movie.description.length > 200 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-red-400 hover:text-red-300 font-medium text-sm flex items-center gap-1 transition-colors"
              >
                {showFullDescription ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show More
                  </>
                )}
              </button>
            )}
          </div>

          {/* Genres */}
          {movie.genre && movie.genre.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genre.slice(0, 4).map((genre, index) => (
                <span 
                  key={index}
                  className="movie-meta bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons - Refined pill design */}
          <div className="flex gap-6 pt-4">
            <button
              onClick={() => handleSwipe(false)}
              disabled={isAnimating}
              className="btn-pill btn-pass flex items-center gap-3 min-w-[140px] justify-center"
            >
              <X className="w-6 h-6" />
              Pass
            </button>
            
            <button
              onClick={() => handleSwipe(true)}
              disabled={isAnimating}
              className="btn-pill btn-like flex items-center gap-3 min-w-[140px] justify-center"
            >
              <Heart className="w-6 h-6" />
              Like
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Portrait layout (card stack)
  return (
    <Card className={`
      relative w-80 h-[600px] mx-auto bg-card/95 backdrop-blur-md border-border/50 
      transition-all duration-500 shadow-2xl
      ${isActive ? 'z-10 scale-100' : 'z-0 scale-95 opacity-80'}
      ${isAnimating ? 'animate-pulse' : ''}
    `}>
      <div className="relative h-full overflow-hidden rounded-lg">
        {/* Movie Poster */}
        <div className="relative h-3/5 overflow-hidden">
          <img 
            src={movie.poster} 
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/api/placeholder/320/480';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Rating Badge */}
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-semibold text-white">
              {movie.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Movie Info */}
        <div className="h-2/5 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white leading-tight line-clamp-2">
              {movie.title}
            </h2>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{movie.year}</span>
              {movie.duration && (
                <>
                  <span>•</span>
                  <span>{formatDuration(movie.duration)}</span>
                </>
              )}
            </div>

            <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
              {movie.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => handleSwipe(false)}
              disabled={isAnimating}
              className="flex-1 btn-pill btn-pass flex items-center justify-center gap-2 !py-3 !text-base"
            >
              <X className="w-5 h-5" />
              Pass
            </button>
            
            <button
              onClick={() => handleSwipe(true)}
              disabled={isAnimating}
              className="flex-1 btn-pill btn-like flex items-center justify-center gap-2 !py-3 !text-base"
            >
              <Heart className="w-5 h-5" />
              Like
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}