import React, { useState, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';

interface FilterSidebarProps {
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
  sortBy: string;
  onSortByChange: (sort: string) => void;
  autoApplyTrigger?: number;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
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
  sortBy,
  onSortByChange,
  autoApplyTrigger,
  onReset,
}) => {
  const [stagedGenres, setStagedGenres] = useState<string[]>(selectedGenres);
  const [stagedYearRange, setStagedYearRange] = useState<[number, number]>([selectedYearRange[0], selectedYearRange[1]]);
  const [stagedRatingRange, setStagedRatingRange] = useState<[number, number]>([selectedRatingRange[0], selectedRatingRange[1]]);
  const [stagedLanguage, setStagedLanguage] = useState<string>(selectedLanguage);
  const [yearError, setYearError] = useState<string | null>(null);

  useEffect(() => { setStagedGenres(selectedGenres); }, [selectedGenres]);
  useEffect(() => { setStagedYearRange([selectedYearRange[0], selectedYearRange[1]]); }, [selectedYearRange]);
  useEffect(() => { setStagedRatingRange([selectedRatingRange[0], selectedRatingRange[1]]); }, [selectedRatingRange]);
  useEffect(() => { setStagedLanguage(selectedLanguage); }, [selectedLanguage]);

  const handleApply = React.useCallback(() => {
    if (
      stagedYearRange[0] < yearRange[0] ||
      stagedYearRange[1] > yearRange[1] ||
      stagedYearRange[0] > stagedYearRange[1]
    ) {
      setYearError(`Year must be between ${yearRange[0]} and ${yearRange[1]}, and min ≤ max.`);
      return;
    } else {
      setYearError(null);
    }
    onGenreChange(stagedGenres);
    onYearRangeChange(stagedYearRange);
    onRatingRangeChange(stagedRatingRange);
    onLanguageChange(stagedLanguage);
  }, [stagedGenres, stagedYearRange, stagedRatingRange, stagedLanguage, yearRange, onGenreChange, onYearRangeChange, onRatingRangeChange, onLanguageChange]);

  // Auto-apply when parent signals (e.g., sort changed) - skip first mount
  const autoApplyRef = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    if (autoApplyTrigger === undefined) return;
    if (autoApplyRef.current === undefined) {
      autoApplyRef.current = autoApplyTrigger;
      return; // skip initial
    }
    if (autoApplyRef.current !== autoApplyTrigger) {
      autoApplyRef.current = autoApplyTrigger;
      handleApply();
    }
  }, [autoApplyTrigger, handleApply]);

  const handleReset = () => {
    onReset();
    setYearError(null);
  };

  return (
    <aside className="w-full">
      <h2 className="text-xl font-bold mb-6">Refine By</h2>
      {/* Genre Filter (Pill Toggle Grid) */}
      <div className="mb-8">
        <div className="font-semibold mb-4">Genre</div>
        <div className="grid grid-cols-3 gap-2">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              className={`px-3 py-1 rounded-full border text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/70 shadow-sm
                ${stagedGenres.includes(genre)
                  ? 'bg-primary text-white border-primary scale-105 shadow-lg ring-2 ring-primary/70'
                  : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 hover:text-white active:scale-95 focus:ring-2 focus:ring-primary/40'}
              `}
              onClick={() => {
                if (stagedGenres.includes(genre)) {
                  setStagedGenres(stagedGenres.filter(g => g !== genre));
                } else {
                  setStagedGenres([...stagedGenres, genre]);
                }
              }}
              aria-pressed={stagedGenres.includes(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
      {/* Year Range Filter (Dual-Range Slider) */}
      <div className="mb-8">
        <div className="font-semibold mb-4">Year</div>
        <div className="flex flex-col gap-2 bg-muted/50 rounded px-2 py-4">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-6 group"
            min={yearRange[0]}
            max={yearRange[1]}
            step={1}
            value={stagedYearRange}
            onValueChange={([min, max]) => setStagedYearRange([min, max])}
            minStepsBetweenThumbs={1}
          >
            <Slider.Track className="bg-zinc-700 relative grow rounded-full h-2 group-hover:bg-zinc-600 transition-colors">
              <Slider.Range className="absolute bg-primary rounded-full h-2 transition-colors" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-primary border-2 border-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/70 transition-transform hover:scale-110 active:scale-95 transition-all duration-150" />
            <Slider.Thumb className="block w-5 h-5 bg-primary border-2 border-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/70 transition-transform hover:scale-110 active:scale-95 transition-all duration-150" />
          </Slider.Root>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{stagedYearRange[0]}</span>
            <span>{stagedYearRange[1]}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">{yearRange[0]} - {yearRange[1]}</div>
        {yearError && <div className="text-red-500 text-xs mt-1">{yearError}</div>}
      </div>
      {/* Rating Range Filter (Dual-Range Slider) */}
      <div className="mb-8">
        <div className="font-semibold mb-4">Rating</div>
        <div className="flex flex-col gap-2 bg-muted/50 rounded px-2 py-4">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-6 group"
            min={ratingRange[0]}
            max={ratingRange[1]}
            step={0.1}
            value={stagedRatingRange}
            onValueChange={([min, max]) => setStagedRatingRange([min, max])}
            minStepsBetweenThumbs={0.1}
          >
            <Slider.Track className="bg-zinc-700 relative grow rounded-full h-2 group-hover:bg-zinc-600 transition-colors">
              <Slider.Range className="absolute bg-primary rounded-full h-2 transition-colors" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-primary border-2 border-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/70 transition-transform hover:scale-110 active:scale-95 transition-all duration-150" />
            <Slider.Thumb className="block w-5 h-5 bg-primary border-2 border-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/70 transition-transform hover:scale-110 active:scale-95 transition-all duration-150" />
          </Slider.Root>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{stagedRatingRange[0].toFixed(1)}</span>
            <span>{stagedRatingRange[1].toFixed(1)}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">{ratingRange[0]} - {ratingRange[1]}</div>
      </div>
      {/* Language Filter */}
      <div className="mb-8">
        <div className="font-semibold mb-4">Language</div>
        <div className="relative">
          <select
            className="border rounded-full px-4 py-2 w-full bg-zinc-800 text-white focus:ring-2 focus:ring-primary appearance-none transition-all duration-150 shadow-sm hover:border-primary/70 focus:border-primary/80 active:scale-[0.98]"
            value={stagedLanguage}
            onChange={e => setStagedLanguage(e.target.value)}
            style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
          >
            {languages.map((lang) => {
              // Add flag emoji and full language name for common languages
              let flag = '';
              let fullName = '';
              switch (lang) {
                case 'en': flag = '🇺🇸'; fullName = 'English'; break;
                case 'fr': flag = '🇫🇷'; fullName = 'French'; break;
                case 'es': flag = '🇪🇸'; fullName = 'Spanish'; break;
                case 'de': flag = '🇩🇪'; fullName = 'German'; break;
                case 'it': flag = '🇮🇹'; fullName = 'Italian'; break;
                case 'ja': flag = '🇯🇵'; fullName = 'Japanese'; break;
                case 'ko': flag = '🇰🇷'; fullName = 'Korean'; break;
                case 'zh': flag = '🇨🇳'; fullName = 'Chinese'; break;
                case 'hi': flag = '🇮🇳'; fullName = 'Hindi'; break;
                case 'ru': flag = '🇷🇺'; fullName = 'Russian'; break;
                case 'pt': flag = '🇵🇹'; fullName = 'Portuguese'; break;
                case 'ar': flag = '🇸🇦'; fullName = 'Arabic'; break;
                case 'tr': flag = '🇹🇷'; fullName = 'Turkish'; break;
                case 'nl': flag = '🇳🇱'; fullName = 'Dutch'; break;
                case 'sv': flag = '🇸🇪'; fullName = 'Swedish'; break;
                case 'pl': flag = '🇵🇱'; fullName = 'Polish'; break;
                case 'fa': flag = '🇮🇷'; fullName = 'Persian'; break;
                case 'ta': flag = '🇮🇳'; fullName = 'Tamil'; break;
                case 'te': flag = '🇮🇳'; fullName = 'Telugu'; break;
                case 'mr': flag = '🇮�'; fullName = 'Marathi'; break;
                case 'bn': flag = '🇧🇩'; fullName = 'Bengali'; break;
                case 'uk': flag = '🇺🇦'; fullName = 'Ukrainian'; break;
                case 'cs': flag = '🇨🇿'; fullName = 'Czech'; break;
                case 'el': flag = '🇬🇷'; fullName = 'Greek'; break;
                case 'fi': flag = '🇫🇮'; fullName = 'Finnish'; break;
                case 'no': flag = '🇳🇴'; fullName = 'Norwegian'; break;
                case 'da': flag = '🇩🇰'; fullName = 'Danish'; break;
                case 'id': flag = '🇮🇩'; fullName = 'Indonesian'; break;
                case 'th': flag = '🇹🇭'; fullName = 'Thai'; break;
                case 'he': flag = '🇮🇱'; fullName = 'Hebrew'; break;
                case 'ro': flag = '🇷🇴'; fullName = 'Romanian'; break;
                case 'hu': flag = '🇭🇺'; fullName = 'Hungarian'; break;
                case 'vi': flag = '🇻🇳'; fullName = 'Vietnamese'; break;
                default:
                  flag = '�🏳️';
                  // Try to prettify the code for unknowns
                  fullName = lang.length === 2 ? lang.toUpperCase() : lang.charAt(0).toUpperCase() + lang.slice(1);
              }
              return (
                <option key={lang} value={lang} className="rounded-full bg-zinc-900 text-white">
                  {flag} {fullName} ({lang.toUpperCase()})
                </option>
              );
            })}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</span>
        </div>
      </div>
      <div className="flex gap-3 mt-10">
        <button
          className="flex-1 bg-primary text-white py-2 rounded font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/70 active:scale-95 transition-all duration-150 shadow-md"
          onClick={handleApply}
        >
          Apply
        </button>
        <button
          className="flex-1 bg-muted py-2 rounded font-semibold hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 transition-all duration-150 shadow"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </aside>
  );
};