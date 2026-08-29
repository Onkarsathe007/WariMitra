import axios from "axios";
import { logger } from "../utils/logger";

export async function getWalkingDirections(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<string[]> {
  try {
    // We use Open Source Routing Machine (OSRM) for fast, free routing
    const url = `http://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${endLng},${endLat}?steps=true`;
    
    const response = await axios.get(url, { timeout: 3000 });
    
    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const steps = route.legs[0].steps;
      
      const instructions: string[] = [];
      let totalDistance = 0;
      
      steps.forEach((step: any, index: number) => {
        // Skip the very last "arrive at destination" step if it's redundant, or keep it.
        const modifier = step.maneuver.modifier; // e.g., 'left', 'right', 'straight'
        const type = step.maneuver.type; // e.g., 'turn', 'depart', 'arrive'
        const name = step.name; // street name
        const dist = Math.round(step.distance);
        
        totalDistance += dist;

        if (type === 'depart') {
          instructions.push(`Start walking towards ${name || 'the road'} for ${dist} meters.`);
        } else if (type === 'arrive') {
          instructions.push(`You have arrived at your destination.`);
        } else if (type === 'turn') {
          instructions.push(`Take a ${modifier} turn onto ${name || 'the next road'} and walk for ${dist} meters.`);
        } else {
          // catch all for roundabouts, forks, etc.
          instructions.push(`${step.maneuver.type} ${modifier ? modifier : ''} onto ${name || 'the road'} and go for ${dist} meters.`);
        }
      });

      // To keep the voice prompt concise, we can summarize if there are too many steps
      if (instructions.length > 4) {
        return [
          `Total distance is ${totalDistance} meters.`,
          instructions[0],
          instructions[1],
          `Continue following the main road.`,
          instructions[instructions.length - 1]
        ];
      }

      return instructions;
    }
    
    return [];
  } catch (error) {
    logger.error({ err: error, startLat, endLat }, "Failed to get OSRM directions");
    return [];
  }
}
