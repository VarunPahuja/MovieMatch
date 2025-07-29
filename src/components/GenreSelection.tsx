
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Example genres, update this list as needed
const GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Animation",
  "Documentary",
];


interface GenreSelectionProps {
  onSelect: (genres: string[]) => void;
}


const GenreSelection: React.FC<GenreSelectionProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    setSelected((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="max-w-md w-full mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Select Genre(s)</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {GENRES.map((genre) => (
            <Card
              key={genre}
              className={`cursor-pointer transition-all border-2 ${selected.includes(genre) ? "border-primary shadow-glow bg-primary/10" : "border-transparent hover:border-primary/40"}`}
              onClick={() => toggleGenre(genre)}
            >
              <CardContent className="flex items-center justify-center h-20 font-semibold text-lg">
                {genre}
              </CardContent>
            </Card>
          ))}
        </div>
        <Button
          className="w-full text-lg py-6"
          size="lg"
          variant="movie"
          disabled={selected.length === 0}
          onClick={() => selected.length > 0 && onSelect(selected)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default GenreSelection;
