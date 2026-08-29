import mongoose from "mongoose";
import { env } from "../src/config/env";
import { User } from "../src/models/User";
import { Service } from "../src/models/Service";

async function seedDatabase() {
  console.log("Connecting to MongoDB Atlas...");
  console.log("URI:", env.MONGODB_URI.replace(/:[^:]*@/, ":****@")); // hide password

  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("✅ Successfully connected to MongoDB");

    // 1. Create a dummy operator user if one doesn't exist
    let operator = await User.findOne({ phoneNumber: "+919999999999" });
    if (!operator) {
      operator = await User.create({
        name: "Admin Operator",
        phoneNumber: "+919999999999",
        role: "admin",
        verified: true
      });
      console.log("Created admin operator user:", operator._id);
    } else {
      console.log("Found existing operator user:", operator._id);
    }

    // 2. Clear existing services to avoid duplicates during testing (optional but good for clean demo)
    await Service.deleteMany({});
    console.log("Cleared existing services.");

    // Coordinates for Vitthal Rukmini Mandir, Pandharpur: ~ 17.6787 N, 75.3236 E
    const mandirLng = 75.3236;
    const mandirLat = 17.6787;

    // 3. Insert Food Camp near Mandir
    const foodCamp = await Service.create({
      name: "Gajanan Maharaj Annachhatra",
      type: "food",
      location: {
        type: "Point",
        coordinates: [mandirLng + 0.001, mandirLat + 0.001] // Slightly offset
      },
      contactPhone: "+918888888881",
      description: "Free meals for Varkaris near the Mandir.",
      available: true,
      operator: operator._id,
      verified: true
    });
    console.log("✅ Created Food Camp:", foodCamp.name);

    // 4. Insert Accommodation near Mandir
    const shelter = await Service.create({
      name: "Vitthal Rukmini Bhakta Niwas",
      type: "shelter",
      location: {
        type: "Point",
        coordinates: [mandirLng - 0.002, mandirLat - 0.001] // Slightly offset
      },
      contactPhone: "+918888888882",
      description: "Safe and clean accommodation for pilgrims.",
      available: true,
      operator: operator._id,
      verified: true
    });
    console.log("✅ Created Shelter:", shelter.name);

    // 5. Ensure indexes are built before querying (especially 2dsphere)
    console.log("Building MongoDB indexes...");
    await Service.createIndexes();

    console.log("\nTesting $near Geospatial Query...");
    
    // Search within 5km of Mandir
    const radiusInMeters = 5000;
    
    const results = await Service.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [mandirLng, mandirLat] },
          $maxDistance: radiusInMeters
        }
      },
      available: true
    });

    console.log(`Found ${results.length} services within 5km of the Mandir!`);
    results.forEach((s, idx) => {
      console.log(`${idx + 1}. [${s.type}] ${s.name} (Phone: ${s.contactPhone})`);
    });

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
    process.exit(0);
  }
}

seedDatabase();
