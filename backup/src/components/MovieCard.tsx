import { useState } from 'react';
import { Heart, X, Clock, Star } from 'lucide-react';
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

  // Responsive split layout
  if (layout === 'landscape') {
    return (
      <div className="flex flex-row items-stretch w-full h-[500px] max-w-full">
        {/* Left: Poster flush left, rectangle and smaller */}
        <div className="flex-none w-[320px] h-[480px] flex items-center justify-center">
          <div className="relative w-[320px] h-[480px] rounded-lg overflow-hidden shadow-card">
            <img 
              src={movie.poster} 
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
        </div>
        {/* Right: Structured Summary & Actions flush right */}
        <div className="flex-1 flex flex-col justify-center h-full pl-8 pr-8 min-w-0">
          <div className="flex flex-col gap-4 text-right max-w-2xl ml-auto min-w-0">
            <h2 className="text-3xl font-bold leading-tight mb-1 break-words whitespace-pre-line max-w-full min-w-0" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{movie.title}</h2>
            <div className="flex flex-row justify-end gap-4 text-base text-muted-foreground">
              <span>{movie.year}</span>
              {movie.director && <span>• {movie.director}</span>}
            </div>
            <div className="flex flex-row justify-end gap-6 mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-movie-match text-movie-match" />
                <span className="font-medium">{movie.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-5 h-5" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end mt-2">
              {movie.genre.map((g) => (
                <span 
                  key={g} 
                  className="px-3 py-1 text-xs bg-muted/20 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>
            <div className="text-right mt-2">
              <div className="font-semibold text-base mb-1 text-foreground">Description</div>
              <p className="text-sm text-muted-foreground max-w-xl ml-auto leading-relaxed break-words whitespace-pre-line" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                {movie.description}
              </p>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end gap-8 mt-10">
            <Button
              variant="pass"
              size="swipe"
              onClick={() => handleSwipe(false)}
              className="shadow-lg px-8 py-4 text-lg"
            >
              <X className="w-7 h-7" />
            </Button>
            <Button
              variant="like"
              size="swipe"
              onClick={() => handleSwipe(true)}
              className="shadow-lg px-8 py-4 text-lg"
            >
              <Heart className="w-7 h-7" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  // Portrait (mobile or narrow)
  const cardWidth = 'w-80';
  const cardHeight = 'h-[500px]';
  return (
    <Card 
      className={`
        relative ${cardWidth} ${cardHeight} mx-auto overflow-hidden cursor-grab active:cursor-grabbing
        ${isActive ? 'z-10 animate-bounce-in' : 'z-0 scale-95 opacity-70'}
        ${isAnimating ? 'animate-swipe-right' : ''}
        transition-all duration-300 shadow-card hover:shadow-glow
      `}
      style={{
        transform: isDragging ? `translate(${dragPosition.x}px, ${dragPosition.y}px) rotate(${dragPosition.x * 0.1}deg)` : undefined
      }}
    >
      {/* Movie Poster */}
      <div className="relative h-full">
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        {/* Gradient Overlay only for portrait */}
        <div className="absolute inset-0 bg-gradient-movie" />
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-foreground">
          <div className="space-y-2">
            <h2 className="font-bold leading-tight text-2xl">{movie.title}</h2>
            <p className="text-muted-foreground text-sm">{movie.year} • {movie.director}</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-movie-match text-movie-match" />
                <span className="font-medium">{movie.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {movie.genre.map((g) => (
                <span 
                  key={g} 
                  className="px-3 py-1 text-xs bg-muted/20 rounded-full backdrop-blur-sm"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="mt-4 line-clamp-4 text-sm text-muted-foreground">
              {movie.description}
            </p>
          </div>
        </div>

        {/* Swipe Indicators */}
        {isDragging && (
          <>
            {dragPosition.x > 50 && (
              <div className="absolute inset-0 bg-movie-like/20 flex items-center justify-center">
                <div className="bg-movie-like text-foreground px-6 py-3 rounded-full font-bold text-xl rotate-12">
                  LIKE
                </div>
              </div>
            )}
            {dragPosition.x < -50 && (
              <div className="absolute inset-0 bg-movie-pass/20 flex items-center justify-center">
                <div className="bg-movie-pass text-foreground px-6 py-3 rounded-full font-bold text-xl -rotate-12">
                  PASS
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons - Below Card for Desktop (moved to SwipeArea) */}
      {/* Action Buttons - Original for Mobile */}
      {isActive && !isAnimating && layout === 'portrait' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
          <Button
            variant="pass"
            size="swipe"
            onClick={() => handleSwipe(false)}
            className="shadow-lg"
          >
            <X className="w-6 h-6" />
          </Button>
          <Button
            variant="like"
            size="swipe"
            onClick={() => handleSwipe(true)}
            className="shadow-lg"
          >
            <Heart className="w-6 h-6" />
          </Button>
        </div>
      )}
    </Card>
  );
}