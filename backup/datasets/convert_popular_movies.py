import json
import re
from datetime import datetime

# Input and output paths
INPUT = '../src/data/popular_movies.json'
OUTPUT = '../src/data/clean_movies.json'
TMDB_BASE = 'https://image.tmdb.org/t/p/w500'

with open(INPUT, encoding='utf-8') as f:
    data = json.load(f)

cleaned = []
for idx, m in enumerate(data):
    # Parse genres
    genres = []
    genres_str = m.get('genres', '')
    if genres_str:
        try:
            genres_json = genres_str.replace("'", '"')
            genres_list = json.loads(genres_json)
            genres = [g['name'] for g in genres_list if 'name' in g]
        except Exception:
            pass
    # Year and Released
    year = None
    released = False
    release_date_str = m.get('release_date')
    if release_date_str:
        try:
            year = int(release_date_str[:4])
            # Check if released
            today = datetime.now().date()
            release_date = datetime.strptime(release_date_str, '%Y-%m-%d').date()
            released = release_date <= today
        except Exception:
            year = None
            released = False
    # Poster
    poster_path = m.get('poster_path')
    poster = TMDB_BASE + poster_path if poster_path else ''
    # Rating
    try:
        rating = float(m.get('vote_average', 0))
    except Exception:
        rating = 0
    # Duration
    try:
        duration = int(m.get('runtime', 0))
    except Exception:
        duration = 0
    # ID
    movie_id = m.get('id', idx)
    # Build clean dict
    clean = {
        'id': movie_id,
        'title': m.get('title', ''),
        'year': year,
        'genre': genres,
        'director': '',
        'rating': rating,
        'description': m.get('overview', ''),
        'poster': poster,
        'duration': duration,
        'released': released,
        'language': m.get('original_language', '')
    }
    cleaned.append(clean)

with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(cleaned, f, indent=2, ensure_ascii=False)

print(f"Converted {len(cleaned)} movies to {OUTPUT}")
