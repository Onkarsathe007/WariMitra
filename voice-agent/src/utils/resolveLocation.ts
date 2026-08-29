import axios from "axios";
import { logger } from "./logger";

export async function resolveLocation(query: string): Promise<{ lat: number; lng: number } | null> {
  // If the query is already "lat,lng", parse it directly
  const coords = query.split(",");
  if (coords.length === 2) {
    const lat = Number(coords[0]);
    const lng = Number(coords[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  if (!query || query.trim() === "") {
    return null;
  }

  // Clean the query by removing conversational words in English, Marathi, and Hindi
  const stopWords = [
    "nearby", "places", "in", "near me", "find", 
    "मध्ये", "जवळ", "च्या", "mein", "में", "se", "से", "aas paas", "आस पास"
  ];
  
  // Build a regex that matches these words as whole words
  const stopWordsRegex = new RegExp(`\\b(${stopWords.join("|")})\\b`, "gi");
  
  let cleanQuery = query.toLowerCase()
    .replace(stopWordsRegex, "")
    // Also remove Marathi stop words without boundaries just in case (since \b doesn't always work perfectly for Marathi)
    .replace(/मध्ये|जवळ|च्या|में|से/g, "") 
    .replace(/[^a-zA-Z\u0900-\u097F\s]/g, "") // Remove all punctuation, keep English + Devanagari letters
    .trim();

  logger.info({ cleanQuery }, "Cleaned query string");

  if (cleanQuery === "") {
    return null; // Don't default to Pandharpur, force the agent to ask the user.
  }

  // Predefined exact locations to avoid spelling/Nominatim issues and ensure high reliability
  const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number }> = {
    "latur": { lat: 18.4088, lng: 76.5604 },
    "karmala": { lat: 18.4069, lng: 75.1979 },
    "solapur": { lat: 17.6599, lng: 75.9064 },
    "pandharpur": { lat: 17.6772, lng: 75.3236 },
    "wakhari": { lat: 17.7121, lng: 75.2929 },
    "pune": { lat: 18.5204, lng: 73.8567 },
    "alandi": { lat: 18.6756, lng: 73.8966 },
    "dehu": { lat: 18.7171, lng: 73.7845 },
    "baramati": { lat: 18.1524, lng: 74.5775 },
    "indapur": { lat: 18.1180, lng: 75.0256 },
    "saswad": { lat: 18.3411, lng: 74.0298 },
    "jejuri": { lat: 18.2755, lng: 74.1610 },
    "phaltan": { lat: 17.9890, lng: 74.4283 },
    "nira": { lat: 18.1136, lng: 74.1843 }
  };

  // FAST PATH: Explicit exact match for known cities
  for (const [city, coords] of Object.entries(KNOWN_LOCATIONS)) {
    if (cleanQuery.includes(city) || (city === "pandharpur" && (cleanQuery.includes("pandar") || cleanQuery.includes("पंढ")))) {
      logger.info({ query, city }, "Matched known predefined city location");
      return coords;
    }
  }

  // If not in known list, search Nominatim using the clean query
  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: cleanQuery + ", Maharashtra, India",
        format: "json",
        limit: 1,
        countrycodes: "in",
      },
      headers: {
        // Nominatim requires a valid user agent
        "User-Agent": "VisavaVoiceAgent/1.0",
      },
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    }
    
    return null;
  } catch (error) {
    logger.error({ err: error, query }, "Failed to resolve location via Nominatim");
    return null;
  }
}
