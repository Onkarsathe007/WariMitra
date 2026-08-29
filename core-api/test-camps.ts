import mongoose from "mongoose";
import { env } from "./src/config/env";
import { Camp } from "./src/models/Camp";

async function check() {
  await mongoose.connect(env.MONGODB_URI);
  try {
    const indexes = await Camp.collection.indexes();
    console.log("Indexes on Camps:", indexes);
  } catch(e: any) {
    console.log("Error checking indexes (collection might not exist):", e.message);
  }
  process.exit(0);
}
check();
