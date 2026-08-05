import posterAlpha from "@/assets/poster-alpha.jpg";
import posterSpider from "@/assets/poster-spider.jpg";
import posterOdyssey from "@/assets/poster-odyssey.jpg";
import posterToys from "@/assets/poster-toys.jpg";
import posterKantara from "@/assets/poster-kantara.jpg";
import posterDevara from "@/assets/poster-devara.jpg";
import posterCoolie from "@/assets/poster-coolie.jpg";
import posterBagheera from "@/assets/poster-bagheera.jpg";
import posterNaga from "@/assets/poster-naga.jpg";
import posterMonsters from "@/assets/poster-monsters.jpg";
import posterRomance from "@/assets/poster-romance.jpg";
import posterThriller from "@/assets/poster-thriller.jpg";

export type CityKey =
  | "bengaluru"
  | "delhi"
  | "mumbai"
  | "hyderabad"
  | "chennai"
  | "kochi";

export type City = {
  key: CityKey;
  name: string;
  /** Language that local prints are additionally dubbed / released in */
  localLanguage: string;
  theatres: string[];
};

export const CITIES: City[] = [
  {
    key: "bengaluru",
    name: "Bengaluru",
    localLanguage: "Kannada",
    theatres: [
      "PVR Orion Mall",
      "INOX Garuda Mall",
      "Cinepolis Nexus Koramangala",
      "PVR Forum Mall",
      "INOX Mantri Square",
      "PVR Phoenix Marketcity",
    ],
  },
  {
    key: "delhi",
    name: "Delhi NCR",
    localLanguage: "Hindi",
    theatres: [
      "PVR Select Citywalk Saket",
      "INOX Nehru Place",
      "PVR Priya Vasant Vihar",
      "Cinepolis DLF Mall of India",
      "PVR Pacific Tagore Garden",
      "Delite Cinema Asaf Ali Road",
    ],
  },
  {
    key: "mumbai",
    name: "Mumbai",
    localLanguage: "Marathi",
    theatres: [
      "PVR Icon Versova",
      "INOX R-City Ghatkopar",
      "Cinepolis Andheri Fun Republic",
      "Regal Cinema Colaba",
      "PVR Phoenix Palladium Lower Parel",
      "Maratha Mandir Mumbai Central",
    ],
  },
  {
    key: "hyderabad",
    name: "Hyderabad",
    localLanguage: "Telugu",
    theatres: [
      "AMB Cinemas Gachibowli",
      "Prasads Multiplex Necklace Road",
      "PVR Inorbit Madhapur",
      "Sudarshan 35MM RTC X Roads",
      "AAA Cinemas Ameerpet",
      "INOX GVK One Banjara Hills",
    ],
  },
  {
    key: "chennai",
    name: "Chennai",
    localLanguage: "Tamil",
    theatres: [
      "Sathyam Cinemas Royapettah",
      "AGS Cinemas OMR",
      "PVR Ampa Skywalk",
      "Rohini Silver Screens Koyambedu",
      "INOX Chennai Citi Centre",
      "Kasi Theatre Ashok Nagar",
    ],
  },
  {
    key: "kochi",
    name: "Kochi",
    localLanguage: "Malayalam",
    theatres: [
      "PVR Lulu Mall Edappally",
      "Cinepolis Centre Square",
      "Saritha Savitha Sangeetha Kacheripady",
      "Vanitha Cineplex Kaloor",
      "Padma Theatre Marine Drive",
      "Q Cinemas Kakkanad",
    ],
  },
];

export function cityByKey(key: string): City {
  return CITIES.find((c) => c.key === key) ?? CITIES[0];
}

export type Showtime = {
  id: string;
  time: string;
  theatre: string;
  screen: string;
  city: CityKey;
  languages: string;
};

export type Movie = {
  slug: string;
  title: string;
  genre: string;
  /** Languages the film is natively released in */
  languages: string[];
  rating: string;
  duration: string;
  poster: string;
  /** Cities where this title is currently running */
  cities: CityKey[];
  /** Cities that also get a dubbed local-language print */
  dubbed?: CityKey[];
  times: string[];
};

const ALL: CityKey[] = ["bengaluru", "delhi", "mumbai", "hyderabad", "chennai", "kochi"];

export const MOVIES: Movie[] = [
  {
    slug: "spider-man-beyond",
    title: "SPIDER-MAN: BEYOND",
    genre: "Superhero / Action",
    languages: ["English", "Hindi"],
    rating: "UA",
    duration: "2h 21m",
    poster: posterSpider,
    cities: ALL,
    dubbed: ["hyderabad", "chennai", "kochi", "bengaluru"],
    times: ["9:45 AM", "1:00 PM", "4:30 PM", "8:15 PM", "11:30 PM"],
  },
  {
    slug: "the-odyssey",
    title: "THE ODYSSEY",
    genre: "Epic / Mythological Adventure",
    languages: ["English"],
    rating: "UA",
    duration: "2h 52m",
    poster: posterOdyssey,
    cities: ALL,
    dubbed: ["delhi", "mumbai", "hyderabad", "chennai"],
    times: ["10:30 AM", "2:15 PM", "6:45 PM", "10:15 PM"],
  },
  {
    slug: "alpha",
    title: "ALPHA",
    genre: "Sci-Fi Thriller",
    languages: ["English"],
    rating: "UA",
    duration: "2h 14m",
    poster: posterAlpha,
    cities: ["bengaluru", "delhi", "mumbai", "hyderabad"],
    dubbed: ["delhi", "hyderabad"],
    times: ["10:30 AM", "1:45 PM", "6:00 PM", "10:15 PM"],
  },
  {
    slug: "kantara-chapter-2",
    title: "KANTARA CHAPTER 2",
    genre: "Drama / Folklore",
    languages: ["Kannada"],
    rating: "UA",
    duration: "2h 48m",
    poster: posterKantara,
    cities: ALL,
    dubbed: ["delhi", "mumbai", "hyderabad", "chennai", "kochi"],
    times: ["10:15 AM", "1:30 PM", "5:45 PM", "9:00 PM", "11:30 PM"],
  },
  {
    slug: "devara-part-2",
    title: "DEVARA PART 2",
    genre: "Action / Drama",
    languages: ["Telugu"],
    rating: "UA",
    duration: "2h 41m",
    poster: posterDevara,
    cities: ["hyderabad", "bengaluru", "chennai", "mumbai", "delhi"],
    dubbed: ["mumbai", "delhi", "chennai", "bengaluru"],
    times: ["10:45 AM", "2:00 PM", "5:30 PM", "9:15 PM"],
  },
  {
    slug: "coolie",
    title: "COOLIE",
    genre: "Action / Thriller",
    languages: ["Tamil"],
    rating: "UA",
    duration: "2h 28m",
    poster: posterCoolie,
    cities: ["chennai", "bengaluru", "kochi", "hyderabad", "mumbai"],
    dubbed: ["bengaluru", "hyderabad", "mumbai", "kochi"],
    times: ["11:00 AM", "2:15 PM", "6:30 PM", "10:00 PM"],
  },
  {
    slug: "bagheera",
    title: "BAGHEERA",
    genre: "Superhero / Vigilante",
    languages: ["Kannada"],
    rating: "UA",
    duration: "2h 22m",
    poster: posterBagheera,
    cities: ["bengaluru", "hyderabad", "chennai"],
    dubbed: ["hyderabad", "chennai"],
    times: ["10:00 AM", "1:15 PM", "4:45 PM", "8:00 PM"],
  },
  {
    slug: "nagabandham",
    title: "NAGABANDHAM",
    genre: "Mythological / Action",
    languages: ["Telugu"],
    rating: "UA",
    duration: "2h 32m",
    poster: posterNaga,
    cities: ["hyderabad", "bengaluru", "chennai", "kochi"],
    dubbed: ["bengaluru", "chennai", "kochi"],
    times: ["11:30 AM", "2:45 PM", "6:15 PM", "10:00 PM"],
  },
  {
    slug: "raat-rani",
    title: "RAAT RANI",
    genre: "Romance / Musical",
    languages: ["Hindi"],
    rating: "UA",
    duration: "2h 09m",
    poster: posterRomance,
    cities: ["mumbai", "delhi", "bengaluru", "hyderabad"],
    times: ["11:15 AM", "3:00 PM", "7:30 PM", "10:45 PM"],
  },
  {
    slug: "kayal",
    title: "KAYAL",
    genre: "Investigative Thriller",
    languages: ["Malayalam"],
    rating: "A",
    duration: "2h 17m",
    poster: posterThriller,
    cities: ["kochi", "chennai", "bengaluru", "mumbai"],
    dubbed: ["chennai", "bengaluru"],
    times: ["10:00 AM", "1:20 PM", "5:00 PM", "9:40 PM"],
  },
  {
    slug: "toy-story-5",
    title: "TOY STORY 5",
    genre: "Animation / Family",
    languages: ["English", "Hindi"],
    rating: "U",
    duration: "1h 58m",
    poster: posterToys,
    cities: ALL,
    dubbed: ["hyderabad", "chennai", "kochi", "bengaluru"],
    times: ["9:00 AM", "12:15 PM", "3:30 PM", "7:45 PM"],
  },
  {
    slug: "minions-and-monsters",
    title: "MINIONS & MONSTERS",
    genre: "Animation / Comedy",
    languages: ["English", "Hindi"],
    rating: "U",
    duration: "1h 42m",
    poster: posterMonsters,
    cities: ALL,
    dubbed: ["bengaluru", "chennai", "kochi", "hyderabad"],
    times: ["10:00 AM", "1:00 PM", "4:00 PM", "9:30 PM"],
  },
];

/** Languages a title screens in for a given city */
export function languagesFor(movie: Movie, cityKey: CityKey): string {
  const city = cityByKey(cityKey);
  const langs = [...movie.languages];
  if (movie.dubbed?.includes(cityKey) && !langs.includes(city.localLanguage)) {
    langs.push(city.localLanguage);
  }
  return langs.join(" · ");
}

export function moviesForCity(cityKey: CityKey): Movie[] {
  return MOVIES.filter((m) => m.cities.includes(cityKey));
}

export function showtimesFor(movie: Movie, cityKey: CityKey): Showtime[] {
  const city = cityByKey(cityKey);
  const langs = languagesFor(movie, cityKey);
  const offset = movie.slug.length;
  return movie.times.map((t, i) => ({
    id: `${movie.slug}--${cityKey}--${i}`,
    time: t,
    theatre: city.theatres[(i + offset) % city.theatres.length],
    screen: `Screen ${(i % 4) + 1}`,
    city: cityKey,
    languages: langs,
  }));
}

export function findMovieByShowtime(
  showId: string,
): { movie: Movie; showtime: Showtime; city: City } | null {
  const [slug, cityKey] = showId.split("--");
  const movie = MOVIES.find((m) => m.slug === slug);
  if (!movie || !cityKey) return null;
  const showtime = showtimesFor(movie, cityKey as CityKey).find((s) => s.id === showId);
  if (!showtime) return null;
  return { movie, showtime, city: cityByKey(cityKey) };
}
