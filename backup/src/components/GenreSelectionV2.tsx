import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const GENRES = [
  "Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi", "Thriller", "Animation", "Documentary"
];
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh", label: "Mandarin" },
  { code: "other", label: "Other" }
];
const YEARS = { min: 1970, max: 2025 };
const RATINGS = { min: 1, max: 10 };

interface Filters {
  genres: string[];
  language: string;
  yearRange: [number, number];
  ratingRange: [number, number];
}

interface Props {
  onSelect: (filters: Filters) => void;
}

const GenreSelectionV2: React.FC<Props> = ({ onSelect }) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [language, setLanguage] = useState<string>("");
  const [yearRange, setYearRange] = useState<[number, number]>([YEARS.min, YEARS.max]);
  const [ratingRange, setRatingRange] = useState<[number, number]>([RATINGS.min, RATINGS.max]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const canContinue = selectedGenres.length > 0 && language && yearRange[0] <= yearRange[1] && ratingRange[0] <= ratingRange[1];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="max-w-md w-full mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Personalize Your Movie Match</h1>
        <div>
          <Label className="mb-2 block">Select Genre(s)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
            {GENRES.map((genre) => (
              <Card
                key={genre}
                className={`cursor-pointer transition-all border-2 ${selectedGenres.includes(genre) ? "border-primary shadow-glow bg-primary/10" : "border-transparent hover:border-primary/40"}`}
                onClick={() => toggleGenre(genre)}
              >
                <CardContent className="flex items-center justify-center h-12 font-semibold text-base">
                  {genre}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <Label className="mb-2 block">Preferred Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block">Release Year Range</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm w-10 text-right">{yearRange[0]}</span>
            <Slider
              min={YEARS.min}
              max={YEARS.max}
              step={1}
              value={yearRange}
              onValueChange={(val: number[]) => setYearRange([val[0], val[1]])}
              className="flex-1"
              minStepsBetweenThumbs={1}
            />
            <span className="text-muted-foreground text-sm w-10">{yearRange[1]}</span>
          </div>
        </div>
        <div>
          <Label className="mb-2 block">Rating Range</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm w-8 text-right">{ratingRange[0]}</span>
            <Slider
              min={RATINGS.min}
              max={RATINGS.max}
              step={1}
              value={ratingRange}
              onValueChange={(val: number[]) => setRatingRange([val[0], val[1]])}
              className="flex-1"
              minStepsBetweenThumbs={1}
            />
            <span className="text-muted-foreground text-sm w-8">{ratingRange[1]}</span>
          </div>
        </div>
        <Button
          className="w-full text-lg py-5 mt-2"
          size="lg"
          variant="movie"
          disabled={!canContinue}
          onClick={() => canContinue && onSelect({ genres: selectedGenres, language, yearRange, ratingRange })}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default GenreSelectionV2;
