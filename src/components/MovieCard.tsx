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
      <div className="flex flex-col lg:flex-row items-center lg:items-stretch w-full max-w-5xl mx-auto gap-8 lg:gap-12">
        {/* Movie Poster - Consistent sizing */}
        <div className="flex-none">
          <div className="relative w-80 h-[480px] lg:w-96 lg:h-[576px] rounded-xl overflow-hidden shadow-2xl">
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
        
        {/* Movie Details - Optimized layout */}
        <div className="flex-1 flex flex-col justify-center max-w-2xl lg:max-w-3xl">
          {/* Title and Year */}
          <div className="text-center lg:text-left mb-6">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-3 text-foreground">
              {movie.title}
            </h1>
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 text-lg text-muted-foreground">
              <span className="font-medium">{movie.year}</span>
              {movie.director && (
                <>
                  <span>•</span>
                  <span>{movie.director}</span>
                </>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-6">
            <div className="flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-full">
              <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              <span className="font-semibold text-lg">{movie.rating}</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-full">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="font-medium">{formatDuration(movie.duration)}</span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
            {movie.genre.map((g) => (
              <span 
                key={g} 
                className="px-3 py-1 text-sm bg-primary/20 text-primary border border-primary/30 rounded-full font-medium"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-center lg:text-left">Description</h3>
            <div className="relative">
              <p className="text-base leading-relaxed text-muted-foreground text-center lg:text-left">
                {showFullDescription ? movie.description : truncateDescription(movie.description, 300)}
              </p>
              {movie.description.length > 300 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="inline-flex items-center gap-1 mt-2 text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {showFullDescription ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Read more
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center lg:justify-start gap-4 sm:gap-6">
            <Button
              variant="capsulePass"
              size="capsule"
              onClick={() => handleSwipe(false)}
              className="min-w-[120px] sm:min-w-[140px] hover:scale-105 transform transition-all duration-200"
            >
              <X className="w-5 h-5 mr-2" />
              Pass
            </Button>
            <Button
              variant="capsuleLike"
              size="capsule"
              onClick={() => handleSwipe(true)}
              className="min-w-[120px] sm:min-w-[140px] hover:scale-105 transform transition-all duration-200"
            >
              <Heart className="w-5 h-5 mr-2" />
              Like
            </Button>
          </div>
        </div>
      </div>
    );
  }
  // Portrait (mobile or narrow)
  return (
    <Card 
      className={`
        relative w-80 sm:w-96 h-[600px] sm:h-[700px] mx-auto overflow-hidden cursor-grab active:cursor-grabbing
        ${isActive ? 'z-10 animate-bounce-in' : 'z-0 scale-95 opacity-70'}
        ${isAnimating ? 'animate-swipe-right' : ''}
        transition-all duration-300 shadow-2xl hover:shadow-glow
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="space-y-3">
            <h2 className="font-bold leading-tight text-2xl sm:text-3xl">{movie.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-200">
              <span className="font-medium">{movie.year}</span>
              {movie.director && (
                <>
                  <span>•</span>
                  <span>{movie.director}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{movie.rating}</span>
              </div>
              <div className="flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {movie.genre.slice(0, 3).map((g) => (
                <span 
                  key={g} 
                  className="px-2 py-1 text-xs bg-primary/80 text-white rounded-full backdrop-blur-sm font-medium"
                >
                  {g}
                </span>
              ))}
            </div>
            
            <div className="mt-4">
              <p className="text-sm leading-relaxed text-gray-200 line-clamp-3">
                {truncateDescription(movie.description, 150)}
              </p>
              {movie.description.length > 150 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-primary text-sm font-medium mt-1 hover:text-primary/80"
                >
                  Read more...
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Swipe Indicators */}
        {isDragging && (
          <>
            {dragPosition.x > 50 && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl rotate-12 shadow-lg">
                  LIKE
                </div>
              </div>
            )}
            {dragPosition.x < -50 && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl -rotate-12 shadow-lg">
                  PASS
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons for Mobile */}
      {isActive && !isAnimating && layout === 'portrait' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
          <Button
            variant="capsulePass"
            size="capsuleSm"
            onClick={() => handleSwipe(false)}
            className="hover:scale-105 transform transition-all duration-200"
          >
            <X className="w-4 h-4 mr-1" />
            Pass
          </Button>
          <Button
            variant="capsuleLike"
            size="capsuleSm"
            onClick={() => handleSwipe(true)}
            className="hover:scale-105 transform transition-all duration-200"
          >
            <Heart className="w-4 h-4 mr-1" />
            Like
          </Button>
        </div>
      )}
    </Card>
  );
}