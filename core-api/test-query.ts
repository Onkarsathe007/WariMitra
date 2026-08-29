import mongoose from "mongoose";
import { env } from "./src/config/env";
import { Service } from "./src/models/Service";

async function test() {
  await mongoose.connect(env.MONGODB_URI);
  try {
    const filter = {
      type: "shelter",
      available: "true",
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [75.3236, 17.6772] },
          $maxDistance: 5000,
        },
      }
    };
    console.log("Running filter:", JSON.stringify(filter, null, 2));
    const results = await Service.find(filter).sort({ createdAt: -1 });
    console.log("Success! Found:", results.length);
  } catch (err: any) {
    console.log("ERROR MESSAGE:", err.message);
    console.log("ERROR CODE:", err.code);
    console.log("ERROR CODENAME:", err.codeName);
  }
  process.exit(0);
}

test();
