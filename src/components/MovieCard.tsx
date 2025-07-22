import { useState } from 'react';
import { Heart, X, Clock, Star } from 'lucide-react';
import { Movie } from '@/types/Movie';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MovieCardProps {
  movie: Movie;
  onSwipe: (movieId: number, liked: boolean) => void;
  isActive: boolean;
}

export function MovieCard({ movie, onSwipe, isActive }: MovieCardProps) {
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

  return (
    <Card 
      className={`
        relative w-80 h-[500px] mx-auto overflow-hidden cursor-grab active:cursor-grabbing
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
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-movie" />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-foreground">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold leading-tight">{movie.title}</h2>
            <p className="text-sm text-muted-foreground">{movie.year} • {movie.director}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-movie-match text-movie-match" />
                <span className="font-medium">{movie.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {movie.genre.map((g) => (
                <span 
                  key={g} 
                  className="px-2 py-1 text-xs bg-muted/20 rounded-full backdrop-blur-sm"
                >
                  {g}
                </span>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
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

      {/* Action Buttons */}
      {isActive && !isAnimating && (
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