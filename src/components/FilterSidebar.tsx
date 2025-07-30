
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
  onReset,
}) => {
  // Local state for staged filter changes
  const [stagedGenres, setStagedGenres] = useState<string[]>(selectedGenres);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stagedYearRange, setStagedYearRange] = useState<[number, number]>([selectedYearRange[0], selectedYearRange[1]]);
  const [stagedRatingRange, setStagedRatingRange] = useState<[number, number]>([selectedRatingRange[0], selectedRatingRange[1]]);
  const [stagedLanguage, setStagedLanguage] = useState<string>(selectedLanguage);
  const [yearError, setYearError] = useState<string | null>(null);


  // When parent changes selectedGenres (e.g. reset), update stagedGenres
  useEffect(() => {
    setStagedGenres(selectedGenres);
  }, [selectedGenres]);
  useEffect(() => {
    setStagedYearRange([selectedYearRange[0], selectedYearRange[1]]);
  }, [selectedYearRange]);
  useEffect(() => {
    setStagedRatingRange([selectedRatingRange[0], selectedRatingRange[1]]);
  }, [selectedRatingRange]);
  useEffect(() => {
    setStagedLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const handleGenreToggle = (genre: string) => {
    if (stagedGenres.includes(genre)) {
      setStagedGenres(stagedGenres.filter((g) => g !== genre));
    } else {
      setStagedGenres([...stagedGenres, genre]);
    }
  };

  const handleApply = () => {
    // Validate year range
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
    setDropdownOpen(false);
  };

  const handleReset = () => {
    onReset();
    setDropdownOpen(false);
  };

  return (
    <aside className="w-64 p-4 bg-background border-r hidden md:block">
      <h2 className="text-lg font-bold mb-4">Refine By</h2>
      {/* Genre Filter as Dropdown */}
      <div className="mb-6">
        <div className="font-semibold mb-2">Genre</div>
        <div className="relative">
          <button
            className="w-full border rounded px-3 py-2 text-left bg-background hover:bg-muted focus:outline-none"
            onClick={() => setDropdownOpen((open) => !open)}
            type="button"
          >
            {stagedGenres.length === 0
              ? 'Select genres'
              : stagedGenres.length === genres.length
              ? 'All genres selected'
              : `${stagedGenres.length} selected`}
            <span className="float-right">▼</span>
          </button>
          {dropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-background border rounded shadow-lg max-h-64 overflow-y-auto">
              <div className="flex flex-col gap-1 p-2">
                {genres.map((genre) => (
                  <label key={genre} className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1 rounded">
                    <input
                      type="checkbox"
                      checked={stagedGenres.includes(genre)}
                      onChange={() => handleGenreToggle(genre)}
                    />
                    {genre}
                  </label>
                ))}
              </div>
              <div className="flex gap-2 p-2 border-t mt-2">
                <button
                  className="flex-1 bg-primary text-white py-1 rounded font-semibold hover:bg-primary/90"
                  onClick={handleApply}
                >
                  Apply
                </button>
                <button
                  className="flex-1 bg-muted py-1 rounded font-semibold"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
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
