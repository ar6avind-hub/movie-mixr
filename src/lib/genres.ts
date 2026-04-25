// Curated genre list for playlists. Keep short and meaningful.
export const GENRES = [
  "Drama",
  "Comedy",
  "Thriller",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Action",
  "Animation",
  "Documentary",
  "Noir",
  "Fantasy",
  "Mystery",
] as const;

export type Genre = (typeof GENRES)[number];
