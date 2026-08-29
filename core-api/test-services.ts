import mongoose from "mongoose";
import { env } from "./src/config/env";
import { Service } from "./src/models/Service";

async function check() {
  await mongoose.connect(env.MONGODB_URI);
  try {
    const indexes = await Service.collection.indexes();
    console.log("Indexes on Services:", indexes);
  } catch(e: any) {
    console.log("Error checking indexes:", e.message);
  }
  process.exit(0);
}
check();
