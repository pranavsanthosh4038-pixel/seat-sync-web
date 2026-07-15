export type Showtime = {
  id: string;
  time: string;
  theatre: string;
  screen: string;
};

export type Movie = {
  slug: string;
  title: string;
  genre: string;
  language: string;
  rating: string;
  duration: string;
  poster: string;
  showtimes: Showtime[];
};

const bengaluruTheatres = [
  "PVR Orion Mall",
  "INOX Garuda Mall",
  "Cinepolis Nexus Koramangala",
  "PVR Forum Mall",
  "INOX Mantri Square",
  "PVR Phoenix Marketcity",
];

function makeShowtimes(slug: string, times: string[]): Showtime[] {
  return times.map((t, i) => ({
    id: `${slug}-${t.replace(/[^0-9]/g, "")}-${i}`,
    time: t,
    theatre: bengaluruTheatres[i % bengaluruTheatres.length],
    screen: `Screen ${(i % 4) + 1}`,
  }));
}

export const MOVIES: Movie[] = [
  {
    slug: "alpha",
    title: "ALPHA",
    genre: "Sci-Fi Thriller",
    language: "English",
    rating: "UA",
    duration: "2h 14m",
    poster: "linear-gradient(135deg, #00f0ff, #003a4a)",
    showtimes: makeShowtimes("alpha", ["10:30 AM", "1:45 PM", "6:00 PM", "10:15 PM"]),
  },
  {
    slug: "toy-story-5",
    title: "TOY STORY 5",
    genre: "Animation / Family",
    language: "English / Hindi",
    rating: "U",
    duration: "1h 58m",
    poster: "linear-gradient(135deg, #ffcc00, #7a5a00)",
    showtimes: makeShowtimes("toy-story-5", ["9:00 AM", "12:15 PM", "3:30 PM", "7:45 PM"]),
  },
  {
    slug: "minions-and-monsters",
    title: "MINIONS & MONSTERS",
    genre: "Animation / Comedy",
    language: "English / Kannada",
    rating: "U",
    duration: "1h 42m",
    poster: "linear-gradient(135deg, #00ff88, #004a20)",
    showtimes: makeShowtimes("minions", ["10:00 AM", "1:00 PM", "4:00 PM", "9:30 PM"]),
  },
  {
    slug: "nagabandham",
    title: "NAGABANDHAM",
    genre: "Mythological / Action",
    language: "Kannada / Telugu",
    rating: "UA",
    duration: "2h 32m",
    poster: "linear-gradient(135deg, #bf00ff, #3a0055)",
    showtimes: makeShowtimes("nagabandham", ["11:30 AM", "2:45 PM", "6:15 PM", "10:00 PM"]),
  },
  {
    slug: "kantara-chapter-2",
    title: "KANTARA CHAPTER 2",
    genre: "Drama / Folklore",
    language: "Kannada",
    rating: "UA",
    duration: "2h 48m",
    poster: "linear-gradient(135deg, #ff6b1a, #4a1a00)",
    showtimes: makeShowtimes("kantara-2", ["10:15 AM", "1:30 PM", "5:45 PM", "9:00 PM", "11:30 PM"]),
  },
  {
    slug: "devara-part-2",
    title: "DEVARA PART 2",
    genre: "Action / Drama",
    language: "Telugu / Hindi",
    rating: "UA",
    duration: "2h 41m",
    poster: "linear-gradient(135deg, #ff2e5b, #4a0011)",
    showtimes: makeShowtimes("devara-2", ["10:45 AM", "2:00 PM", "5:30 PM", "9:15 PM"]),
  },
  {
    slug: "coolie",
    title: "COOLIE",
    genre: "Action / Thriller",
    language: "Tamil / Hindi",
    rating: "UA",
    duration: "2h 28m",
    poster: "linear-gradient(135deg, #00f0ff, #bf00ff)",
    showtimes: makeShowtimes("coolie", ["11:00 AM", "2:15 PM", "6:30 PM", "10:00 PM"]),
  },
  {
    slug: "bagheera",
    title: "BAGHEERA",
    genre: "Superhero / Vigilante",
    language: "Kannada",
    rating: "UA",
    duration: "2h 22m",
    poster: "linear-gradient(135deg, #1a1a1a, #00f0ff)",
    showtimes: makeShowtimes("bagheera", ["10:00 AM", "1:15 PM", "4:45 PM", "8:00 PM", "11:00 PM"]),
  },
];

export function findMovieByShowtime(showId: string): { movie: Movie; showtime: Showtime } | null {
  for (const movie of MOVIES) {
    const s = movie.showtimes.find((st) => st.id === showId);
    if (s) return { movie, showtime: s };
  }
  return null;
}
