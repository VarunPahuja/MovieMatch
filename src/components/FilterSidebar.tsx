import React, { useState, useEffect } from 'react';

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

  const handleApply = () => {
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
  };

  const handleReset = () => {
    onReset();
    setYearError(null);
  };

  return (
    <aside className="w-64 p-4 bg-background border-r hidden md:block">
      <h2 className="text-lg font-bold mb-4">Refine By</h2>
      {/* Sort By Dropdown and Shuffle Button */}
      <div className="mb-6">
        <div className="font-semibold mb-2">Sort by</div>
        <div className="flex gap-2">
          <select
            className="border rounded px-3 py-2 w-full bg-background focus:ring-2 focus:ring-primary appearance-none"
            value={sortBy}
            onChange={e => onSortByChange(e.target.value as any)}
          >
            <option value="rating">Rating</option>
            <option value="year">Year</option>
            <option value="title">Title</option>
            <option value="popularity">Popularity</option>
            <option value="duration">Duration</option>
            <option value="random">Random</option>
          </select>
          <button
            className="bg-muted text-foreground rounded px-3 py-2 font-semibold flex items-center justify-center gap-2 hover:bg-primary/10 border border-primary"
            type="button"
            onClick={() => onSortByChange('random')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l16 16M4 20l16-16" /></svg>
            Shuffle
          </button>
        </div>
      </div>
      {/* Year Range Filter */}
      <div className="mb-6">
        <div className="font-semibold mb-2">Year</div>
        <div className="flex gap-2 items-center bg-muted/50 rounded px-2 py-2">
          <div className="flex flex-col items-start w-1/2">
            <label htmlFor="year-min" className="text-xs text-muted-foreground mb-1">From</label>
            <input
              id="year-min"
              type="number"
              className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-primary bg-background text-foreground"
              min={yearRange[0]}
              max={yearRange[1]}
              value={stagedYearRange[0]}
              onChange={e => setStagedYearRange([Number(e.target.value), stagedYearRange[1]])}
            />
          </div>
          <span className="mx-1 text-lg font-bold text-muted-foreground">-</span>
          <div className="flex flex-col items-start w-1/2">
            <label htmlFor="year-max" className="text-xs text-muted-foreground mb-1">To</label>
            <input
              id="year-max"
              type="number"
              className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-primary bg-background text-foreground"
              min={yearRange[0]}
              max={yearRange[1]}
              value={stagedYearRange[1]}
              onChange={e => setStagedYearRange([stagedYearRange[0], Number(e.target.value)])}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">{yearRange[0]} - {yearRange[1]}</div>
        {yearError && <div className="text-red-500 text-xs mt-1">{yearError}</div>}
      </div>
      {/* Rating Range Filter */}
      <div className="mb-6">
        <div className="font-semibold mb-2">Rating</div>
        <div className="flex gap-2 items-center bg-muted/50 rounded px-2 py-2">
          <div className="flex flex-col items-start w-1/2">
            <label htmlFor="rating-min" className="text-xs text-muted-foreground mb-1">Min</label>
            <input
              id="rating-min"
              type="number"
              step="0.1"
              min={ratingRange[0]}
              max={ratingRange[1]}
              className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-primary bg-background text-foreground custom-number-input"
              value={stagedRatingRange[0]}
              onChange={e => setStagedRatingRange([Number(e.target.value), stagedRatingRange[1]])}
            />
          </div>
          <span className="mx-1 text-lg font-bold text-muted-foreground">-</span>
          <div className="flex flex-col items-start w-1/2">
            <label htmlFor="rating-max" className="text-xs text-muted-foreground mb-1">Max</label>
            <input
              id="rating-max"
              type="number"
              step="0.1"
              min={ratingRange[0]}
              max={ratingRange[1]}
              className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-primary bg-background text-foreground custom-number-input"
              value={stagedRatingRange[1]}
              onChange={e => setStagedRatingRange([stagedRatingRange[0], Number(e.target.value)])}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">{ratingRange[0]} - {ratingRange[1]}</div>
      </div>
      {/* Language Filter */}
      <div className="mb-6">
        <div className="font-semibold mb-2">Language</div>
        <div className="relative">
          <select
            className="border rounded px-3 py-2 w-full bg-background focus:ring-2 focus:ring-primary appearance-none"
            value={stagedLanguage}
            onChange={e => setStagedLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</span>
        </div>
      </div>
      <div className="flex gap-2 mt-8">
        <button
          className="flex-1 bg-primary text-white py-2 rounded font-semibold hover:bg-primary/90"
          onClick={handleApply}
        >
          Apply
        </button>
        <button
          className="flex-1 bg-muted py-2 rounded font-semibold"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </aside>
  );
};