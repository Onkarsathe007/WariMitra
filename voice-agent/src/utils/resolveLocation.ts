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

  // If query is missing, empty, or very generic, default to Pandharpur center to avoid Nominatim hangs
  if (!query || query.trim() === "" || query.toLowerCase().includes("places") || query.toLowerCase().includes("nearby")) {
    logger.info({ query }, "Generic or empty query provided. Defaulting to Pandharpur (Fast Path)");
    return { lat: 17.6772, lng: 75.3236 };
  }

  // FAST PATH: Fuzzy match for Pandharpur to bypass slow/rate-limited Nominatim API
  const lowerQuery = query.toLowerCase();
  if (
    lowerQuery.includes("pandhar") || 
    lowerQuery.includes("pandar") || 
    lowerQuery.includes("vendor") || 
    lowerQuery.includes("pendr") || 
    lowerQuery.includes("wakhari") ||
    lowerQuery.includes("पंढरपूर") ||
    lowerQuery.includes("पंढपुर") ||
    lowerQuery.includes("पंढर") ||
    lowerQuery.includes("वाखरी")
  ) {
    logger.info({ query }, "Fuzzy matched Pandharpur (Fast Path)");
    return { lat: 17.6772, lng: 75.3236 };
  }

  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: query + ", Maharashtra, India",
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
