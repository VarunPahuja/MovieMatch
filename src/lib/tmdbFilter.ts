// Utility to fetch a list of relevant movie titles from TMDB and filter local dataset

export async function fetchRelevantMovieTitlesFromTMDB(pages = 15) {
  const token = import.meta.env.VITE_TMDB_READ_TOKEN;
  let allTitles: string[] = [];
  for (let page = 1; page <= pages; page++) {
    const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch from TMDB');
    const data = await response.json();
    allTitles = allTitles.concat(data.results.map((movie: { title: string }) => movie.title.toLowerCase()));
  }
  // Remove duplicates
  return Array.from(new Set(allTitles));
}

export function filterMoviesByTMDBTitles(localMovies, tmdbTitles) {
  // Only keep movies whose title matches a TMDB title (case-insensitive)
  return localMovies.filter(m => tmdbTitles.includes(m.title.toLowerCase()));
}
