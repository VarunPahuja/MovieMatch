import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Star, Film, Globe } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';

interface CompactFiltersProps {
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
  onReset: () => void;
}

export const CompactFilters: React.FC<CompactFiltersProps> = ({
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
  onReset,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenreChange(selectedGenres.filter(g => g !== genre));
    } else {
      onGenreChange([...selectedGenres, genre]);
    }
  };

  const handleSelectAllGenres = () => {
    onGenreChange(genres);
  };

  const handleClearAllGenres = () => {
    onGenreChange([]);
  };

  const filterSections = [
    {
      id: 'genres',
      title: 'Genres',
      icon: Film,
      count: selectedGenres.length,
      content: (
        <div className="space-y-3">
          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">
                {selectedGenres.length} of {genres.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAllGenres}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Select All
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={handleClearAllGenres}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
          
          {/* Genre chips with improved styling */}
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {genres.map((genre) => {
              const isSelected = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'bg-gray-600/50 text-gray-300 hover:bg-gray-500/60 hover:text-white border border-gray-500/30'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
          
          {selectedGenres.length === 0 && (
            <div className="text-xs text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-2 text-center">
              No genres selected - showing all movies
            </div>
          )}
        </div>
      )
    },
    {
      id: 'year',
      title: 'Year',
      icon: Calendar,
      count: selectedYearRange[0] !== yearRange[0] || selectedYearRange[1] !== yearRange[1] ? 1 : 0,
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-white/80">
            <span>{selectedYearRange[0]}</span>
            <span>{selectedYearRange[1]}</span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={selectedYearRange}
            onValueChange={(value) => onYearRangeChange([value[0], value[1]])}
            max={yearRange[1]}
            min={yearRange[0]}
            step={1}
          >
            <Slider.Track className="bg-white/20 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-white shadow-lg rounded-full hover:bg-blue-100 focus:outline-none focus:shadow-md" />
            <Slider.Thumb className="block w-4 h-4 bg-white shadow-lg rounded-full hover:bg-blue-100 focus:outline-none focus:shadow-md" />
          </Slider.Root>
        </div>
      )
    },
    {
      id: 'rating',
      title: 'Rating',
      icon: Star,
      count: selectedRatingRange[0] !== ratingRange[0] || selectedRatingRange[1] !== ratingRange[1] ? 1 : 0,
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-white/80">
            <span>{selectedRatingRange[0]}</span>
            <span>{selectedRatingRange[1]}</span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={selectedRatingRange}
            onValueChange={(value) => onRatingRangeChange([value[0], value[1]])}
            max={ratingRange[1]}
            min={ratingRange[0]}
            step={0.1}
          >
            <Slider.Track className="bg-white/20 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-yellow-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-white shadow-lg rounded-full hover:bg-yellow-100 focus:outline-none focus:shadow-md" />
            <Slider.Thumb className="block w-4 h-4 bg-white shadow-lg rounded-full hover:bg-yellow-100 focus:outline-none focus:shadow-md" />
          </Slider.Root>
        </div>
      )
    },
    {
      id: 'language',
      title: 'Language',
      icon: Globe,
      count: selectedLanguage !== '' ? 1 : 0,
      content: (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onLanguageChange('')}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                selectedLanguage === ''
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              All
            </button>
            {languages.slice(0, 8).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                  selectedLanguage === lang
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      )
    }
  ];

  const activeFiltersCount = selectedGenres.length + 
    (selectedYearRange[0] !== yearRange[0] || selectedYearRange[1] !== yearRange[1] ? 1 : 0) +
    (selectedRatingRange[0] !== ratingRange[0] || selectedRatingRange[1] !== ratingRange[1] ? 1 : 0) +
    (selectedLanguage !== '' ? 1 : 0);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Film className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-white/70 hover:text-white transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-2">
        {filterSections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;
          
          return (
            <div key={section.id} className="space-y-2">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <Icon className="w-4 h-4" />
                  <span>{section.title}</span>
                  {section.id === 'genres' && section.count > 0 && (
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      {section.count} selected
                    </span>
                  )}
                  {section.id !== 'genres' && section.count > 0 && (
                    <span className="bg-blue-500/80 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {section.count}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-white/60" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/60" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-2 pb-2 animate-in slide-in-from-top-2 duration-200">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
